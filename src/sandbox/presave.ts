export interface PresaveResult {
  allow: boolean;
  guardrail_id?: string;
  quote?: string;
  field?: string;
}

// Stub: later this calls POST /v1/sessions/:sid/presave with a 300 ms timeout.
export async function presave(_state: unknown): Promise<PresaveResult> {
  return { allow: true };
}
