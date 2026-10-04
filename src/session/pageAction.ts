// Mirror of pageAction()/toPageMessage() from @sidekik/contracts v0.3.2 (src/contracts/commands.ts):
// what the page does with each agent command (ARCHITECTURE §4.5). See contract.ts for why it's copied.
import type { AgentCommand, MasterySummary } from "./contract";

/** Prefix that tells the ElevenLabs agent a user message came from Sidekik, not the person. */
export const SIDEKIK_PREFIX = "[SIDEKIK]";

export type PageAction =
  /** conversation.sendUserMessage(text): the agent acts on it and speaks. */
  | { kind: "user_message"; text: string }
  /** conversation.sendContextualUpdate(text): background context, never spoken. */
  | { kind: "contextual_update"; text: string }
  /** UI only (clip overlay, off-record badge, new EL session): nothing is sent to the agent. */
  | { kind: "ui" };

export function pageAction(cmd: AgentCommand): PageAction {
  switch (cmd.type) {
    case "ctx":
      return { kind: "contextual_update", text: oneLine(cmd.text) };
    case "ask":
      return userMessage("ASK", cmd.text);
    case "followup":
      return userMessage("FOLLOWUP", cmd.text);
    case "teachback":
      return userMessage("TEACHBACK", cmd.script);
    case "predict":
      return userMessage("PREDICT", cmd.prompt);
    case "intervene":
      return userMessage("INTERVENE", cmd.text);
    case "summary":
      return userMessage("SUMMARY", summaryText(cmd.mastery));
    case "replay":
    case "offrecord":
    case "phase":
      return { kind: "ui" };
  }
}

/** The `sendUserMessage` string for a command, or null when the page doesn't message the agent. */
export function toPageMessage(cmd: AgentCommand): string | null {
  const action = pageAction(cmd);
  return action.kind === "user_message" ? action.text : null;
}

function userMessage(tag: string, body: string): PageAction {
  return { kind: "user_message", text: `${SIDEKIK_PREFIX} ${tag}: ${oneLine(body)}` };
}

/** Agent messages are one line: newlines and runs of whitespace collapse to single spaces. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Spoken summary of a tutor session: counts first, then what to practice next. */
function summaryText(m: MasterySummary): string {
  const c = m.counts;
  const total =
    c.independent_correct + c.prompted_correct + c.corrected_after_intervention + c.not_attempted;
  const parts = [
    `${c.independent_correct} of ${total} steps done independently, ${c.prompted_correct} with a prompt, ` +
      `${c.corrected_after_intervention} corrected after an intervention, ${c.not_attempted} not attempted.`,
  ];
  if (m.practice_next.length > 0)
    parts.push(`Practice next: ${m.practice_next.map((p) => p.reason).join("; ")}.`);
  return parts.join(" ");
}
