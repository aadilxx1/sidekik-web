// Reads the claims of an sk_token (HS256 JWT minted by the gateway: {sid, org, role, kind}).
// The page only reads them for display and routing; the gateway and perception verify the signature.

export interface SessionClaims {
  sid: string;
  org: string;
  role: string;
  kind: "capture" | "tutor";
}

export function readSessionClaims(token: string): SessionClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(
      payload
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(payload.length / 4) * 4, "="),
    );
    const c = JSON.parse(json) as Partial<SessionClaims>;
    if (typeof c.sid !== "string" || (c.kind !== "capture" && c.kind !== "tutor")) return null;
    return { sid: c.sid, org: String(c.org ?? ""), role: String(c.role ?? ""), kind: c.kind };
  } catch {
    return null;
  }
}
