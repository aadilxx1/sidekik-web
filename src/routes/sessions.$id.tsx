import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildTimeline, formatTms, type TimelineItem } from "@/lib/timeline";

export const Route = createFileRoute("/sessions/$id")({
  head: () => ({
    meta: [
      { title: "Session timeline | sidekik" },
      {
        name: "description",
        content:
          "Everything in one session: screen events, what was said, questions and Jev decisions.",
      },
      { property: "og:title", content: "Session timeline | sidekik" },
      {
        property: "og:description",
        content:
          "Everything in one session: screen events, what was said, questions and Jev decisions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SessionPage,
});

function useSessionTimeline(id: string) {
  return useQuery({
    queryKey: ["session-timeline", id],
    queryFn: async () => {
      const { data: session, error } = await supabase
        .from("sessions")
        .select("id, kind, mode, phase, started_at, ended_at, language, workflows(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!session) return null;
      const [screen, turns, questions, decisions, offRecord] = await Promise.all([
        supabase
          .from("screen_events")
          .select("id, t_ms, type, field, before_val, after_val, source, event_class")
          .eq("session_id", id),
        supabase
          .from("transcript_turns")
          .select("id, t_ms, role, text_redacted, off_record")
          .eq("session_id", id),
        supabase
          .from("questions")
          .select("id, created_t_ms, asked_t_ms, qtype, text, status")
          .eq("session_id", id),
        supabase
          .from("decisions_log")
          .select("id, created_at, decision, answer, confidence, provider, escalated, latency_ms")
          .eq("session_id", id),
        supabase.from("off_record_spans").select("id, start_t_ms, end_t_ms").eq("session_id", id),
      ]);
      const firstError = [screen, turns, questions, decisions, offRecord].find(
        (r) => r.error,
      )?.error;
      if (firstError) throw firstError;
      return {
        session,
        items: buildTimeline({
          startedAt: session.started_at,
          screen: screen.data ?? [],
          turns: turns.data ?? [],
          questions: questions.data ?? [],
          decisions: decisions.data ?? [],
          offRecord: offRecord.data ?? [],
        }),
      };
    },
  });
}

function SessionPage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useSessionTimeline(id);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="p-8 text-sm text-destructive">{(error as Error).message}</div>;
  if (!data) return <div className="p-8 text-sm">Session not found.</div>;

  const { session, items } = data;
  const workflow = session.workflows as unknown as { name: string } | null;
  const counts = {
    decisions: items.filter((i) => i.kind === "decision").length,
    asked: items.filter((i) => i.kind === "question" && i.row.asked_t_ms != null).length,
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link to="/sessions" className="text-sm text-muted-foreground hover:underline">
        ← Sessions
      </Link>
      <header className="mt-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {workflow?.name ?? "Session"}{" "}
          <span className="text-base font-normal capitalize">· {session.kind}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(session.started_at).toLocaleString()} · {session.mode} · phase {session.phase} ·{" "}
          {counts.asked} questions asked · {counts.decisions} Jev decisions
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nothing recorded for this session yet.</p>
      ) : (
        <ol className="mt-6 space-y-2 border-l border-border pl-4">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="relative">
              <span className="absolute -left-[21px] top-2.5 size-2 rounded-full bg-border" />
              <TimelineRow item={item} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Time({ ms }: { ms: number }) {
  return (
    <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{formatTms(ms)}</span>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  switch (item.kind) {
    case "offrecord":
      return (
        <div className="flex gap-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Time ms={item.t_ms} />
          <span>
            Off the record{" "}
            {item.end_t_ms != null ? `until ${formatTms(item.end_t_ms)}` : "(still off)"}. Nothing
            was recorded.
          </span>
        </div>
      );
    case "screen": {
      const r = item.row;
      return (
        <div className="flex gap-3 px-3 py-1.5 text-sm">
          <Time ms={item.t_ms} />
          <span className="text-muted-foreground">Screen</span>
          <span>
            {r.type.replaceAll("_", " ")}
            {r.field && <span className="font-mono"> {r.field}</span>}
            {(r.before_val || r.after_val) && (
              <span className="font-mono">
                {" "}
                {r.before_val ?? "∅"} → {r.after_val ?? "∅"}
              </span>
            )}
          </span>
          {r.event_class && (
            <span className="ml-auto rounded bg-secondary px-1.5 text-xs">
              {r.event_class.replaceAll("_", " ")}
            </span>
          )}
        </div>
      );
    }
    case "turn": {
      const r = item.row;
      return (
        <div className="flex gap-3 px-3 py-1.5 text-sm">
          <Time ms={item.t_ms} />
          <span className="w-14 shrink-0 text-muted-foreground">
            {r.role === "agent" ? "Sidekik" : "Expert"}
          </span>
          <span className={r.role === "agent" ? "italic" : ""}>{r.text_redacted}</span>
        </div>
      );
    }
    case "question": {
      const r = item.row;
      return (
        <div className="flex gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <Time ms={item.t_ms} />
          <span className="shrink-0 font-medium text-primary">
            Question · {r.qtype.replaceAll("_", " ")}
          </span>
          <span>{r.text}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{r.status}</span>
        </div>
      );
    }
    case "decision": {
      const r = item.row;
      const confidence = r.confidence ?? 0;
      return (
        <div className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
          <Time ms={item.t_ms} />
          <span className="w-9 shrink-0 font-mono font-medium">{r.decision}</span>
          <span className="min-w-0 truncate font-mono text-xs">{JSON.stringify(r.answer)}</span>
          <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <span
              className="h-1.5 w-16 overflow-hidden rounded bg-muted"
              title={`confidence ${confidence.toFixed(2)}`}
            >
              <span
                className="block h-full bg-primary"
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </span>
            {confidence.toFixed(2)}
            <span className="rounded bg-secondary px-1.5 text-secondary-foreground">
              {r.provider}
            </span>
            {r.escalated && (
              <span className="rounded bg-accent px-1.5 text-accent-foreground">escalated</span>
            )}
            <span>{r.latency_ms} ms</span>
          </span>
        </div>
      );
    }
  }
}
