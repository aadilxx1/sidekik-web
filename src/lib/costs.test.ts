import { describe, expect, it } from "vitest";
import { formatUsd, summarizeCosts } from "./costs";

describe("summarizeCosts", () => {
  it("totals vendor costs per session and compares Jev-gated decisions with LLM-only", () => {
    const summary = summarizeCosts(
      [
        { session_id: "s1", vendor: "elevenlabs", cost_usd: 0.8 },
        { session_id: "s1", vendor: "typesafe", cost_usd: "0.002" },
        { session_id: "s2", vendor: "anthropic", cost_usd: 0.05 },
        { session_id: null, vendor: "anthropic", cost_usd: 0.01 },
      ],
      [
        { session_id: "s1", cost_usd: 0.001, counterfactual_usd: 0.02 },
        { session_id: "s1", cost_usd: "0.001", counterfactual_usd: "0.02" },
        { session_id: "s2", cost_usd: null, counterfactual_usd: null },
      ],
    );
    expect(summary.total_usd).toBeCloseTo(0.862);
    expect(summary.jev_usd).toBeCloseTo(0.002);
    expect(summary.llm_only_usd).toBeCloseTo(0.04);
    expect(summary.savings_factor).toBeCloseTo(20);

    const s1 = summary.sessions.find((s) => s.session_id === "s1")!;
    expect(s1.total_usd).toBeCloseTo(0.802);
    expect(s1.by_vendor).toEqual({ elevenlabs: 0.8, typesafe: 0.002 });
    expect(s1.llm_only_usd).toBeCloseTo(0.04);
    expect(summary.sessions[0]?.session_id).toBe("s1");
  });

  it("has no savings factor without decisions", () => {
    expect(summarizeCosts([], []).savings_factor).toBeNull();
  });
});

describe("formatUsd", () => {
  it("keeps sub-cent amounts readable", () => {
    expect(formatUsd(0)).toBe("$0");
    expect(formatUsd(0.0023)).toBe("$0.0023");
    expect(formatUsd(1.234)).toBe("$1.23");
  });
});
