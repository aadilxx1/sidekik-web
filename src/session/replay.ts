// Replay mode (ticket 11). The gateway re-broadcasts a recorded session's agent commands under a
// new replay session; transcript turns don't reach the page, so the page plays the original
// session's stored turns back on the same clock (t_ms / speed from when the replay started).

export interface StoredTurn {
  id: string;
  role: "user" | "agent";
  text: string;
  t_ms: number;
}

export type Schedule = (fn: () => void, ms: number) => () => void;

const defaultSchedule: Schedule = (fn, ms) => {
  const t = setTimeout(fn, ms);
  return () => clearTimeout(t);
};

/** Schedules every turn at t_ms / speed. Returns a function that cancels the rest. */
export function playTurns(
  turns: StoredTurn[],
  speed: number,
  onTurn: (turn: StoredTurn) => void,
  schedule: Schedule = defaultSchedule,
): () => void {
  const cancels = [...turns]
    .sort((a, b) => a.t_ms - b.t_ms)
    .map((turn) => schedule(() => onTurn(turn), Math.max(0, turn.t_ms / speed)));
  return () => cancels.forEach((c) => c());
}

export const REPLAY_SPEEDS = [1, 1.5, 2, 4] as const;
