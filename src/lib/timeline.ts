// Merges a session's screen events, transcript turns, questions, Jev decisions and
// off-record spans into one list ordered by t_ms (ms since session start) for /sessions/$id.

export interface ScreenEventRow {
  id: string;
  t_ms: number;
  type: string;
  field: string | null;
  before_val: string | null;
  after_val: string | null;
  source: string;
  event_class: string | null;
}
export interface TurnRow {
  id: string;
  t_ms: number;
  role: string;
  text_redacted: string;
  off_record: boolean;
}
export interface QuestionRow {
  id: string;
  created_t_ms: number;
  asked_t_ms: number | null;
  qtype: string;
  text: string;
  status: string;
}
export interface DecisionRow {
  id: string;
  created_at: string;
  decision: string;
  answer: unknown;
  confidence: number | null;
  provider: string;
  escalated: boolean;
  latency_ms: number;
}
export interface OffRecordRow {
  id: string;
  start_t_ms: number;
  end_t_ms: number | null;
}

export type TimelineItem =
  | { kind: "screen"; id: string; t_ms: number; row: ScreenEventRow }
  | { kind: "turn"; id: string; t_ms: number; row: TurnRow }
  | { kind: "question"; id: string; t_ms: number; row: QuestionRow }
  | { kind: "decision"; id: string; t_ms: number; row: DecisionRow }
  | { kind: "offrecord"; id: string; t_ms: number; end_t_ms: number | null };

export interface TimelineInput {
  startedAt: string;
  screen: ScreenEventRow[];
  turns: TurnRow[];
  questions: QuestionRow[];
  decisions: DecisionRow[];
  offRecord: OffRecordRow[];
}

// Within the same millisecond: an off-record band first, then what happened on screen,
// then what was said, then the decision and the question it produced.
const ORDER: Record<TimelineItem["kind"], number> = {
  offrecord: 0,
  screen: 1,
  turn: 2,
  decision: 3,
  question: 4,
};

export function buildTimeline(input: TimelineInput): TimelineItem[] {
  const start = Date.parse(input.startedAt);
  const items: TimelineItem[] = [
    ...input.screen.map((row) => ({ kind: "screen" as const, id: row.id, t_ms: row.t_ms, row })),
    ...input.turns.map((row) => ({ kind: "turn" as const, id: row.id, t_ms: row.t_ms, row })),
    // A question belongs on the timeline where it was asked; candidates that were never asked sit where they were drafted.
    ...input.questions.map((row) => ({
      kind: "question" as const,
      id: row.id,
      t_ms: row.asked_t_ms ?? row.created_t_ms,
      row,
    })),
    // decisions_log has no t_ms column; derive it from the wall clock.
    ...input.decisions.map((row) => ({
      kind: "decision" as const,
      id: row.id,
      t_ms: Math.max(0, Date.parse(row.created_at) - start),
      row,
    })),
    ...input.offRecord.map((row) => ({
      kind: "offrecord" as const,
      id: row.id,
      t_ms: row.start_t_ms,
      end_t_ms: row.end_t_ms,
    })),
  ];
  return items.sort((a, b) => a.t_ms - b.t_ms || ORDER[a.kind] - ORDER[b.kind]);
}

/** "03:12" from milliseconds since session start. */
export function formatTms(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
