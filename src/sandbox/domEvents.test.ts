import { describe, expect, it } from "vitest";
import { extraFrameReason } from "@/capture/extraFrameReason";
import { domEvent, wireValue } from "./domEvents";

describe("domEvents", () => {
  it("builds contract-shaped events without undefined fields", () => {
    const ev = domEvent("field_change", {
      record: { kind: "invoice", id: "4471" },
      field: "cost_center",
      before: wireValue("4711"),
      after: wireValue("0400"),
      state: { cost_center: "0400" },
    });
    expect(ev).toEqual({
      kind: "field_change",
      record: { kind: "invoice", id: "4471" },
      field: "cost_center",
      before: "4711",
      after: "0400",
      state: { cost_center: "0400" },
    });
    expect(domEvent("save_attempt", { field: undefined })).toEqual({ kind: "save_attempt" });
  });

  it("sends values as strings and leaves out empty ones", () => {
    expect(wireValue(6350)).toBe("6350");
    expect(wireValue(false)).toBe("false");
    expect(wireValue(null)).toBeUndefined();
  });
});

describe("extraFrameReason", () => {
  it("takes extra frames on save attempts, record changes and frame hints only", () => {
    expect(extraFrameReason({ type: "dom", kind: "save_attempt" })).toBe("save");
    expect(extraFrameReason({ type: "dom", kind: "record_open" })).toBe("nav");
    expect(extraFrameReason({ type: "frame_hint", reason: "blur" })).toBe("blur");
    expect(extraFrameReason({ type: "dom", kind: "field_change" })).toBeNull();
    expect(extraFrameReason({ type: "frame_hint", reason: "tick" })).toBeNull();
    expect(extraFrameReason("hello")).toBeNull();
  });
});
