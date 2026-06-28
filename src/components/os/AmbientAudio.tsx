"use client";

import { useEffect, useRef } from "react";
import { useA11y } from "@/lib/a11y";

/* ──────────────────────────────────────────────────────────
   AmbientAudio — a very slight synthesized "galactic" drone that
   plays behind both wallpapers for immersion.

   Like the rest of the OS, it's pure Web Audio (no audio files):
   a few low detuned oscillators + gently-filtered noise ("space
   wind") through a slow LFO, all at a low master gain.

   - Built once, on the first user gesture (autoplay policy). The
     boot/lock tap satisfies this.
   - The `ambience` a11y pref ramps the master gain up/down (it does
     not tear the graph down, so it can fade back in instantly).
   - Mounted once at the page level (desktop + mobile).
   ────────────────────────────────────────────────────────── */

const TARGET_GAIN = 0.05; // "very slight"
const FADE_S = 2.5;

export default function AmbientAudio() {
  const { ambience } = useA11y();
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambienceRef = useRef(ambience);
  useEffect(() => { ambienceRef.current = ambience; }, [ambience]);

  // Build the drone graph once, on the first user gesture.
  useEffect(() => {
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        ctxRef.current = ctx;

        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        masterRef.current = master;

        // Low detuned drone oscillators (A1 / E2 / A2).
        const voices: [number, OscillatorType, number, number][] = [
          [55.0, "sine", 0.5, -4],
          [82.41, "sine", 0.3, 0],
          [110.0, "triangle", 0.16, 5],
        ];
        for (const [freq, type, g, detune] of voices) {
          const osc = ctx.createOscillator();
          osc.type = type;
          osc.frequency.value = freq;
          osc.detune.value = detune;
          const og = ctx.createGain();
          og.gain.value = g;
          osc.connect(og).connect(master);
          osc.start();
        }

        // Filtered noise — airy "space wind".
        const len = Math.floor(ctx.sampleRate * 2);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;
        const nf = ctx.createBiquadFilter();
        nf.type = "lowpass";
        nf.frequency.value = 380;
        const ng = ctx.createGain();
        ng.gain.value = 0.22;
        noise.connect(nf).connect(ng).connect(master);
        noise.start();

        // Slow LFO drifts the noise cutoff so the bed breathes.
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 120;
        lfo.connect(lfoGain).connect(nf.frequency);
        lfo.start();

        // Fade in to the current pref.
        const target = ambienceRef.current ? TARGET_GAIN : 0;
        master.gain.setTargetAtTime(target, ctx.currentTime, FADE_S / 3);
      } catch {
        // audio unavailable — stay silent
      }
      detach();
    };

    const detach = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start);

    return () => {
      detach();
      const ctx = ctxRef.current;
      if (ctx && ctx.state !== "closed") ctx.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, []);

  // Ramp the master gain whenever the ambience pref changes.
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    master.gain.setTargetAtTime(ambience ? TARGET_GAIN : 0, ctx.currentTime, FADE_S / 3);
  }, [ambience]);

  return null;
}
