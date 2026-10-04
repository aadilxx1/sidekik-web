// Mirror of the page-facing contracts from @sidekik/contracts v0.3.2 (sidekik-platform
// src/contracts/commands.ts, workmap.ts, api.ts). The package's entry also exports the Redis bus,
// pino and Node crypto, which can't load in a browser, so the page keeps these copies.
// Keep them identical to the package; pageAction.test.ts checks the exact strings.

export type Phase = "capture" | "building" | "debrief" | "confirmed" | "tutoring" | "done";
export type QType = "exception" | "limit" | "other" | "stop_and_ask" | "why";

export type StepOutcome =
  "independent_correct" | "prompted_correct" | "corrected_after_intervention" | "not_attempted";

export interface MasterySummary {
  session_id: string;
  workmap_id: string;
  learner_id: string;
  steps: { step_id: string; key: string; title: string; outcome: StepOutcome }[];
  practice_next: { step_id?: string; guardrail_id?: string; reason: string }[];
  counts: Record<StepOutcome, number>;
}

export type AgentCommand =
  | { type: "ctx"; text: string; context_id?: string }
  | { type: "ask"; question_id: string; text: string; qtype: QType }
  | { type: "followup"; open_item_id: string; text: string }
  | { type: "teachback"; workmap_id: string; script: string }
  | { type: "predict"; step_id: string; prompt: string }
  | { type: "intervene"; guardrail_id: string; step_id: string; text: string; field?: string }
  | { type: "replay"; step_id: string; clip_url: string; quote: string; label: string }
  | { type: "summary"; mastery: MasterySummary }
  | { type: "offrecord"; on: boolean }
  | {
      type: "phase";
      phase: Phase;
      conversation_token: string;
      agent_id: string;
      dynamic_variables: Record<string, string>;
    };

/** ElevenLabs start data the gateway returns (`ElSession`). */
export interface ElSession {
  conversation_token: string;
  agent_id: string;
  dynamic_variables: Record<string, string>;
}

/** POST /v1/sessions response. `ingest_url` is the full frames WebSocket URL for this session. */
export interface CreateSessionResponse {
  session_id: string;
  sk_token: string;
  el: ElSession;
  ingest_url: string;
}

const COMMAND_TYPES = new Set<AgentCommand["type"]>([
  "ctx",
  "ask",
  "followup",
  "teachback",
  "predict",
  "intervene",
  "replay",
  "summary",
  "offrecord",
  "phase",
]);

/** Cheap shape check for Realtime payloads; the gateway validates commands before broadcasting. */
export function isAgentCommand(v: unknown): v is AgentCommand {
  return (
    !!v &&
    typeof v === "object" &&
    COMMAND_TYPES.has((v as { type?: unknown }).type as AgentCommand["type"])
  );
}
