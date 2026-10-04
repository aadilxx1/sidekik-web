import { describe, expect, it } from "vitest";
import { buildTimeline, formatTms } from "./timeline";

const startedAt = "2026-10-04T10:00:00.000Z";
const empty = { startedAt, screen: [], turns: [], questions: [], decisions: [], offRecord: [] };

describe("buildTimeline", () => {
  it("orders everything by t_ms and derives decision time from created_at", () => {
    const items = buildTimeline({
      ...empty,
      screen: [
        {
          id: "e1",
          t_ms: 192_000,
          type: "field_changed",
          field: "cost_center",
          before_val: "4711",
          after_val: "0400",
          source: "dom",
          event_class: "judgment_call",
        },
      ],
      turns: [
        {
          id: "t1",
          t_ms: 5_000,
          role: "user",
          text_redacted: "Ich öffne 4471.",
          off_record: false,
        },
      ],
      questions: [
        {
          id: "q1",
          created_t_ms: 193_000,
          asked_t_ms: 195_000,
          qtype: "why",
          text: "Warum 0400?",
          status: "asked",
        },
      ],
      decisions: [
        {
          id: "d1",
          created_at: "2026-10-04T10:03:14.500Z",
          decision: "D1",
          answer: true,
          confidence: 0.91,
          provider: "jev",
          escalated: false,
          latency_ms: 140,
        },
      ],
    });
    expect(items.map((i) => [i.kind, i.t_ms])).toEqual([
      ["turn", 5_000],
      ["screen", 192_000],
      ["decision", 194_500],
      ["question", 195_000],
    ]);
  });

  it("places a never-asked question where it was drafted", () => {
    const [q] = buildTimeline({
      ...empty,
      questions: [
        {
          id: "q",
          created_t_ms: 40_000,
          asked_t_ms: null,
          qtype: "limit",
          text: "?",
          status: "expired",
        },
      ],
    });
    expect(q?.t_ms).toBe(40_000);
  });

  it("puts an off-record band before events at the same moment", () => {
    const items = buildTimeline({
      ...empty,
      offRecord: [{ id: "o", start_t_ms: 60_000, end_t_ms: 90_000 }],
      turns: [
        { id: "t", t_ms: 60_000, role: "agent", text_redacted: "Paused.", off_record: false },
      ],
    });
    expect(items.map((i) => i.kind)).toEqual(["offrecord", "turn"]);
  });

  it("never gives a decision a negative time", () => {
    const [d] = buildTimeline({
      ...empty,
      decisions: [
        {
          id: "d",
          created_at: "2026-10-04T09:59:59.000Z",
          decision: "D7",
          answer: false,
          confidence: 0.2,
          provider: "llm",
          escalated: true,
          latency_ms: 900,
        },
      ],
    });
    expect(d?.t_ms).toBe(0);
  });
});

describe("formatTms", () => {
  it("formats minutes and seconds", () => {
    expect(formatTms(192_345)).toBe("03:12");
    expect(formatTms(null)).toBe("—");
  });
});
