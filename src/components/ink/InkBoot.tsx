"use client";

import { useEffect, useRef, useState } from "react";
import { useA11y } from "@/lib/a11y";
import { playCodecBeep } from "@/lib/sound";
import { KROS_MARK_BOX, KROS_MARK_PATH } from "./KrosMark";

/* ──────────────────────────────────────────────────────────
   InkOS boot — the KR//OS monogram is rasterised into a dot grid and
   lit in a sweep while a segmented bar fills. At 100% the mark pulses
   red once (system ready) and the ENTER pill appears; that click is
   also the audio-unlock gesture.
   Reduced motion: the mark is drawn fully formed, no sweep or pulse.
   ────────────────────────────────────────────────────────── */

const COLS = 40;
const ROWS = 40;
const PITCH = 9;
const DURATION = 3400;
const PULSE = 650;

const STATUSES: [number, string][] = [
  [0, "Laying ink…"],
  [0.25, "Aligning dot grid…"],
  [0.5, "Loading KR-19…"],
  [0.8, "Warming the light bars…"],
  [1, "Ready."],
];

type Dot = { x: number; y: number; on: boolean; at: number };

function sampleMark(): Dot[] {
  const SS = 4; // supersample, then threshold per cell
  const off = document.createElement("canvas");
  off.width = COLS * SS;
  off.height = ROWS * SS;
  const o = off.getContext("2d");
  if (!o) return [];
  const pad = 2 * SS;
  const s = (COLS * SS - pad * 2) / Math.max(KROS_MARK_BOX.w, KROS_MARK_BOX.h);
  o.translate(pad - KROS_MARK_BOX.x * s, pad - KROS_MARK_BOX.y * s);
  o.scale(s, s);
  o.fillStyle = "#fff";
  o.fill(new Path2D(KROS_MARK_PATH));
  const d = o.getImageData(0, 0, COLS * SS, ROWS * SS).data;
  const dots: Dot[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const cx = x * SS + SS / 2, cy = y * SS + SS / 2;
      const on = d[(cy * COLS * SS + cx) * 4 + 3] > 120;
      // Sweep from the lower left to the upper right, with a little noise.
      dots.push({ x, y, on, at: ((x + (ROWS - y)) / (COLS + ROWS)) * 0.78 + Math.random() * 0.18 });
    }
  return dots;
}

export default function InkBoot({ onComplete }: { onComplete: () => void }) {
  const { motionReduced, soundEffects } = useA11y();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [t, setT] = useState(motionReduced ? 1 : 0);
  const ready = t >= 1;
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    const ctx = cvs?.getContext("2d");
    if (!cvs || !ctx) return;
    let raf = 0;
    let dots: Dot[] = [];
    let start = 0;

    const draw = (p: number, pulse = false) => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      for (const d of dots) {
        const lit = d.on && p >= d.at;
        ctx.beginPath();
        ctx.arc(d.x * PITCH + PITCH / 2, d.y * PITCH + PITCH / 2, lit ? 3.3 : 1, 0, Math.PI * 2);
        ctx.fillStyle = lit ? (pulse ? "#ff3b30" : "#f2f2f2") : "#ffffff1c";
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      if (!start) start = now;
      const el = now - start;
      const p = Math.min(el / DURATION, 1);
      draw(p, p >= 1 && el < DURATION + PULSE);
      setT(p);
      if (el < DURATION + PULSE + 50) raf = requestAnimationFrame(frame);
    };

    document.fonts.ready.then(() => {
      dots = sampleMark();
      if (motionReduced) {
        draw(1);
        setT(1);
      } else {
        raf = requestAnimationFrame(frame);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [motionReduced]);

  useEffect(() => {
    if (ready) enterRef.current?.focus();
  }, [ready]);

  const enter = () => {
    if (soundEffects) playCodecBeep();
    onComplete();
  };

  const segments = 48;
  const n = Math.round(t * segments);
  const status = STATUSES.filter(([a]) => t >= a).pop()![1];

  return (
    <div
      className="ink fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000", gap: 34, zIndex: 50 }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && ready) enter();
      }}
    >
      <div
        aria-hidden
        className="ink-dotgrid absolute inset-0"
        style={{ WebkitMaskImage: "radial-gradient(ellipse at center, #000 20%, transparent 70%)", maskImage: "radial-gradient(ellipse at center, #000 20%, transparent 70%)", opacity: 0.7 }}
      />
      {!motionReduced && (
        <div aria-hidden className="absolute" style={{ width: 560, height: 560, maxWidth: "90vw", maxHeight: "90vw", borderRadius: "50%", border: "1px solid #ffffff10" }}>
          <div
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "#f2f2f2",
              filter: "drop-shadow(0 0 8px #fff8)",
              animation: "ink-spin 2.4s linear infinite",
              opacity: ready ? 0.35 : 1,
              transition: "opacity .6s",
            }}
          />
        </div>
      )}

      {["KR-19 · INKOS", "BUILD 2.077", "PORTFOLIO · INK EDITION", ready ? "PRESS ENTER" : "BOOTING"].map((txt, i) => (
        <span
          key={txt}
          aria-hidden
          className="ink-label"
          style={{ position: "absolute", color: "var(--ink-dim)", [i < 2 ? "top" : "bottom"]: 28, [i % 2 ? "right" : "left"]: 32 }}
        >
          {txt}
        </span>
      ))}

      <h1 className="sr-only">KR//OS — Kaustav Roy&apos;s portfolio</h1>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <canvas ref={canvasRef} width={COLS * PITCH} height={ROWS * PITCH} aria-hidden style={{ width: "min(340px, 62vw)", height: "auto" }} />
        <span aria-hidden className="ink-dot-900" style={{ fontSize: 34, letterSpacing: ".06em", opacity: ready ? 1 : 0.35, transition: "opacity .6s" }}>KR//OS</span>
      </div>

      <div style={{ position: "relative", width: "min(420px, 80vw)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="ink-label" role="status" aria-live="polite">{status}</span>
          <span className="ink-dot" style={{ fontSize: 16 }}>{String(Math.round(t * 100)).padStart(2, "0")}%</span>
        </div>
        <div className="ink-bar" style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }} aria-hidden>
          {Array.from({ length: segments }, (_, i) => (
            <i key={i} className={i < n - 1 || (ready && i < n) ? "f" : i === n - 1 ? "tip live" : ""} style={{ height: 10 }} />
          ))}
        </div>
      </div>

      <button
        ref={enterRef}
        type="button"
        onClick={enter}
        className="ink-pill"
        style={{ position: "relative", padding: "14px 28px", fontSize: 12, borderColor: "var(--ink-fg)", letterSpacing: ".2em", opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none", transition: "opacity .4s" }}
        tabIndex={ready ? 0 : -1}
        aria-hidden={!ready}
      >
        ENTER KR//OS
      </button>
    </div>
  );
}
