import { useEffect, useState, useSyncExternalStore } from "react";
import { claimAgentHost } from "@/lib/api";
import {
  openGatewaySocket,
  startElevenLabsConversation,
  subscribeAgentCommands,
} from "@/session/adapters";
import { meetingGateway, startAgentHost } from "@/session/agentHost";
import { SessionEngine } from "@/session/engine";

// Ticket 9: the live session behind /agent-host/:sid?t= (see src/session/agentHost.ts).

export type AgentHostStatus = "connecting" | "listening" | "asking" | "offrecord";

export interface AgentHostState {
  status: AgentHostStatus;
  error: string | null;
}

const emptySubscribe = () => () => {};

export function useAgentHost(sid: string, t?: string): AgentHostState {
  const [engine, setEngine] = useState<SessionEngine | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!t) {
      setStartError("This page needs the one-time link from the meeting bot.");
      return;
    }
    let active = true;
    startAgentHost(sid, t, {
      claim: claimAgentHost,
      buildEngine: (opts) =>
        new SessionEngine(opts, {
          gateway: meetingGateway,
          startConversation: startElevenLabsConversation,
          openClientSocket: (onStatus) => openGatewaySocket(sid, opts.session.sk_token, onStatus),
          subscribeCommands: (onCommand) => subscribeAgentCommands(sid, onCommand),
        }),
    })
      .then((e) => active && setEngine(e))
      .catch((err: Error) => active && setStartError(err.message));
    return () => {
      active = false;
    };
  }, [sid, t]);

  const state = useSyncExternalStore(
    engine?.subscribe ?? emptySubscribe,
    () => engine?.getState() ?? null,
    () => null,
  );

  const status: AgentHostStatus = !state
    ? "connecting"
    : state.offRecord
      ? "offrecord"
      : state.stage === "connecting" || state.stage === "awaiting_consent"
        ? "connecting"
        : state.agentMode === "speaking"
          ? "asking"
          : "listening";
  return { status, error: startError ?? state?.error ?? null };
}
