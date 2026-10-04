// The browser side of the engine's dependencies: ElevenLabs WebRTC, Supabase Realtime and the
// gateway's /ws/client socket. Thin on purpose; the behaviour is in engine.ts and tested there.
import { VoiceConversation } from "@elevenlabs/client";
import { supabase } from "@/integrations/supabase/client";
import { API_URL } from "@/lib/config";
import { ReconnectingSocket, type SocketStatus } from "@/lib/reconnectingSocket";
import { isAgentCommand, type AgentCommand } from "./contract";
import type { ClientSocket, StartConversation } from "./engine";

/** startSession with the gateway's token (DESIGN §4 step 4; sidekik-docs v0.3.6 changelog). */
export const startElevenLabsConversation: StartConversation = async (o) =>
  VoiceConversation.startSession({
    conversationToken: o.conversationToken,
    connectionType: "webrtc",
    dynamicVariables: o.dynamicVariables,
    overrides: { agent: { language: o.language as never } },
    clientTools: o.clientTools,
    onMessage: ({ role, message }) => o.callbacks.onMessage({ role, message }),
    onModeChange: ({ mode }) => o.callbacks.onModeChange(mode),
    onVadScore: ({ vadScore }) => o.callbacks.onVadScore(vadScore),
    onError: (message) => o.callbacks.onError(message),
    onDisconnect: () => o.callbacks.onDisconnect(),
  });

/** Agent commands: Supabase Realtime broadcast on `session:{sid}`, event `cmd` (gateway realtime.ts). */
export function subscribeAgentCommands(sessionId: string, onCommand: (cmd: AgentCommand) => void) {
  const channel = supabase
    .channel(`session:${sessionId}`)
    .on("broadcast", { event: "cmd" }, ({ payload }) => {
      if (isAgentCommand(payload)) onCommand(payload);
    })
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/** WS /ws/client/:sid?t=sk_token on the gateway, reconnecting with backoff. */
export function openGatewaySocket(
  sessionId: string,
  skToken: string,
  onStatus: (s: SocketStatus) => void,
): ClientSocket {
  const base = API_URL.replace(/^http/, "ws").replace(/\/$/, "");
  const socket = new ReconnectingSocket({
    url: () =>
      `${base}/ws/client/${encodeURIComponent(sessionId)}?t=${encodeURIComponent(skToken)}`,
    binaryType: "blob",
    onStatus,
  });
  socket.connect();
  return socket;
}
