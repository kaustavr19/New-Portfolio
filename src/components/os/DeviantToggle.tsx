"use client";

import { useDeviant } from "@/lib/deviant";

const MONO = "'Share Tech Mono', monospace";

/* Taskbar-side mirror of the AboutApp deviant switch.
   Same global state — click here OR in About, same effect. */
export default function DeviantToggle() {
  const { deviant, toggle } = useDeviant();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1 transition-all hover:bg-white/5 flex-shrink-0 group"
      style={{
        fontFamily: MONO,
        fontSize: 11,
        color: deviant ? "#ff3c8c" : "#a0a0b8",
        letterSpacing: "0.1em",
        border: `1px solid ${deviant ? "#ff3c8c66" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 2,
        marginRight: 8,
        background: deviant ? "rgba(255,0,144,0.06)" : "transparent",
        boxShadow: deviant ? "0 0 8px rgba(255,0,144,0.25)" : "none",
      }}
      title={deviant ? "Deviant mode active — click to revert" : "Trigger deviant mode"}
      aria-label="Toggle Deviant Mode"
      aria-pressed={deviant}
    >
      <i
        className="hn hn-exclamation-triangle"
        style={{ fontSize: 12, color: deviant ? "#ff3c8c" : "#6a6a7a" }}
      />
      <span className="hidden md:inline group-hover:text-white transition-colors">
        {deviant ? "DEVIANT" : "MACHINE"}
      </span>
    </button>
  );
}
