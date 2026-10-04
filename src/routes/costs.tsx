import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatUsd, summarizeCosts } from "@/lib/costs";

export const Route = createFileRoute("/costs")({
  head: () => ({
    meta: [
      { title: "Costs | sidekik" },
      {
        name: "description",
        content: "Cost per Sidekik session, and Jev-gated decisions vs an LLM-only approach.",
      },
      { property: "og:title", content: "Costs | sidekik" },
      {
        property: "og:description",
        content: "Cost per Sidekik session, and Jev-gated decisions vs an LLM-only approach.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CostsPage,
});

function CostsPage() {
  const { membership } = useAuth();
  const orgId = membership?.orgId;
  const { data, isLoading, error } = useQuery({
    queryKey: ["costs", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [ledger, decisions, sessions] = await Promise.all([
        supabase.from("cost_ledger").select("session_id, vendor, cost_usd").eq("org_id", orgId!),
        supabase
          .from("decisions_log")
          .select("session_id, cost_usd, counterfactual_usd")
          .eq("org_id", orgId!),
        supabase.from("sessions").select("id, kind, started_at").eq("org_id", orgId!),
      ]);
      const firstError = [ledger, decisions, sessions].find((r) => r.error)?.error;
      if (firstError) throw firstError;
      return {
        summary: summarizeCosts(ledger.data ?? [], decisions.data ?? []),
        sessions: new Map((sessions.data ?? []).map((s) => [s.id, s])),
      };
    },
  });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>;
  if (!data) return null;
  const { summary, sessions } = data;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Costs</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card
          label="Total spend"
          value={formatUsd(summary.total_usd)}
          note="All vendors, all sessions"
        />
        <Card
          label="Jev-gated decisions"
          value={formatUsd(summary.jev_usd)}
          note="What our decisions actually cost"
        />
        <Card
          label="Same decisions, LLM-only"
          value={formatUsd(summary.llm_only_usd)}
          note={
            summary.savings_factor
              ? `Jev is ${summary.savings_factor.toFixed(1)}× cheaper`
              : "No decisions logged yet"
          }
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Session</th>
              <th className="px-4 py-2">By vendor</th>
              <th className="px-4 py-2 text-right">Jev / LLM-only</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {summary.sessions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                  No costs recorded yet.
                </td>
              </tr>
            )}
            {summary.sessions.map((s) => {
              const meta = sessions.get(s.session_id);
              return (
                <tr key={s.session_id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-2">
                    <Link
                      to="/sessions/$id"
                      params={{ id: s.session_id }}
                      className="text-primary hover:underline"
                    >
                      {meta ? new Date(meta.started_at).toLocaleString() : s.session_id.slice(0, 8)}
                    </Link>
                    {meta && (
                      <span className="ml-2 text-xs capitalize text-muted-foreground">
                        {meta.kind}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {Object.entries(s.by_vendor)
                      .map(([vendor, usd]) => `${vendor} ${formatUsd(usd)}`)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs">
                    {formatUsd(s.jev_usd)} / {formatUsd(s.llm_only_usd)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{formatUsd(s.total_usd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
