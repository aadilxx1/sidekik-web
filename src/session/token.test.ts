import { describe, expect, it } from "vitest";
import { readSessionClaims } from "./token";

const b64url = (o: object) =>
  btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const jwt = (claims: object) => `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(claims)}.sig`;

describe("readSessionClaims", () => {
  it("reads sid, org, role and kind from an sk_token", () => {
    expect(
      readSessionClaims(jwt({ sid: "s1", org: "o1", role: "expert", kind: "capture", exp: 9 })),
    ).toEqual({
      sid: "s1",
      org: "o1",
      role: "expert",
      kind: "capture",
    });
  });

  it("rejects tokens that aren't session tokens", () => {
    expect(readSessionClaims("not-a-jwt")).toBeNull();
    expect(readSessionClaims(jwt({ sid: "s1", kind: "meeting" }))).toBeNull();
    expect(readSessionClaims("a.%%%.c")).toBeNull();
  });
});
