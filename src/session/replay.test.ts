import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playTurns, type StoredTurn } from "./replay";

const turns: StoredTurn[] = [
  { id: "b", role: "agent", text: "Why did you change the cost center?", t_ms: 4_000 },
  { id: "a", role: "user", text: "Opening invoice 4471.", t_ms: 1_000 },
  { id: "c", role: "user", text: "Equipment over 5,000 is capex.", t_ms: 6_000 },
];

describe("playTurns", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays turns in order on the recording's clock, scaled by speed", async () => {
    const seen: string[] = [];
    playTurns(turns, 2, (t) => seen.push(t.id));
    await vi.advanceTimersByTimeAsync(499);
    expect(seen).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(seen).toEqual(["a"]);
    await vi.advanceTimersByTimeAsync(2_500);
    expect(seen).toEqual(["a", "b", "c"]);
  });

  it("stops when cancelled", async () => {
    const seen: string[] = [];
    const cancel = playTurns(turns, 1, (t) => seen.push(t.id));
    await vi.advanceTimersByTimeAsync(1_000);
    cancel();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(seen).toEqual(["a"]);
  });
});
