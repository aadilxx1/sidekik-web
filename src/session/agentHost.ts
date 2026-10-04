// /agent-host/:sid?t= (DESIGN §7, ticket 9): the page Recall's bot shows as its camera in a
// meeting. It claims the one-time `t`, then runs the same SessionEngine as the rooms, with the
// meeting audio as its microphone. Frames come from sidekik-meetbot, not from this page.
import type { CreateSessionResponse } from "./contract";
import { SessionEngine, type EngineOptions, type GatewayClient } from "./engine";
import { readSessionClaims } from "./token";

export type AgentHostClaim = {
  session_id: string;
  sk_token: string;
  el: CreateSessionResponse["el"];
};

/**
 * The page has no signed-in user, so it can't call the gateway's public session API:
 * - consent was recorded when the expert started the meeting session;
 * - off the record is made official by meetbot's /off chat command or brain's D7 (both call the
 *   gateway), so the agent's mark_off_record tool only mutes locally here;
 * - meetbot removes the bot when the session ends.
 */
export const meetingGateway: GatewayClient = {
  consent: async () => {},
  setOffRecord: async () => {},
  taskDone: async () => {
    throw new Error("Task done isn't available in the meeting.");
  },
  end: async () => {},
};

export interface AgentHostDeps {
  claim: (t: string) => Promise<AgentHostClaim>;
  buildEngine: (opts: EngineOptions) => SessionEngine;
}

// `t` is single-use: React mounts twice in development, so each `t` is claimed once.
const started = new Map<string, Promise<SessionEngine>>();

export function startAgentHost(
  sid: string,
  t: string,
  deps: AgentHostDeps,
): Promise<SessionEngine> {
  let engine = started.get(t);
  if (!engine) {
    engine = (async () => {
      const claim = await deps.claim(t);
      if (claim.session_id !== sid) throw new Error("This link belongs to another session.");
      const e = deps.buildEngine({
        session: { ...claim, ingest_url: "" },
        kind: readSessionClaims(claim.sk_token)?.kind ?? "capture",
        language: claim.el.dynamic_variables["language"] ?? "en",
        muteWhileSpeaking: true,
      });
      await e.connect();
      return e;
    })();
    started.set(t, engine);
  }
  return engine;
}
