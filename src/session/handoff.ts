// Hands the POST /v1/sessions answer from the page that created the session to the room route
// (/capture/:sid, /tutor/:sid) within the same tab. Kept in sessionStorage, never localStorage:
// it holds the session's tokens.
import type { CreateSessionResponse } from "./contract";

export interface SessionStart {
  response: CreateSessionResponse;
  kind: "capture" | "tutor";
  language: string;
  /** Epoch ms when the gateway answered; t_ms counts from here. */
  startedAt: number;
}

const key = (sessionId: string) => `sidekik:session:${sessionId}`;

export function saveSessionStart(start: SessionStart) {
  try {
    sessionStorage.setItem(key(start.response.session_id), JSON.stringify(start));
  } catch {
    // Private mode or storage full: the room will ask to start a new session.
  }
}

export function loadSessionStart(sessionId: string): SessionStart | null {
  try {
    const raw = sessionStorage.getItem(key(sessionId));
    if (!raw) return null;
    const start = JSON.parse(raw) as SessionStart;
    return start.response?.session_id === sessionId ? start : null;
  } catch {
    return null;
  }
}

export function clearSessionStart(sessionId: string) {
  try {
    sessionStorage.removeItem(key(sessionId));
  } catch {
    // ignore
  }
}
