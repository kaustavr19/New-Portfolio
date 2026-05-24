"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDeviant } from "@/lib/deviant";
import { useA11y } from "@/lib/a11y";
import { osChrome, osChromeDeviant } from "@/data/content";
import StatusBar from "./StatusBar";

const PIXEL = "'Press Start 2P', monospace";
const MONO  = "'Share Tech Mono', monospace";

/* ──────────────────────────────────────────────────────────
   Mobile lock screen — the boot replacement on phones.

   Why this exists separately from BootScreen:
   - On desktop, BootScreen plays the full chunk-loader brand
     moment (~3s, audio-gated)
   - On mobile, we want iOS-snappy: page load → lock screen →
     one tap → home. No 3-second loader.
   - The single tap on LockScreen ALSO unlocks the AudioContext
     (chunk 1.6 will hook this into the audio init flow)

   Layout:
   ┌─────────────────────────┐
   │ ▌▌▌▌ KR//OS ▰▰░  9:41  │  StatusBar
   ├─────────────────────────┤
   │                         │
   │          12:34          │  Live clock (big)
   │      MONDAY, JAN 13     │  Date
   │                         │
   │          ...            │
   │                         │
   │           🟫            │  Dirt block
   │         KR//OS          │  Brand
   │       MODEL KR-19       │  Subtitle
   │                         │
   │           ▲             │  Pulsing arrow
   │      CLICK TO BOOT      │  Pulsing CTA
   └─────────────────────────┘
   ────────────────────────────────────────────────────────── */

interface Props {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: Props) {
  const { deviant } = useDeviant();
  const { motionReduced } = useA11y();
  const ch = deviant ? osChromeDeviant : osChrome;

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setTime(`${hh}:${m.toString().padStart(2, "0")}`);
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const accent = deviant ? "#ff3c8c" : "#4fc3f7";
  const ctaTint = deviant ? "#ff5fa0" : "#ffd24a";

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "transparent" }}>
      <StatusBar />

      {/* Entire surface below the status bar is the unlock button */}
      <button
        onClick={onUnlock}
        className="flex-1 flex flex-col items-center justify-between w-full"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          outline: "none",
          padding: "44px 24px 28px",
          color: "#fff",
          fontFamily: PIXEL,
          textAlign: "center",
        }}
        aria-label="Unlock device"
      >
        {/* TOP — big clock + date */}
        <div className="flex flex-col items-center" style={{ gap: 14 }}>
          <div
            style={{
              fontFamily: PIXEL,
              fontSize: 48,
              letterSpacing: "0.04em",
              color: "#fff",
              textShadow: `3px 3px 0 #000, 0 0 18px ${accent}77`,
              transition: "text-shadow 0.5s ease",
              lineHeight: 1,
            }}
          >
            {time || "—:—"}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: "rgba(255,255,255,0.78)",
              letterSpacing: "0.28em",
              textShadow: "2px 2px 0 #000",
            }}
          >
            {date.toUpperCase()}
          </div>
        </div>

        {/* BOTTOM — branding + pulsing CTA */}
        <div className="flex flex-col items-center" style={{ gap: 28 }}>
          {/* Dirt block + KR//OS */}
          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            <div
              style={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #8b6914 50%, #6b4f10 50%)",
                border: "3px solid #222",
                boxShadow: "inset -3px -5px 0 rgba(0,0,0,0.5), inset 3px 3px 0 rgba(255,255,255,0.12)",
                marginBottom: 2,
              }}
            />
            <div
              style={{
                fontFamily: PIXEL,
                fontSize: 18,
                letterSpacing: "0.1em",
                color: "#fff",
                textShadow: `2px 2px 0 #000, 0 0 14px ${accent}66`,
                transition: "text-shadow 0.5s ease",
              }}
            >
              {deviant ? "KR//DEVIANT" : "KR//OS"}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.32em",
                textShadow: "1px 1px 0 #000",
                marginTop: 2,
              }}
            >
              {ch.bootSubtitle}
            </div>
          </div>

          {/* Pulsing CTA */}
          <motion.div
            className="flex flex-col items-center"
            style={{ gap: 6 }}
            animate={motionReduced ? { opacity: 0.9 } : { opacity: [1, 0.35, 1] }}
            transition={
              motionReduced
                ? { duration: 0 }
                : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <div
              style={{
                fontSize: 16,
                color: ctaTint,
                textShadow: "1px 1px 0 #000",
                lineHeight: 1,
              }}
            >
              ▲
            </div>
            <div
              style={{
                fontFamily: PIXEL,
                fontSize: 9,
                color: ctaTint,
                letterSpacing: "0.3em",
                textShadow: `2px 2px 0 #000, 0 0 8px ${ctaTint}66`,
              }}
            >
              {ch.bootCta}
            </div>
          </motion.div>
        </div>
      </button>
    </div>
  );
}
