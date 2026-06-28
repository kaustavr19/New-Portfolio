"use client";

import { useEffect, useState } from "react";
import { useDeviant } from "@/lib/deviant";
import KRMark from "../KRMark";

const MONO = "'Share Tech Mono', monospace";

/* ──────────────────────────────────────────────────────────
   Mobile status bar — iOS-leaning layout:
   ┌───────────────────────────────────────────┐
   │  9:41        KR//OS        ▌▌▌▌ ▰▰▰░     │
   └───────────────────────────────────────────┘
   - Left:  live time
   - Mid:   KR//OS mark (KR//DEVIANT in deviant mode)
   - Right: pixel-art signal bars + battery
   ────────────────────────────────────────────────────────── */

export default function StatusBar({
  height = 28,
  textColor = "rgba(255,255,255,0.92)",
}: {
  height?: number;
  textColor?: string;
}) {
  const { deviant } = useDeviant();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // 12-hour without AM/PM, iOS-style
      const h = now.getHours();
      const m = now.getMinutes();
      const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setTime(`${hh}:${m.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const markColor = deviant ? "#ff3c8c" : "#4fc3f7";
  const signalColor = deviant ? "#ff8db8" : textColor;
  const batteryColor = deviant ? "#ff8db8" : textColor;

  return (
    <div
      className="flex items-center justify-between flex-shrink-0 select-none"
      style={{
        // env(safe-area-inset-top) adds room above the bar on notched
        // phones; fall back to 0 on browsers / non-notched devices.
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "max(14px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(14px, env(safe-area-inset-right, 0px))",
        minHeight: height,
        boxSizing: "content-box",
        fontFamily: MONO,
        fontSize: 11,
        color: textColor,
        letterSpacing: "0.08em",
      }}
    >
      {/* Left: time */}
      <div style={{ minWidth: 48, fontWeight: 600 }}>{time}</div>

      {/* Center: brand mark */}
      <div className="flex items-center gap-1" style={{ fontSize: 10, letterSpacing: "0.18em" }}>
        <KRMark height={11} color={markColor} />
        <span style={{ color: "rgba(255,255,255,0.35)" }}>//</span>
        <span style={{ color: "#f5e642", fontWeight: 700 }}>{deviant ? "DEVIANT" : "OS"}</span>
      </div>

      {/* Right: signal + battery */}
      <div className="flex items-center gap-2" style={{ minWidth: 48, justifyContent: "flex-end" }}>
        {/* Signal bars (4, increasing) */}
        <div className="flex items-end gap-[1px]" style={{ height: 10 }}>
          {[3, 5, 7, 9].map((h) => (
            <div key={h} style={{ width: 2, height: h, background: signalColor }} />
          ))}
        </div>
        {/* Battery — rectangle + nub */}
        <div className="flex items-center">
          <div
            style={{
              width: 18,
              height: 9,
              border: `1px solid ${batteryColor}`,
              borderRadius: 1,
              padding: 1,
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <div
              style={{
                width: deviant ? "35%" : "78%",
                height: "100%",
                background: deviant ? "#ff3c8c" : batteryColor,
                transition: "width 0.4s ease, background 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              width: 2,
              height: 5,
              background: batteryColor,
              marginLeft: 1,
              borderRadius: "0 1px 1px 0",
            }}
          />
        </div>
      </div>
    </div>
  );
}
