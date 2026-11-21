"use client";

import { INK_MODES, setInkMode, useInkMode } from "@/lib/theme";

/* Auto (follow the system) / Light / Dark — for InkOS only. */
export default function InkModePicker({ compact = false }: { compact?: boolean }) {
  const mode = useInkMode();
  return (
    <div className="ink-seg" role="group" aria-label="Appearance" style={compact ? { padding: 3 } : undefined}>
      {INK_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          title={m.id === "system" ? "Follow your device's light or dark setting" : `Always ${m.label.toLowerCase()}`}
          onClick={() => setInkMode(m.id)}
          style={compact ? { padding: "6px 10px", fontSize: 10 } : undefined}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
