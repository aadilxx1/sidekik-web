import { describe, expect, it, vi } from "vitest";
import { meetingGateway, startAgentHost, type AgentHostClaim } from "./agentHost";
import type { EngineOptions, SessionEngine } from "./engine";

const b64url = (o: object) =>
  btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const claim = (sid: string, kind = "capture"): AgentHostClaim => ({
  session_id: sid,
  sk_token: `h.${b64url({ sid, org: "o", role: "expert", kind })}.s`,
  el: { conversation_token: "tok", agent_id: "agent_int", dynamic_variables: { language: "en" } },
});

function deps(result: AgentHostClaim) {
  const built: EngineOptions[] = [];
  const connect = vi.fn(async () => {});
  return {
    built,
    connect,
    claim: vi.fn(async () => result),
    buildEngine: (o: EngineOptions) => (built.push(o), { connect } as unknown as SessionEngine),
  };
}

describe("startAgentHost", () => {
  it("claims the one-time token once, then connects a muted-while-speaking engine", async () => {
    const d = deps(claim("sess-a"));
    const [a, b] = await Promise.all([
      startAgentHost("sess-a", "t-a", d),
      startAgentHost("sess-a", "t-a", d),
    ]);
    expect(a).toBe(b);
    expect(d.claim).toHaveBeenCalledTimes(1);
    expect(d.connect).toHaveBeenCalledTimes(1);
    expect(d.built[0]).toMatchObject({ kind: "capture", language: "en", muteWhileSpeaking: true });
  });

  it("reads the session kind from the sk_token", async () => {
    const d = deps(claim("sess-b", "tutor"));
    await startAgentHost("sess-b", "t-b", d);
    expect(d.built[0]?.kind).toBe("tutor");
  });

  it("refuses a token for another session", async () => {
    const d = deps(claim("other"));
    await expect(startAgentHost("sess-c", "t-c", d)).rejects.toThrow(/another session/);
    expect(d.connect).not.toHaveBeenCalled();
  });
});

describe("meetingGateway", () => {
  it("needs no signed-in user except for task done", async () => {
    await expect(meetingGateway.consent("s", ["audio"])).resolves.toBeUndefined();
    await expect(meetingGateway.setOffRecord("s", true, "agent")).resolves.toBeUndefined();
    await expect(meetingGateway.taskDone("s")).rejects.toThrow();
  });
});
