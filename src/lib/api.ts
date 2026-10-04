// Writes to the Sidekik gateway (API_URL), authenticated with the Supabase access token.
// Never write to Supabase directly from the browser.
import { API_URL } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";

export type SessionKind = "capture" | "tutor";

/** Builds headers with `Authorization: Bearer <supabase access token>`. */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface CreateSessionInput {
  workflow_id: string;
  kind: SessionKind;
}
export interface CreateSessionResult {
  session_id: string;
}
// TODO: POST `${API_URL}/v1/sessions`.
export async function createSession(_input: CreateSessionInput): Promise<CreateSessionResult> {
  void API_URL;
  throw new Error("not implemented");
}

// ---------- Workflows ----------
export interface CreateWorkflowInput {
  name: string;
  description?: string | null;
  onet_code?: string | null;
}
export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {
  id: string;
}
// TODO: POST `${API_URL}/v1/workflows` with authHeaders().
export async function createWorkflow(_input: CreateWorkflowInput): Promise<{ id: string }> {
  throw new Error("not implemented");
}
// TODO: PATCH `${API_URL}/v1/workflows/:id` with authHeaders().
export async function updateWorkflow(_input: UpdateWorkflowInput): Promise<void> {
  throw new Error("not implemented");
}

// ---------- People ----------
export type PersonKind = "expert" | "learner";
export interface InvitePersonInput {
  kind: PersonKind;
  email: string;
  display_name: string;
  language: string;
}
// TODO: POST `${API_URL}/v1/people/invite` with authHeaders().
export async function invitePerson(_input: InvitePersonInput): Promise<{ id: string }> {
  throw new Error("not implemented");
}
export interface UpdatePersonInput {
  kind: PersonKind;
  id: string;
  display_name?: string;
  language?: string;
}
// TODO: PATCH `${API_URL}/v1/people/:kind/:id` with authHeaders().
export async function updatePerson(_input: UpdatePersonInput): Promise<void> {
  throw new Error("not implemented");
}

// ---------- Org settings ----------
export interface OrgSettings {
  retention_days: number;
  languages: string[];
  jev_enabled: boolean;
  store_learner_keyframes: boolean;
  consent_text_version: string;
}
// TODO: PATCH `${API_URL}/v1/org/settings` with authHeaders().
export async function updateOrgSettings(_input: OrgSettings): Promise<void> {
  throw new Error("not implemented");
}

// ---------- Work Maps ----------
// TODO: GET `${API_URL}/v1/workmaps/:workmapId/steps/:stepId/clip` with authHeaders(); returns a signed URL.
export async function getClipUrl(_workmapId: string, _stepId: string): Promise<string> {
  throw new Error("not implemented");
}
// TODO: POST `${API_URL}/v1/workmaps/:workmapId/export` with authHeaders(); returns agent rules.
export async function exportAgentRules(_workmapId: string): Promise<unknown> {
  throw new Error("not implemented");
}
