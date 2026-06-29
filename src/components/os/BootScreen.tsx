"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useA11y } from "@/lib/a11y";
import { useDeviant } from "@/lib/deviant";
import { useExperiments } from "@/lib/experiments";
import { osChrome, osChromeDeviant } from "@/data/content";

import KRMark from "./KRMark";

// Lazy — only downloads when the bootWebgl experiment is on.
const BootShaderBg = dynamic(() => import("@/components/experiments/BootShaderBg"), { ssr: false });

/* ──────────────────────────────────────────────────────────
   KR//OS Boot Screen
   Phase 1: TapToEnter splash (unlocks AudioContext)
   Phase 2: Minecraft-style chunk loader with sound
   ────────────────────────────────────────────────────────── */

interface BootScreenProps {
  onComplete: () => void;
}

type Phase = "tap" | "loading" | "done";

/* ── Dirt tile background (inline SVG data-uri) ── */
const DIRT_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' shape-rendering='crispEdges'>
  <rect width='32' height='32' fill='#6f4e2f'/>
  <rect x='0' y='0' width='4' height='4' fill='#866043'/>
  <rect x='12' y='0' width='4' height='4' fill='#5a3e26'/>
  <rect x='24' y='4' width='4' height='4' fill='#9b7549'/>
  <rect x='4' y='8' width='4' height='4' fill='#5a3e26'/>
  <rect x='20' y='12' width='4' height='4' fill='#866043'/>
  <rect x='8' y='16' width='4' height='4' fill='#9b7549'/>
  <rect x='28' y='20' width='4' height='4' fill='#5a3e26'/>
  <rect x='16' y='24' width='4' height='4' fill='#866043'/>
  <rect x='0' y='28' width='4' height='4' fill='#9b7549'/>
  <rect x='12' y='28' width='2' height='2' fill='#3d2818'/>
  <rect x='24' y='16' width='2' height='2' fill='#3d2818'/>
  <rect x='4' y='20' width='2' height='2' fill='#3d2818'/>
</svg>
`).replace(/\s+/g, " ");
const DIRT_BG = `url("data:image/svg+xml;utf8,${DIRT_SVG}")`;

/* ── Chunk palette: theme accents + terrain tones ── */
const CHUNK_COLORS = [
  "#5a8a3a", "#6ba83d", "#5a8a3a", "#6ba83d", // grass (weighted)
  "#8b6914", "#a07a1a", "#8b6914",            // dirt
  "#4a7a8a", "#3a6a7a",                       // water
  "#f5e642",                                   // cyberpunk yellow
  "#00e5ff",                                   // detroit cyan
  "#d4a500",                                   // tlou amber
  "#ff0090",                                   // gta pink
  "#c0c0c0",                                   // stone
];

/* Status lines come from osChrome / osChromeDeviant in /data/content */

/* ── Grid config ── */
const COLS = 24;
const ROWS = 14;
const CELL = 18;
const TOTAL_CELLS = COLS * ROWS;
const REVEAL_DURATION_MS = 2200;

export default function BootScreen({ onComplete }: BootScreenProps) {
  const a11y = useA11y();
  const { deviant } = useDeviant();
  const { bootWebgl } = useExperiments();
  const ch = deviant ? osChromeDeviant : osChrome;
  const STATUS_LINES = ch.bootStatuses;
  const a11yRef = useRef(a11y);
  useEffect(() => { a11yRef.current = a11y; }, [a11y]);

  const [phase, setPhase] = useState<Phase>("tap");
  const [revealed, setRevealed] = useState(0);   // count of chunks revealed
  const audioCtxRef = useRef<AudioContext | null>(null);
  const orderRef = useRef<number[]>([]);
  const colorsRef = useRef<string[]>([]);
  const startTimeRef = useRef<number>(0);

  // If Reduce Motion is on (incl. hydrated from localStorage), skip boot entirely
  useEffect(() => {
    if (a11y.motionReduced) onComplete();
  }, [a11y.motionReduced, onComplete]);

  /* Precompute chunk reveal order (Manhattan distance from center + jitter) */
  if (orderRef.current.length === 0) {
    const cx = (COLS - 1) / 2;
    const cy = (ROWS - 1) / 2;
    const cells: { i: number; rank: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const dx = c - cx;
        const dy = r - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const jitter = Math.random() * 1.5; // noise so it's not perfectly concentric
        cells.push({ i: r * COLS + c, rank: dist + jitter });
      }
    }
    cells.sort((a, b) => a.rank - b.rank);
    orderRef.current = cells.map((c) => c.i);
    colorsRef.current = Array.from({ length: TOTAL_CELLS }, () =>
      CHUNK_COLORS[Math.floor(Math.random() * CHUNK_COLORS.length)]
    );
  }

  /* ── Audio synthesis (Web Audio API) ── */
  const playPop = useCallback((pitch: number) => {
    if (!a11yRef.current.soundEffects) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + 0.05);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }, []);

  const playChime = useCallback(() => {
    if (!a11yRef.current.soundEffects) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    // Cheerful arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }, []);

  /* ── Tap-to-enter handler: unlocks audio + starts boot ── */
  const handleTap = useCallback(() => {
    if (phase !== "tap") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    } catch {
      // audio unavailable — boot continues silently
    }
    startTimeRef.current = performance.now();
    setPhase("loading");
  }, [phase]);

  /* ── Reveal loop (RAF-driven for smoothness + audio sync) ── */
  useEffect(() => {
    if (phase !== "loading") return;
    let raf = 0;
    let lastRevealed = 0;
    let popThrottle = 0;

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min(elapsed / REVEAL_DURATION_MS, 1);
      const target = Math.floor(progress * TOTAL_CELLS);

      if (target > lastRevealed) {
        // Throttle audio: every ~8th chunk gets a pop, pitch climbs with progress
        for (let i = lastRevealed; i < target; i++) {
          if (popThrottle++ % 8 === 0) {
            const pitch = 220 + (i / TOTAL_CELLS) * 440; // 220Hz → 660Hz
            playPop(pitch);
          }
        }
        lastRevealed = target;
        setRevealed(target);
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        playChime();
        // Brief hold so the "Ready." text is readable, then handoff
        setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 650);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, playPop, playChime, onComplete]);

  /* ── Skip on Space/Enter ── */
  useEffect(() => {
    if (phase !== "loading") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        playChime();
        setRevealed(TOTAL_CELLS);
        setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 250);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, playChime, onComplete]);

  const percent = Math.floor((revealed / TOTAL_CELLS) * 100);
  const currentStatus = [...STATUS_LINES].reverse().find((s) => percent >= s.at) ?? STATUS_LINES[0];

  /* ──────────────────────────────────────────────────────────
     RENDER
     ────────────────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: bootWebgl ? "#05060a" : "#6f4e2f",
            backgroundImage: bootWebgl ? "none" : DIRT_BG,
            backgroundRepeat: "repeat",
            imageRendering: "pixelated",
            fontFamily: "'Press Start 2P', monospace",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleTap}
        >
          {/* WebGL boot backdrop — behind all content, taps fall through */}
          {bootWebgl && <BootShaderBg />}

          <div className="relative z-10 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {phase === "tap" && (
              <motion.div
                key="tap"
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                {/* Dirt block icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "linear-gradient(135deg, #8b6914 50%, #6b4f10 50%)",
                    border: "3px solid #222",
                    boxShadow:
                      "inset -4px -6px 0 rgba(0,0,0,0.5), inset 4px 4px 0 rgba(255,255,255,0.12)",
                    marginBottom: 28,
                  }}
                />
                <div className="flex items-center justify-center" style={{ gap: 7, color: "#fff", fontSize: 28, letterSpacing: "0.1em", textShadow: "3px 3px 0 #000", marginBottom: 12 }}>
                  <KRMark height={28} color="#fff" />
                  <span>{deviant ? "//DEVIANT" : "//OS"}</span>
                </div>
                <div style={{ color: "#ddd", fontSize: 9, letterSpacing: "0.2em", textShadow: "2px 2px 0 #000", marginBottom: 36 }}>
                  {ch.bootSubtitle}
                </div>

                {/* Pulsing CTA */}
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    fontSize: 11,
                    color: deviant ? "#ff5fa0" : "#ffd24a",
                    letterSpacing: "0.3em",
                    textShadow: "2px 2px 0 #000",
                    padding: "12px 24px",
                    border: `2px solid ${deviant ? "#ff5fa0" : "#ffd24a"}`,
                    background: "rgba(0,0,0,0.35)",
                  }}
                >
                  {ch.bootCta}
                </motion.div>

                <div style={{ marginTop: 24, fontSize: 8, color: "#aaa", letterSpacing: "0.2em", textShadow: "1px 1px 0 #000" }}>
                  {ch.bootSoundNote}
                </div>
              </motion.div>
            )}

            {phase === "loading" && (
              <motion.div
                key="loading"
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Percentage at top */}
                <div
                  style={{
                    color: "#fff",
                    fontSize: 32,
                    letterSpacing: "0.05em",
                    textShadow: "3px 3px 0 #000",
                    marginBottom: 24,
                  }}
                >
                  {percent}%
                </div>

                {/* Chunk grid in a framed black panel */}
                <div
                  style={{
                    padding: 16,
                    background: "#000",
                    border: "3px solid #222",
                    boxShadow: "0 0 0 1px #000, 4px 4px 0 rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
                      gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
                      gap: 1,
                      background: "#0a0a0a",
                    }}
                  >
                    {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
                      const revealRank = orderRef.current.indexOf(idx);
                      const isRevealed = revealRank < revealed;
                      const color = colorsRef.current[idx];
                      return (
                        <div
                          key={idx}
                          style={{
                            width: CELL,
                            height: CELL,
                            background: isRevealed ? color : "#1a1a1a",
                            transform: isRevealed ? "scale(1)" : "scale(0)",
                            transition: "transform 120ms ease-out, background 120ms ease-out",
                            boxShadow: isRevealed
                              ? "inset -2px -2px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.15)"
                              : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Status line */}
                <div
                  style={{
                    marginTop: 24,
                    color: "#fff",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textShadow: "2px 2px 0 #000",
                    minHeight: 14,
                  }}
                >
                  {currentStatus.text}
                </div>

                {/* Skip hint */}
                <div
                  style={{
                    position: "fixed",
                    bottom: 20,
                    right: 24,
                    fontSize: 8,
                    color: "#ddd",
                    letterSpacing: "0.2em",
                    textShadow: "1px 1px 0 #000",
                    opacity: 0.7,
                  }}
                >
                  [SPACE to skip]
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
