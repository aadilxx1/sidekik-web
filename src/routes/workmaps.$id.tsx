import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Play, Scale, ChevronDown, ChevronRight, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getClipUrl, exportAgentRules } from "@/lib/api";
import { ReplayModal } from "@/components/ReplayModal";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/workmaps/$id")({
  head: () => ({
    meta: [
      { title: "Work Map | sidekik" },
      { name: "description", content: "Steps, decisions, the expert's reasons and guardrails for this workflow." },
      { property: "og:title", content: "Work Map | sidekik" },
      { property: "og:description", content: "Steps, decisions, the expert's reasons and guardrails for this workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkMapPage,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  debrief: { label: "In debrief", cls: "bg-accent text-accent-foreground" },
  in_debrief: { label: "In debrief", cls: "bg-accent text-accent-foreground" },
  confirmed: { label: "Confirmed", cls: "bg-primary/10 text-primary" },
  published: { label: "Published", cls: "bg-primary text-primary-foreground" },
};

export function fmtMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function momentMs(m: unknown): number | null {
  if (!m || typeof m !== "object") return null;
  const o = m as Record<string, unknown>;
  const v = o["t_ms"] ?? o["start_t_ms"] ?? o["t"];
  return typeof v === "number" ? v : null;
}

function useWorkMap(id: string) {
  return useQuery({
    queryKey: ["workmap", id],
    queryFn: async () => {
      const { data: map, error } = await supabase
        .from("work_maps")
        .select("id, version, status, language, workflow_id, expert_id, workflows!work_maps_workflow_id_fkey(name), experts(display_name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!map) return null;
      const [steps, guardrails, evidence, items] = await Promise.all([
        supabase.from("work_map_steps").select("*").eq("work_map_id", id).order("ordinal"),
        supabase.from("guardrails").select("*").eq("work_map_id", id),
        supabase.from("step_evidence").select("*").eq("work_map_id", id).order("t_ms"),
        supabase.from("open_items").select("id, text, status, importance, anchor_t_ms").eq("work_map_id", id).order("importance", { ascending: false }),
      ]);
      return {
        map,
        steps: steps.data ?? [],
        guardrails: guardrails.data ?? [],
        evidence: evidence.data ?? [],
        items: items.data ?? [],
      };
    },
  });
}

type Data = NonNullable<ReturnType<typeof useWorkMap>["data"]>;
type Step = Data["steps"][number];
type Guardrail = Data["guardrails"][number];

function WorkMapPage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useWorkMap(id);
  const [open, setOpen] = useState<string | null>(null);
  const [replay, setReplay] = useState<{ title: string; src: string | null } | null>(null);
  const [guard, setGuard] = useState<Guardrail | null>(null);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>;
  if (!data) return <div className="p-8 text-sm">Work Map not found.</div>;

  const { map, steps, guardrails, evidence, items } = data;
  const wf = map.workflows as unknown as { name: string } | null;
  const ex = map.experts as unknown as { display_name: string } | null;
  const expertName = ex?.display_name ?? "Expert";
  const status = STATUS[map.status] ?? { label: map.status, cls: "bg-muted text-muted-foreground" };

  async function play(step: Step) {
    setReplay({ title: `${expertName}'s moment: ${step.title}`, src: null });
    try {
      const src = await getClipUrl(id, step.id);
      setReplay({ title: `${expertName}'s moment: ${step.title}`, src });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function onExport() {
    try {
      const rules = await exportAgentRules(id);
      const blob = new Blob([JSON.stringify(rules, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `workmap-${id}-rules.json`;
      a.click();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Link to="/workmaps" className="text-sm text-muted-foreground hover:underline">← Work Maps</Link>
      <header className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{wf?.name ?? "Work Map"}</h1>
        <span className="text-sm text-muted-foreground">{expertName} · v{map.version}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}>{status.label}</span>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <ol className="relative space-y-3 border-l pl-6">
          {steps.length === 0 && <li className="text-sm text-muted-foreground">No steps yet.</li>}
          {steps.map((s, i) => {
            const expanded = open === s.id;
            const ms = momentMs(s.screen_moment) ?? evidence.find((e) => e.step_id === s.id)?.t_ms ?? null;
            const stepGuards = guardrails.filter((g) => evidence.some((e) => e.step_id === s.id && e.guardrail_id === g.id));
            return (
              <li key={s.id} className="relative">
                <span className={`absolute -left-[31px] top-3 h-3 w-3 rounded-full border-2 border-background ${expanded ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="rounded-lg border">
                  <button onClick={() => setOpen(expanded ? null : s.id)} className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/50">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="text-sm">
                      <span className="text-muted-foreground">Step {i + 1} of {steps.length}: </span>
                      <span className="font-medium">{s.title}</span>
                    </span>
                    {s.is_judgment_call && (
                      <span title="Judgment call" className="ml-auto flex items-center gap-1 text-xs text-primary">
                        <Scale className="h-4 w-4" /> Judgment call
                      </span>
                    )}
                  </button>
                  {expanded && (
                    <div className="space-y-4 border-t px-4 py-4 text-sm">
                      <Field label="Screen moment">
                        <div className="flex items-center gap-3">
                          <span className="font-mono">{fmtMs(ms)}</span>
                          <Button size="sm" variant="outline" onClick={() => play(s)}><Play className="mr-1 h-3.5 w-3.5" />Play</Button>
                        </div>
                      </Field>
                      <Field label="Decision"><p>{s.decision}</p></Field>
                      {s.reason_quote && (
                        <Field label="Reason">
                          <blockquote className="border-l-2 border-primary pl-3 italic">“{s.reason_quote}”</blockquote>
                          {s.reason_quote_en && s.reason_quote_en !== s.reason_quote && (
                            <p className="mt-1 pl-3 text-muted-foreground">“{s.reason_quote_en}”</p>
                          )}
                          {s.source_label && <p className="mt-1 pl-3 text-xs text-muted-foreground">— {s.source_label}</p>}
                        </Field>
                      )}
                      <Field label="Guardrails">
                        {stepGuards.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {stepGuards.map((g) => (
                              <button key={g.id} onClick={() => setGuard(g)} className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive hover:bg-destructive/20">
                                {g.key}
                              </button>
                            ))}
                          </div>
                        )}
                      </Field>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="space-y-4">
          <Button className="w-full" onClick={onExport}><Download className="mr-2 h-4 w-4" />Export agent rules</Button>
          <section className="rounded-lg border">
            <h2 className="border-b px-4 py-2 text-sm font-semibold">Open items ({items.length})</h2>
            <ul className="divide-y text-sm">
              {items.length === 0 && <li className="px-4 py-3 text-muted-foreground">Nothing open.</li>}
              {items.map((it) => (
                <li key={it.id} className="px-4 py-2">
                  <p>{it.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{it.status}{it.anchor_t_ms != null ? ` · ${fmtMs(it.anchor_t_ms)}` : ""}</p>
                </li>
              ))}
            </ul>
          </section>
          {guardrails.length > 0 && (
            <section className="rounded-lg border">
              <h2 className="border-b px-4 py-2 text-sm font-semibold">All guardrails</h2>
              <div className="flex flex-wrap gap-2 p-3">
                {guardrails.map((g) => (
                  <button key={g.id} onClick={() => setGuard(g)} className="rounded-full border px-2.5 py-0.5 text-xs hover:bg-muted">{g.key}</button>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {replay && <ReplayModal title={replay.title} src={replay.src} onClose={() => setReplay(null)} />}
      {guard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setGuard(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-lg bg-background p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{guard.key}</h2>
              <button onClick={() => setGuard(null)} className="rounded-md px-2 py-1 text-sm hover:bg-accent">Close</button>
            </div>
            <p className="mt-1 text-xs uppercase text-muted-foreground">{guard.kind}</p>
            <p className="mt-3 text-sm">{guard.description}</p>
            <blockquote className="mt-3 border-l-2 border-primary pl-3 text-sm italic">“{guard.quote}”</blockquote>
            {guard.quote_en && guard.quote_en !== guard.quote && <p className="mt-1 pl-3 text-sm text-muted-foreground">“{guard.quote_en}”</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
