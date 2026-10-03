import { useCallback, useState } from "react";

// STUB — Claude Code will implement the real session (gateway, WebSockets, Realtime, ElevenAgents).

export type SessionStatus = "listening" | "asking" | "reviewing" | "debrief" | "offrecord";
export type SessionPhase = "idle" | "capture" | "reviewing" | "debrief";

export interface TranscriptTurn {
  id: string;
  role: "agent" | "user";
  text: string;
  t_ms: number;
}

const MOCK_TRANSCRIPT: TranscriptTurn[] = [
  { id: "1", role: "agent", text: "Hi, I'm Sidekik. Just work as you normally would — I'll ask a question now and then.", t_ms: 0 },
  { id: "2", role: "user", text: "Okay, I'm opening invoice 4471 from Präzisionswerk Ulm.", t_ms: 8200 },
  { id: "3", role: "agent", text: "You changed the cost center from 4711 to 0400. What made you do that?", t_ms: 31500 },
];

export function useSidekikSession(_sid: string) {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [offRecord, setOffRecord] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);

  const status: SessionStatus = offRecord
    ? "offrecord"
    : phase === "reviewing"
      ? "reviewing"
      : phase === "debrief"
        ? "debrief"
        : transcript.at(-1)?.role === "agent" && transcript.length > 1
          ? "asking"
          : "listening";

  const questionsAsked = transcript.filter((t) => t.role === "agent" && t.text.trim().endsWith("?")).length;

  const start = useCallback(() => {
    setPhase("capture");
    setTranscript(MOCK_TRANSCRIPT);
  }, []);

  const toggleOffRecord = useCallback(() => setOffRecord((v) => !v), []);

  const taskDone = useCallback(() => {
    setPhase("reviewing");
    setTimeout(() => setPhase("debrief"), 2500);
  }, []);

  return { status, transcript, questionsAsked, offRecord, phase, start, toggleOffRecord, taskDone };
}
