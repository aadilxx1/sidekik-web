import type { FrameReason } from "@/capture/frameCodec";
import type { DomEvent } from "./contract";

// The MiniERP runs in an iframe or a second tab next to the Capture/Tutor Room. It tells the
// room what happens through postMessage (same origin only, since the state is invoice data):
//   {type: "dom", ...DomEvent}          → the room relays it to the gateway (/ws/client)
//   {type: "frame_hint", reason}        → the room takes an extra screen frame (not relayed)

function post(msg: object) {
  if (typeof window === "undefined") return;
  const origin = window.location.origin;
  try {
    if (window.parent && window.parent !== window) window.parent.postMessage(msg, origin);
  } catch {}
  try {
    window.opener?.postMessage(msg, origin);
  } catch {}
}

export function emitDomEvent(ev: DomEvent) {
  post({ type: "dom", ...ev });
}

export function emitFrameHint(reason: Exclude<FrameReason, "tick">) {
  post({ type: "frame_hint", reason });
}

/** DomEvent before/after are strings on the wire; null/undefined are left out. */
export function wireValue(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

/** Builds a DomEvent, dropping fields that are undefined (exactOptionalPropertyTypes). */
export function domEvent(
  kind: DomEvent["kind"],
  parts: { [K in Exclude<keyof DomEvent, "kind">]?: DomEvent[K] | undefined },
): DomEvent {
  const ev: DomEvent = { kind };
  for (const [k, v] of Object.entries(parts)) {
    if (v !== undefined) (ev as unknown as Record<string, unknown>)[k] = v;
  }
  return ev;
}
