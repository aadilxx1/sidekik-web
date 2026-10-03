export type DomEventKind = "focus" | "change" | "record_open" | "save_attempt" | "save" | "blur";

export interface DomEvent {
  type: "dom";
  kind: DomEventKind | string;
  record: { kind: "invoice"; id: string };
  field: string | null;
  before: unknown;
  after: unknown;
  state: unknown;
}

export function emitDomEvent(e: Omit<DomEvent, "type">) {
  if (typeof window === "undefined") return;
  const msg: DomEvent = { type: "dom", ...e };
  try {
    if (window.parent && window.parent !== window) window.parent.postMessage(msg, "*");
  } catch {}
  try {
    window.opener?.postMessage(msg, "*");
  } catch {}
}
