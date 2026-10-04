import type { FrameReason } from "./frameCodec";

/**
 * Which MiniERP postMessage (src/sandbox/domEvents.ts) deserves an extra screen frame:
 * a save attempt, a record change, or an explicit frame hint (field blur, successful save).
 */
export function extraFrameReason(data: unknown): FrameReason | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { type?: unknown; kind?: unknown; reason?: unknown };
  if (d.type === "dom") {
    if (d.kind === "save_attempt") return "save";
    if (d.kind === "record_open") return "nav";
    return null;
  }
  if (
    d.type === "frame_hint" &&
    (d.reason === "blur" || d.reason === "save" || d.reason === "nav")
  ) {
    return d.reason;
  }
  return null;
}
