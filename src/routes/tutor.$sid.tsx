import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useTutorSession, type StepOutcome } from "@/hooks/useTutorSession";
import { ReplayModal } from "@/components/ReplayModal";

export const Route = createFileRoute("/tutor/$sid")({
  head: () => ({
    meta: [
      { title: "Tutor Room | Sidekik" },
      { name: "description", content: "Practice a workflow with Sidekik, guided by the expert's own words." },
      { property: "og:title", content: "Tutor Room | Sidekik" },
      { property: "og:description", content: "Practice a workflow with Sidekik, guided by the expert's own words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TutorRoom,
});

const OUTCOME: Record<StepOutcome, { label: string; cls: string }> = {
  independent: { label: "Independent", cls: "bg-primary text-primary-foreground" },
  prompted: { label: "Prompted", cls: "bg-secondary text-secondary-foreground border border-border" },
  corrected: { label: "Corrected", cls: "bg-destructive/15 text-destructive" },
  not_attempted: { label: "Not attempted", cls: "bg-muted text-muted-foreground" },
};

function TutorRoom() {
  const { sid } = Route.useParams();
  const t = useTutorSession(sid);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sharing, setSharing] = useState(false);
  const [replay, setReplay] = useState(false);
  const [prediction, setPrediction] = useState("");

  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setSharing(true);
      stream.getVideoTracks()[0]?.addEventListener("ended", () => setSharing(false));
      if (t.phase === "idle") t.start();
    } catch {
      /* cancelled */
    }
  };

  const openErp = () =>
    window.open(`/sandbox/erp?sid=${encodeURIComponent(sid)}&mode=tutor`, "sidekik-minierp", "width=1280,height=800");

  return (
    <div className="flex h-full">
      <section className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Tutor Room <span className="font-mono text-sm text-muted-foreground">#{sid}</span></h1>
          <div className="flex gap-2">
            <button onClick={openErp} className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">Open MiniERP</button>
            <button onClick={shareScreen} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              {sharing ? "Change shared screen" : "Share screen"}
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-muted">
          <video id="screen-preview" ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
          {!sharing && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Your shared screen will appear here</div>
          )}
        </div>
      </section>

      <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-auto border-l border-border p-4">
        {t.intervention && (
          <div role="alert" className="rounded-lg bg-destructive p-3 text-destructive-foreground">
            <p className="text-xs font-semibold uppercase tracking-wide">Hold on</p>
            <p className="mt-1 text-sm">“{t.intervention.quote}”</p>
            <p className="mt-1 text-xs opacity-80">— Sabine</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setReplay(true)} className="rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                Replay Sabine's moment
              </button>
              <button onClick={t.dismissIntervention} className="rounded-md px-3 py-1.5 text-xs underline">Got it</button>
            </div>
          </div>
        )}

        {t.currentStep && t.phase !== "done" && (
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What Sabine does here</p>
            <p className="mt-1 font-medium">{t.currentStep.title}</p>
            <p className="mt-1 text-sm italic text-muted-foreground">“{t.currentStep.expertWords}”</p>
          </div>
        )}

        {t.predictPrompt && (
          <div className="rounded-lg border-2 border-primary p-3">
            <p className="text-xs font-semibold uppercase tracking-wide">Predict</p>
            <p className="mt-1 text-sm">{t.predictPrompt}</p>
            <input
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="Your answer"
              className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
            <button
              onClick={() => { t.submitPrediction(prediction); setPrediction(""); }}
              disabled={!prediction.trim()}
              className="mt-2 w-full rounded-md bg-primary py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        )}

        {t.phase === "idle" && <p className="text-sm text-muted-foreground">Share your screen to start practicing.</p>}

        {t.mastery && (
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mastery</p>
            <ul className="mt-2 space-y-2">
              {t.mastery.steps.map((s) => (
                <li key={s.step_id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{s.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${OUTCOME[s.outcome].cls}`}>{OUTCOME[s.outcome].label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Practice next</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {t.mastery.practiceNext.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        )}

        {t.phase === "practice" && (
          <button onClick={t.finish} className="mt-auto rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            End practice
          </button>
        )}
      </aside>

      {replay && <ReplayModal title="Sabine's moment" src={t.intervention?.clipUrl ?? null} onClose={() => setReplay(false)} />}
    </div>
  );
}
