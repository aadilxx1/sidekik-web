// Turns the ElevenLabs SDK's voice-activity score (onVadScore, 0–1) into the start/end events
// brain's pause detector needs (`user_speech_start` / `user_speech_end`, ARCHITECTURE §4.2).
// Hysteresis keeps a breath or a quiet word from flipping the state: speech starts above
// `startAt`, and ends only after the score has stayed below `endAt` for `endAfterMs`.

export type SpeechEdge = "user_speech_start" | "user_speech_end";

export interface VadOptions {
  startAt?: number;
  endAt?: number;
  endAfterMs?: number;
  now?: () => number;
}

export class VoiceActivityTracker {
  private speaking = false;
  private quietSince: number | null = null;
  private readonly startAt: number;
  private readonly endAt: number;
  private readonly endAfterMs: number;
  private readonly now: () => number;

  constructor(
    private readonly onEdge: (edge: SpeechEdge) => void,
    opts: VadOptions = {},
  ) {
    this.startAt = opts.startAt ?? 0.6;
    this.endAt = opts.endAt ?? 0.3;
    this.endAfterMs = opts.endAfterMs ?? 600;
    this.now = opts.now ?? (() => Date.now());
  }

  get isSpeaking() {
    return this.speaking;
  }

  score(vad: number) {
    if (!this.speaking) {
      if (vad >= this.startAt) {
        this.speaking = true;
        this.quietSince = null;
        this.onEdge("user_speech_start");
      }
      return;
    }
    if (vad > this.endAt) {
      this.quietSince = null;
      return;
    }
    const t = this.now();
    this.quietSince ??= t;
    if (t - this.quietSince >= this.endAfterMs) {
      this.speaking = false;
      this.quietSince = null;
      this.onEdge("user_speech_end");
    }
  }

  /** Off the record or session end: close an open speech span. */
  reset() {
    if (this.speaking) this.onEdge("user_speech_end");
    this.speaking = false;
    this.quietSince = null;
  }
}
