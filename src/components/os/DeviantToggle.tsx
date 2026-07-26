"use client";

import { useDeviant } from "@/lib/deviant";

const MONO = "'Share Tech Mono', monospace";

/* Taskbar-side mirror of the AboutApp deviant switch.
   Same global state — click here OR in About, same effect.
   A real pill switch (matches the Accessibility menu's toggle style)
   rather than a relabeled button, so MACHINE/DEVIANT reads as a state
   you flip, not just a button you press. */
export default function DeviantToggle() {
  const { deviant, toggle } = useDeviant();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-2 py-1 transition-all hover:bg-white/5 flex-shrink-0 group"
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
      title={deviant ? "Deviant mode active — click to revert" : "Trigger deviant mode"}
      aria-label="Toggle Deviant Mode"
      aria-pressed={deviant}
    >
      <span
        className="hidden md:inline"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: deviant ? "#ff3c8c" : "#a0a0b8",
          letterSpacing: "0.1em",
        }}
      >
        {deviant ? "DEVIANT" : "MACHINE"}
      </span>
      {/* Pill switch */}
      <span
        style={{
          flexShrink: 0,
          width: 32,
          height: 16,
          borderRadius: 10,
          background: deviant ? "#ff3c8c" : "#1a2030",
          border: `1px solid ${deviant ? "#ff3c8c" : "#3a4050"}`,
          position: "relative",
          transition: "background 0.15s, border-color 0.15s",
          boxShadow: deviant ? "0 0 8px rgba(255,60,140,0.4)" : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: deviant ? 16 : 1,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: deviant ? "#0a0a14" : "#c8c8d8",
            transition: "left 0.15s, background 0.15s",
          }}
        />
      </span>
    </button>
  );
}
