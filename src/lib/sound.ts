"use client";

/* ──────────────────────────────────────────────────────────
   Shared Web Audio synth for short UI sound effects — CODEC
   beep on window open, soft clicks on window actions.

   One lazily-created AudioContext shared by every effect (creating
   a fresh context per sound is wasteful and some browsers cap the
   concurrent count). Created on first call, which in practice is
   always in response to a user gesture (opening/closing a window),
   so autoplay policy is already satisfied by then.

   Callers are responsible for checking the `soundEffects` a11y pref
   before calling — this module has no React access.
   ────────────────────────────────────────────────────────── */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx && ctx.state !== "closed") {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  peak: number,
  type: OscillatorType = "square"
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/* CODEC-style two-tone beep — window open. */
export function playCodecBeep() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  tone(c, 740, now, 0.045, 0.05);
  tone(c, 1046.5, now + 0.055, 0.06, 0.05);
}

/* Soft click — window close / minimize / maximize. */
export function playClick() {
  const c = getCtx();
  if (!c) return;
  tone(c, 320, c.currentTime, 0.03, 0.035);
}
