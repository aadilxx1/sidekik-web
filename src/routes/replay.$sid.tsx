import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ReplayModal } from "@/components/ReplayModal";
import { supabase } from "@/integrations/supabase/client";
import { useReplay } from "@/hooks/useReplay";
import { formatTms } from "@/lib/timeline";
import { REPLAY_SPEEDS } from "@/session/replay";
import { mapMastery } from "@/session/tutorView";

export const Route = createFileRoute("/replay/$sid")({
  head: () => ({
    meta: [
      { title: "Replay | sidekik" },
      {
        name: "description",
        content:
          "Play back a recorded Sidekik session without a microphone, screen or live AI calls.",
      },
      { property: "og:title", content: "Replay | sidekik" },
      {
        property: "og:description",
        content:
          "Play back a recorded Sidekik session without a microphone, screen or live AI calls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReplayPage,
});

function ReplayPage() {
  const { sid } = Route.useParams();
  const original = useQuery({
    queryKey: ["replay-original", sid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, kind, mode, started_at, workflows(name)")
        .eq("id", sid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (original.isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (original.error)
    return <div className="p-8 text-sm text-destructive">{(original.error as Error).message}</div>;
  if (!original.data) return <div className="p-8 text-sm">Session not found.</div>;
  if (original.data.mode === "replay")
    return <div className="p-8 text-sm">This is already a replay.</div>;

  const workflow = original.data.workflows as unknown as { name: string } | null;
  return (
    <ReplayPlayer
      sid={sid}
      kind={original.data.kind === "tutor" ? "tutor" : "capture"}
      title={workflow?.name ?? "Session"}
      startedAt={original.data.started_at}
    />
  );
}

function ReplayPlayer({
  sid,
  kind,
  title,
  startedAt,
}: {
  sid: string;
  kind: "capture" | "tutor";
  title: string;
  startedAt: string;
}) {
  const r = useReplay(sid, kind);
  const [speed, setSpeed] = useState<number>(2);
  const s = r.state;
  const pct = r.durationMs ? Math.min(100, (r.elapsedMs / r.durationMs) * 100) : 0;
  const busy = r.phase === "starting" || r.phase === "playing";

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link
        to="/sessions/$id"
        params={{ id: sid }}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Session timeline
      </Link>
      <header className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Replay: {title} <span className="text-base font-normal capitalize">· {kind}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recorded {new Date(startedAt).toLocaleString()}. Plays back the stored events: no
            microphone, screen or live AI calls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground" htmlFor="replay-speed">
            Speed
          </label>
          <select
            id="replay-speed"
            value={speed}
            disabled={busy}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {REPLAY_SPEEDS.map((v) => (
              <option key={v} value={v}>
                {v}×
              </option>
            ))}
          </select>
          <button
            onClick={() => void r.start(speed)}
            disabled={busy}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {r.phase === "starting"
              ? "Starting…"
              : r.phase === "finished"
                ? "Replay again"
                : "Start replay"}
          </button>
        </div>
      </header>

      {r.error && (
        <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {r.error}
        </p>
      )}

      {r.phase !== "idle" && r.phase !== "error" && (
        <>
          <div className="mt-6">
            <div className="h-1.5 overflow-hidden rounded bg-muted">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTms(r.elapsedMs)} / {formatTms(r.durationMs)}
              {r.info ? ` · ${r.info.events} events` : ""}
              {r.phase === "finished" ? " · finished" : ""}
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_18rem]">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Transcript
              </h2>
              <ul className="space-y-2">
                {r.transcript.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nothing yet.</li>
                )}
                {r.transcript.map((t) => (
                  <li
                    key={t.id}
                    className={`rounded-md p-2 text-sm ${t.role === "agent" ? "bg-secondary" : "border border-border"}`}
                  >
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      {formatTms(t.t_ms)} ·{" "}
                      {t.role === "agent" ? "Sidekik" : kind === "tutor" ? "Learner" : "Expert"}
                    </span>
                    {t.text}
                  </li>
                ))}
              </ul>
            </section>

            <aside className="flex flex-col gap-4">
              {s?.offRecord && (
                <p className="rounded-full bg-destructive px-3 py-1 text-center text-xs font-semibold text-destructive-foreground">
                  OFF THE RECORD
                </p>
              )}
              <p className="text-sm">
                Questions asked: <strong>{s?.questionsAsked ?? 0}</strong>
              </p>
              {s?.screenContext && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    On screen
                  </p>
                  <p className="mt-1 font-mono text-xs">{s.screenContext}</p>
                </div>
              )}
              {s?.prediction && (
                <div className="rounded-lg border-2 border-primary p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">Predict</p>
                  <p className="mt-1 text-sm">{s.prediction.prompt}</p>
                </div>
              )}
              {s?.intervention && (
                <div
                  role="alert"
                  className="rounded-lg bg-destructive p-3 text-destructive-foreground"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide">Hold on</p>
                  <p className="mt-1 text-sm">{s.intervention.text}</p>
                </div>
              )}
              {s?.mastery && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mastery
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {mapMastery(s.mastery, []).steps.map((step) => (
                      <li key={step.step_id} className="flex justify-between gap-2">
                        <span>{step.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {step.outcome.replace("_", " ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </>
      )}

      {s?.replay && (
        <ReplayModal
          title={`Moment: ${s.replay.label}`}
          src={s.replay.clip_url}
          onClose={r.dismissReplay}
        />
      )}
    </div>
  );
}
