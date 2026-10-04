// Cost roll-ups for /costs. cost_ledger holds what each vendor actually cost per session;
// decisions_log holds, per Jev decision, its cost and what the same decision would have
// cost on an LLM (counterfactual_usd). Postgres numeric may arrive as a string, hence num().

export interface LedgerRow {
  session_id: string | null;
  vendor: string;
  cost_usd: number | string;
}
export interface DecisionCostRow {
  session_id: string | null;
  cost_usd: number | string | null;
  counterfactual_usd: number | string | null;
}

export interface SessionCost {
  session_id: string;
  total_usd: number;
  by_vendor: Record<string, number>;
  jev_usd: number;
  llm_only_usd: number;
}

export interface CostSummary {
  sessions: SessionCost[];
  total_usd: number;
  jev_usd: number;
  llm_only_usd: number;
  /** How many times cheaper Jev-gated decisions were than LLM-only; null when there's nothing to compare. */
  savings_factor: number | null;
}

const num = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export function summarizeCosts(ledger: LedgerRow[], decisions: DecisionCostRow[]): CostSummary {
  const bySession = new Map<string, SessionCost>();
  const session = (id: string) => {
    let s = bySession.get(id);
    if (!s) {
      s = { session_id: id, total_usd: 0, by_vendor: {}, jev_usd: 0, llm_only_usd: 0 };
      bySession.set(id, s);
    }
    return s;
  };

  let total = 0;
  for (const row of ledger) {
    const cost = num(row.cost_usd);
    total += cost;
    if (!row.session_id) continue;
    const s = session(row.session_id);
    s.total_usd += cost;
    s.by_vendor[row.vendor] = (s.by_vendor[row.vendor] ?? 0) + cost;
  }

  let jev = 0;
  let llmOnly = 0;
  for (const row of decisions) {
    const cost = num(row.cost_usd);
    const counterfactual = num(row.counterfactual_usd);
    jev += cost;
    llmOnly += counterfactual;
    if (!row.session_id) continue;
    const s = session(row.session_id);
    s.jev_usd += cost;
    s.llm_only_usd += counterfactual;
  }

  return {
    sessions: [...bySession.values()].sort((a, b) => b.total_usd - a.total_usd),
    total_usd: total,
    jev_usd: jev,
    llm_only_usd: llmOnly,
    savings_factor: jev > 0 && llmOnly > 0 ? llmOnly / jev : null,
  };
}

export function formatUsd(v: number): string {
  if (v === 0) return "$0";
  return v < 0.01 ? `$${v.toFixed(4)}` : `$${v.toFixed(2)}`;
}
