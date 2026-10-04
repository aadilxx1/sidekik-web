import { describe, expect, it, vi } from "vitest";
import { presave } from "./presave";

const state = { invoice_id: "4510", net_amount: 7200, category: "equipment", cost_center: "4711" };
const getToken = async () => "jwt-123";

const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

// Never resolves until aborted, like a gateway that doesn't answer in time.
const hang = (async (_url: string, init?: RequestInit) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("aborted", "AbortError")),
    );
  })) as unknown as typeof fetch;

describe("presave", () => {
  it("allows every save in a standalone sandbox without calling the gateway", async () => {
    const fetchImpl = respond({ allow: false });
    expect(await presave(state, { fetchImpl, getToken })).toEqual({ allow: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts the state with the user's JWT and returns the block", async () => {
    const blocked = {
      allow: false,
      guardrail_id: "g1",
      quote: "Equipment over €5,000 is always capex.",
      step_id: "s4",
    };
    const fetchImpl = respond(blocked);
    expect(await presave(state, { sid: "s 1", mode: "tutor", fetchImpl, getToken })).toEqual(
      blocked,
    );
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(url).toMatch(/\/v1\/sessions\/s%201\/presave$/);
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer jwt-123");
    expect(JSON.parse(init.body)).toEqual({ state });
  });

  it("on timeout allows the expert's save but blocks the learner's", async () => {
    expect(
      await presave(state, {
        sid: "s1",
        mode: "capture",
        fetchImpl: hang,
        getToken,
        timeoutMs: 20,
      }),
    ).toEqual({
      allow: true,
      unavailable: true,
    });
    expect(
      await presave(state, { sid: "s1", mode: "tutor", fetchImpl: hang, getToken, timeoutMs: 20 }),
    ).toEqual({
      allow: false,
      unavailable: true,
    });
  });

  it("treats a server error or a malformed reply as unavailable", async () => {
    expect(
      await presave(state, { sid: "s1", mode: "tutor", fetchImpl: respond({}, 502), getToken }),
    ).toEqual({
      allow: false,
      unavailable: true,
    });
    expect(
      await presave(state, { sid: "s1", mode: "capture", fetchImpl: respond({ ok: 1 }), getToken }),
    ).toEqual({
      allow: true,
      unavailable: true,
    });
  });
});
