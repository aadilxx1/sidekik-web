import { describe, expect, it } from "vitest";
import { VoiceActivityTracker, type SpeechEdge } from "./vad";

function setup() {
  let t = 0;
  const edges: SpeechEdge[] = [];
  const vad = new VoiceActivityTracker((e) => edges.push(e), { now: () => t });
  const at = (ms: number, score: number) => {
    t = ms;
    vad.score(score);
  };
  return { edges, at, vad };
}

describe("VoiceActivityTracker", () => {
  it("starts on a loud score and ends after 600 ms of quiet", () => {
    const { edges, at } = setup();
    at(0, 0.1);
    at(100, 0.9);
    at(500, 0.1);
    at(1000, 0.1);
    expect(edges).toEqual(["user_speech_start"]);
    at(1100, 0.1);
    expect(edges).toEqual(["user_speech_start", "user_speech_end"]);
  });

  it("ignores a short dip mid-sentence", () => {
    const { edges, at } = setup();
    at(0, 0.9);
    at(100, 0.2);
    at(400, 0.5);
    at(800, 0.2);
    at(1300, 0.2);
    expect(edges).toEqual(["user_speech_start"]);
  });

  it("doesn't start on scores in the middle band", () => {
    const { edges, at } = setup();
    at(0, 0.5);
    at(100, 0.55);
    expect(edges).toEqual([]);
  });

  it("closes an open span on reset", () => {
    const { edges, at, vad } = setup();
    at(0, 0.9);
    vad.reset();
    vad.reset();
    expect(edges).toEqual(["user_speech_start", "user_speech_end"]);
  });
});
