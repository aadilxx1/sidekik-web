import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startReplay, type ReplayStarted } from "@/lib/api";
import { subscribeAgentCommands } from "@/session/adapters";
import { SessionEngine, type GatewayClient, type StartConversation } from "@/session/engine";
import { playTurns, type StoredTurn } from "@/session/replay";

// Ticket 11: replay mode. A recorded session plays back without a microphone, screen or live
// vendor calls: the gateway re-broadcasts its agent commands, and the page plays its stored turns.

export type ReplayPhase = "idle" | "starting" | "playing" | "finished" | "error";

// Nothing in a replay talks to the gateway's session API or to ElevenLabs.
const replayGateway: GatewayClient = {
  consent: async () => {},
  setOffRecord: async () => {},
  taskDone: async () => {},
  end: async () => {},
};
const silentConversation: StartConversation = async () => ({
  sendUserMessage: () => {},
  sendContextualUpdate: () => {},
  setMicMuted: () => {},
  endSession: async () => {},
});

const emptySubscribe = () => () => {};

export function useReplay(originalSid: string, kind: "capture" | "tutor") {
  const [phase, setPhase] = useState<ReplayPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<ReplayStarted | null>(null);
  const [engine, setEngine] = useState<SessionEngine | null>(null);
  const [turns, setTurns] = useState<StoredTurn[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const cleanups = useRef<(() => void)[]>([]);

  const stop = useCallback(() => {
    cleanups.current.forEach((c) => c());
    cleanups.current = [];
  }, []);
  useEffect(() => stop, [stop]);

  const start = useCallback(
    async (speed: number) => {
      stop();
      setPhase("starting");
      setError(null);
      setTurns([]);
      setElapsedMs(0);
      try {
        const { data: stored, error: turnsError } = await supabase
          .from("transcript_turns")
          .select("id, role, text_redacted, t_ms")
          .eq("session_id", originalSid)
          .order("t_ms");
        if (turnsError) throw turnsError;

        const started = await startReplay(originalSid, speed);
        const e = new SessionEngine(
          {
            session: {
              session_id: started.session_id,
              sk_token: started.sk_token,
              el: { conversation_token: "", agent_id: "", dynamic_variables: {} },
              ingest_url: "",
            },
            kind,
            language: "en",
          },
          {
            gateway: replayGateway,
            startConversation: silentConversation,
            openClientSocket: () => ({ send: () => false, close: () => {} }),
            subscribeCommands: (onCommand) => subscribeAgentCommands(started.session_id, onCommand),
          },
        );
        e.observe();
        setEngine(e);
        setInfo(started);
        setPhase("playing");

        const t0 = Date.now();
        const cancelTurns = playTurns(
          (stored ?? []).map((t) => ({
            id: t.id,
            role: t.role === "agent" ? "agent" : "user",
            text: t.text_redacted,
            t_ms: t.t_ms,
          })),
          speed,
          (turn) => setTurns((prev) => [...prev, turn]),
        );
        const tick = setInterval(() => setElapsedMs(Date.now() - t0), 250);
        // The gateway ends the replay session right after its last event.
        const done = setTimeout(() => {
          clearInterval(tick);
          setElapsedMs(started.duration_ms);
          setPhase("finished");
        }, started.duration_ms + 1500);
        cleanups.current.push(
          cancelTurns,
          () => clearInterval(tick),
          () => clearTimeout(done),
          () => void e.end(),
        );
      } catch (err) {
        setError((err as Error).message);
        setPhase("error");
      }
    },
    [originalSid, kind, stop],
  );

  const state = useSyncExternalStore(
    engine?.subscribe ?? emptySubscribe,
    () => engine?.getState() ?? null,
    () => null,
  );

  return {
    phase,
    error,
    info,
    state,
    transcript: turns,
    elapsedMs,
    durationMs: info?.duration_ms ?? 0,
    start,
    dismissReplay: () => engine?.dismissReplay(),
    dismissIntervention: () => engine?.dismissIntervention(),
  };
}
