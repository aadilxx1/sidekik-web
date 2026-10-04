// Writes to the Sidekik gateway (API_URL), authenticated with the Supabase access token.
import { API_URL } from "@/lib/config";

export type SessionKind = "capture" | "tutor";

export interface CreateSessionInput {
  workflow_id: string;
  kind: SessionKind;
}

export interface CreateSessionResult {
  session_id: string;
}

// TODO: POST `${API_URL}/v1/sessions` with `Authorization: Bearer <supabase access token>`.
export async function createSession(_input: CreateSessionInput): Promise<CreateSessionResult> {
  void API_URL;
  throw new Error("not implemented");
}
