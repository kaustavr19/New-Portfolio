"use client";

import { THEMES, useTheme } from "@/lib/theme";

const MONO = "'Share Tech Mono', monospace";

/* Classic-shell theme picker: three chips, the active one filled.
   Lives in the Control Center and in Settings.cfg so visitors on the
   classic or deviant theme can always get back to InkOS. */
export default function ThemeSwitch({ accent = "#4fc3f7", block = false }: { accent?: string; block?: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <div role="group" aria-label="Theme" style={{ display: "flex", gap: 6, width: block ? "100%" : undefined }}>
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            title={t.hint}
            onClick={() => setTheme(t.id)}
            style={{
              flex: block ? 1 : undefined,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.12em",
              padding: "6px 10px",
              borderRadius: 3,
              cursor: "pointer",
              color: on ? "#0a0a14" : "#d0d6e0",
              background: on ? accent : "transparent",
              border: `1px solid ${on ? accent : "rgba(255,255,255,0.18)"}`,
            }}
          >
            {t.label.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
