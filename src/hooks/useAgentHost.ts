import { useState } from "react";

// STUB — Claude Code will implement the real session (agent-host claim, ElevenAgents, Realtime commands).

export type AgentHostStatus = "connecting" | "listening" | "asking" | "offrecord";

export interface AgentHostState {
  status: AgentHostStatus;
  error: string | null;
}

export function useAgentHost(_sid: string, _t?: string): AgentHostState {
  // Mock: simulate the session coming up, then idle listening.
  const [status, setStatus] = useState<AgentHostStatus>("connecting");
  const [error] = useState<string | null>(null);

  useState(() => {
    const id = setTimeout(() => setStatus("listening"), 1200);
    return () => clearTimeout(id);
  });

  return { status, error };
}
