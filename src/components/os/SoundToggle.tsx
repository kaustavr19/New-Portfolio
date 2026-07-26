"use client";

import { useA11y } from "@/lib/a11y";

const MONO = "'Share Tech Mono', monospace";

/* Dedicated, one-click sound mute toggle — mirrors the `soundEffects` a11y
   pref (also toggleable from the Accessibility menu), but surfaced directly
   in the taskbar since sound-on/off is common enough to want a single
   click rather than a popover. Muted by default; this is the "obvious
   toggle" that makes it discoverable. */
export default function SoundToggle() {
  const { soundEffects, toggle } = useA11y();

  return (
    <button
      onClick={() => toggle("soundEffects")}
      className="flex items-center gap-2 px-2 py-1 transition-all hover:bg-white/5 flex-shrink-0 group"
      style={{ border: "none", background: "transparent", cursor: "pointer" }}
      title={soundEffects ? "Sound on — click to mute" : "Sound muted — click to enable"}
      aria-label="Toggle sound effects"
      aria-pressed={soundEffects}
    >
      <i
        className={`hn ${soundEffects ? "hn-sound-on" : "hn-sound-mute"}`}
        style={{ fontSize: 13, color: soundEffects ? "#4fc3f7" : "#6a6a7e" }}
      />
      <span
        className="hidden md:inline"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: soundEffects ? "#4fc3f7" : "#6a6a7e",
          letterSpacing: "0.1em",
        }}
      >
        {soundEffects ? "SOUND" : "MUTED"}
      </span>
    </button>
  );
}
