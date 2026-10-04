// @vitest-environment node
// The page can't import @sidekik/contracts (it pulls in Redis and Node crypto), so it keeps a copy
// of pageAction(). This test runs the real package next to the copy so they can't drift apart.
import * as contracts from "@sidekik/contracts";
import { describe, expect, it } from "vitest";
import type { AgentCommand } from "./contract";
import { isAgentCommand } from "./contract";
import { pageAction, toPageMessage } from "./pageAction";

const mastery = {
  session_id: "s1",
  workmap_id: "w1",
  learner_id: "l1",
  steps: [
    {
      step_id: "st4",
      key: "S4",
      title: "Code the invoice",
      outcome: "corrected_after_intervention" as const,
    },
  ],
  practice_next: [{ step_id: "st4", reason: "capex vs opex on equipment" }],
  counts: {
    independent_correct: 5,
    prompted_correct: 1,
    corrected_after_intervention: 1,
    not_attempted: 0,
  },
};

const commands: AgentCommand[] = [
  {
    type: "ctx",
    text: "03:12 invoice 4471 | cost_center 4711→0400\n  | net €6,350",
    context_id: "screen",
  },
  {
    type: "ask",
    question_id: "q1",
    text: "Why did you change the cost center\nfrom 4711 to 0400?",
    qtype: "why",
  },
  { type: "followup", open_item_id: "o1", text: "What happens  when the supplier is unknown?" },
  { type: "teachback", workmap_id: "w1", script: "Step 1: check the supplier.\nStep 2: code it." },
  { type: "predict", step_id: "st4", prompt: "€7,200 spindle motor — which cost center, and why?" },
  {
    type: "intervene",
    guardrail_id: "g1",
    step_id: "st4",
    text: "Equipment over €5,000 is always capex.",
    field: "cost_center",
  },
  { type: "summary", mastery },
  {
    type: "replay",
    step_id: "st4",
    clip_url: "https://x/clip.mp4",
    quote: "Ab 5000 Euro…",
    label: "Sabine, 03:12",
  },
  { type: "offrecord", on: true },
  {
    type: "phase",
    phase: "debrief",
    conversation_token: "tok",
    agent_id: "agent_deb",
    dynamic_variables: {},
  },
];

describe("pageAction mirror", () => {
  it.each(commands.map((c) => [c.type, c] as const))(
    "matches @sidekik/contracts for %s",
    (_type, cmd) => {
      expect(pageAction(cmd)).toEqual(contracts.pageAction(cmd as contracts.AgentCommand));
      expect(toPageMessage(cmd)).toEqual(contracts.toPageMessage(cmd as contracts.AgentCommand));
    },
  );

  it("produces the exact [SIDEKIK] strings the agent prompts expect", () => {
    expect(toPageMessage(commands[1]!)).toBe(
      "[SIDEKIK] ASK: Why did you change the cost center from 4711 to 0400?",
    );
    expect(toPageMessage(commands[0]!)).toBeNull();
  });

  it("accepts every command the contracts schema accepts", () => {
    for (const cmd of commands) {
      expect(contracts.AgentCommandSchema.safeParse(cmd).success).toBe(true);
      expect(isAgentCommand(cmd)).toBe(true);
    }
    expect(isAgentCommand({ type: "shout" })).toBe(false);
  });
});
