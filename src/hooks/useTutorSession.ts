import { useCallback, useState } from "react";

// STUB — Claude Code will implement the real tutor session.

export type StepOutcome = "independent" | "prompted" | "corrected" | "not_attempted";

export interface TutorStep {
  step_id: string;
  title: string;
  expertWords: string;
}

export interface Intervention {
  step_id: string;
  field: string;
  quote: string;
  clipUrl: string | null;
}

export interface MasteryResult {
  steps: { step_id: string; title: string; outcome: StepOutcome }[];
  practiceNext: string[];
}

const STEPS: TutorStep[] = [
  { step_id: "s1", title: "Check the supplier", expertWords: "First I look at whether we know the supplier. If it's new, I don't trust anything on the invoice yet." },
  { step_id: "s2", title: "Pick the cost center", expertWords: "Equipment over 5,000 euros that we'll use for years is an asset — so it goes to 0400, never 4711." },
  { step_id: "s3", title: "Get a second approval", expertWords: "New supplier and a big amount? I always send it for a second approval before saving." },
];

const MASTERY: MasteryResult = {
  steps: [
    { step_id: "s1", title: STEPS[0]!.title, outcome: "independent" },
    { step_id: "s2", title: STEPS[1]!.title, outcome: "corrected" },
    { step_id: "s3", title: STEPS[2]!.title, outcome: "prompted" },
  ],
  practiceNext: ["Capex vs. opex on equipment invoices", "When to send for 2nd approval"],
};

export function useTutorSession(_sid: string) {
  const [phase, setPhase] = useState<"idle" | "practice" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [predictPrompt, setPredictPrompt] = useState<string | null>(null);
  const [intervention, setIntervention] = useState<Intervention | null>(null);

  const start = useCallback(() => {
    setPhase("practice");
    setStepIndex(1);
    setPredictPrompt("Invoice 4510 is a €7,200 spindle motor. Which cost center would Sabine choose?");
  }, []);

  const submitPrediction = useCallback((_answer: string) => {
    setPredictPrompt(null);
    // Mock: pretend the learner then saved with 4711 and got blocked.
    setIntervention({
      step_id: "s2",
      field: "cost_center",
      quote: "Equipment over 5,000 euros that we'll use for years is an asset — so it goes to 0400, never 4711.",
      clipUrl: null,
    });
  }, []);

  const dismissIntervention = useCallback(() => setIntervention(null), []);
  const finish = useCallback(() => {
    setIntervention(null);
    setPredictPrompt(null);
    setPhase("done");
  }, []);

  return {
    phase,
    currentStep: STEPS[stepIndex] ?? null,
    predictPrompt,
    intervention,
    mastery: phase === "done" ? MASTERY : null,
    start,
    submitPrediction,
    dismissIntervention,
    finish,
  };
}
