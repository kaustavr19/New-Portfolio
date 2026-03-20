"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootScreenProps {
  onComplete: () => void;
}

type Phase = "minecraft" | "cyberpunk" | "detroit" | "done";

const MC_LINES = [
  "Generating world...",
  "Loading chunks [████████░░░░] 67%",
  "Spawning entities...",
  "Loading chunks [████████████] 100%",
  "Preparing spawn area...",
];

const CYBER_LINES = [
  "NEURAL LINK ESTABLISHED",
  "SCANNING WETWARE...",
  "BYPASSING ICE WALL... OK",
  "LOADING KR//OS v2.077",
  "JACK IN COMPLETE",
];

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<Phase>("minecraft");
  const [mcLine, setMcLine] = useState(0);
  const [cyberLine, setCyberLine] = useState(0);
  const [detroitProgress, setDetroitProgress] = useState(0);
  const [detroitDone, setDetroitDone] = useState(false);

  // Phase 1: Minecraft
  useEffect(() => {
    if (phase !== "minecraft") return;
    if (mcLine < MC_LINES.length) {
      const t = setTimeout(() => setMcLine((l) => l + 1), 340);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("cyberpunk"), 400);
      return () => clearTimeout(t);
    }
  }, [phase, mcLine]);

  // Phase 2: Cyberpunk
  useEffect(() => {
    if (phase !== "cyberpunk") return;
    if (cyberLine < CYBER_LINES.length) {
      const t = setTimeout(() => setCyberLine((l) => l + 1), 280);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("detroit"), 400);
      return () => clearTimeout(t);
    }
  }, [phase, cyberLine]);

  // Phase 3: Detroit progress bar
  useEffect(() => {
    if (phase !== "detroit") return;
    if (detroitProgress < 100) {
      const t = setTimeout(
        () => setDetroitProgress((p) => Math.min(p + 2, 100)),
        18
      );
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setDetroitDone(true), 500);
      return () => clearTimeout(t);
    }
  }, [phase, detroitProgress]);

  useEffect(() => {
    if (detroitDone) {
      const t = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [detroitDone, onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Minecraft Phase */}
          <AnimatePresence mode="wait">
            {phase === "minecraft" && (
              <motion.div
                key="minecraft"
                className="w-full h-full flex flex-col items-center justify-center"
                style={{ background: "#1a1a1a" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Dirt block icon */}
                <div
                  className="mb-8"
                  style={{
                    width: 64,
                    height: 64,
                    background: "linear-gradient(135deg, #8b6914 50%, #6b4f10 50%)",
                    border: "3px solid #555",
                    boxShadow: "inset -3px -5px 0 rgba(0,0,0,0.5), inset 3px 3px 0 rgba(255,255,255,0.1)",
                    imageRendering: "pixelated",
                  }}
                />
                <div
                  className="mb-6 text-center"
                  style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 22, lineHeight: 1.4 }}
                >
                  KR//OS
                </div>
                <div className="w-80 space-y-1">
                  {MC_LINES.slice(0, mcLine).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#aaa", lineHeight: 2 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Cyberpunk Phase */}
            {phase === "cyberpunk" && (
              <motion.div
                key="cyberpunk"
                className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: "#0d0d1a" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Grid lines */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div
                  className="mb-2"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 42,
                    fontWeight: 900,
                    color: "#f5e642",
                    textShadow: "0 0 12px #f5e642, 0 0 30px #f5e642",
                    letterSpacing: "0.2em",
                  }}
                >
                  KR//OS
                </div>
                <div
                  className="mb-8"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    color: "#00ffff",
                    letterSpacing: "0.4em",
                    textShadow: "0 0 8px #00ffff",
                  }}
                >
                  DESIGN × AI × ENTERPRISE UX
                </div>
                <div className="w-96 space-y-2">
                  {CYBER_LINES.slice(0, cyberLine).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 12,
                        color: i === cyberLine - 1 ? "#f5e642" : "#00ffff88",
                        letterSpacing: "0.1em",
                      }}
                    >
                      &gt; {line}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Detroit Phase */}
            {phase === "detroit" && (
              <motion.div
                key="detroit"
                className="w-full h-full flex flex-col items-center justify-center relative"
                style={{ background: "#0a1628" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Corner brackets */}
                {[
                  "top-8 left-8 border-t-2 border-l-2",
                  "top-8 right-8 border-t-2 border-r-2",
                  "bottom-8 left-8 border-b-2 border-l-2",
                  "bottom-8 right-8 border-b-2 border-r-2",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-8 h-8 ${cls}`}
                    style={{ borderColor: "#00e5ff" }}
                  />
                ))}

                {/* Scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, #00e5ff, transparent)" }}
                  animate={{ top: ["10%", "90%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                <div
                  className="mb-2 text-center"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    color: "#00e5ff88",
                    letterSpacing: "0.5em",
                  }}
                >
                  DETROIT SYSTEMS CORP
                </div>
                <div
                  className="mb-1"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 32,
                    color: "#4fc3f7",
                    letterSpacing: "0.15em",
                    textShadow: "0 0 20px #4fc3f7",
                  }}
                >
                  KAUSTAV ROY
                </div>
                <div
                  className="mb-8"
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    color: "#00e5ff",
                    letterSpacing: "0.4em",
                  }}
                >
                  UNIT KR-19 — INITIALIZING
                </div>

                {/* Progress bar */}
                <div
                  className="relative w-80 h-2 mb-3"
                  style={{ background: "#0d2035", border: "1px solid #00e5ff44" }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      width: `${detroitProgress}%`,
                      background: "linear-gradient(90deg, #00e5ff, #4fc3f7)",
                      boxShadow: "0 0 8px #00e5ff",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10,
                    color: "#00e5ff88",
                    letterSpacing: "0.2em",
                  }}
                >
                  {detroitDone ? "SYSTEM READY" : `LOADING... ${detroitProgress}%`}
                </div>

                {detroitDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 13,
                      color: "#00e5ff",
                      letterSpacing: "0.3em",
                      textShadow: "0 0 12px #00e5ff",
                    }}
                  >
                    WELCOME BACK
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
