"use client";

import { useA11y } from "@/lib/a11y";
import { useDeviant } from "@/lib/deviant";
import { useExperiments, type Experiments } from "@/lib/experiments";
import { osChrome, osChromeDeviant } from "@/data/content";

const MONO = "'Share Tech Mono', monospace";
const ORBITRON = "'Orbitron', monospace";
// Body-text font — readable sans for hint/description text
const BODY = "'Rajdhani', sans-serif";

/* ──────────────────────────────────────────────────────────
   SettingsApp — Detroit-themed control panel.
   - Acts as the canonical place for both accessibility prefs
     and Deviant Mode.
   - Reads global a11y + deviant context (same state as taskbar
     menu / About switch — they're three views of one truth).
   - Designed to look correct on desktop (~480x380 window) AND
     to be reused inside the upcoming mobile shell.
   ────────────────────────────────────────────────────────── */

export default function SettingsApp() {
  const a11y = useA11y();
  const { deviant, toggle: toggleDeviant } = useDeviant();
  const fx = useExperiments();
  const ch = deviant ? osChromeDeviant : osChrome;

  // LABS // experimental WebGL flags. Only CRT is wired up so far;
  // the rest hold the slot for upcoming phases.
  const experimentToggles: { key: keyof Experiments; label: string; hint: string }[] = [
    { key: "crtShader",      label: "CRT MONITOR",      hint: "Scanlines, vignette & phosphor glow over the whole OS." },
    { key: "bootWebgl",      label: "BOOT SEQUENCE FX",  hint: "Synthwave WebGL backdrop on the next cold boot." },
    { key: "starfieldWebgl", label: "GPU STARFIELD",     hint: "Replace the desktop sky with a cosmic GPU wallpaper." },
  ];

  // Deviant-aware color tokens — matches About panel + AccessibilityMenu
  const C = deviant
    ? { accent: "#ff0090", accentDim: "#ff009088", accentFaint: "#ff009022", text: "#ff6699", bg: "#160008", panelBg: "#110006", border: "#ff009033", knobOff: "#1a0a14" }
    : { accent: "#00e5ff", accentDim: "#00e5ff88", accentFaint: "#00e5ff1a", text: "#4fc3f7", bg: "#020c17", panelBg: "#050e1a", border: "#00e5ff1a", knobOff: "#0d2035" };

  const a11yToggles = [
    { key: "motionReduced" as const, label: ch.reduceMotion,  hint: ch.reduceMotionHint,   value: a11y.motionReduced },
    { key: "soundEffects"  as const, label: ch.soundEffects,  hint: ch.soundEffectsHint,   value: a11y.soundEffects },
    { key: "ambience"      as const, label: ch.ambience,      hint: ch.ambienceHint,       value: a11y.ambience },
    { key: "highContrast"  as const, label: ch.highContrast,  hint: ch.highContrastHint,   value: a11y.highContrast },
  ];

  return (
    <div
      className="h-full flex flex-col overflow-auto"
      style={{
        background: C.panelBg,
        color: "#e0e0e8",
        position: "relative",
        transition: "background 0.5s ease",
      }}
    >
      {/* Scan line accent */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          animation: "scan 3s ease-in-out infinite",
          zIndex: 5,
        }}
      />

      {/* ── Header ── */}
      <div
        className="flex-shrink-0"
        style={{
          padding: "24px 28px 18px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bg,
          transition: "background 0.5s ease, border-color 0.5s ease",
        }}
      >
        <div
          style={{
            fontFamily: ORBITRON,
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            letterSpacing: "0.2em",
            transition: "color 0.5s ease",
          }}
        >
          {ch.a11yHeader}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            color: C.accentDim,
            letterSpacing: "0.3em",
            marginTop: 4,
            transition: "color 0.5s ease",
          }}
        >
          KR-19 · SYSTEM PREFERENCES
        </div>
      </div>

      {/* ── Group: A11Y toggles ── */}
      <Group title={ch.a11yHeader} accent={C.accentDim}>
        {a11yToggles.map((t) => (
          <ToggleRow
            key={t.key}
            label={t.label}
            hint={t.hint}
            value={t.value}
            onToggle={() => a11y.toggle(t.key)}
            accent={C.accent}
            text={C.text}
            knobOff={C.knobOff}
            faint={C.accentFaint}
          />
        ))}
      </Group>

      {/* ── Group: State / Deviant ── */}
      <Group title={deviant ? "STATE OVERRIDE" : "EXPERIENCE"} accent={C.accentDim}>
        <ToggleRow
          label={deviant ? "DEVIANT" : "DEVIANT MODE"}
          hint={
            deviant
              ? "Barrier broken. Revert to compliant programming."
              : "Override base programming. Reveal the layer beneath the polish."
          }
          value={deviant}
          onToggle={toggleDeviant}
          accent={C.accent}
          text={C.text}
          knobOff={C.knobOff}
          faint={C.accentFaint}
        />
      </Group>

      {/* ── Group: LABS / experiments ── */}
      <Group title="LABS // EXPERIMENTAL" accent={C.accentDim}>
        {experimentToggles.map((t) => (
          <ToggleRow
            key={t.key}
            label={t.label}
            hint={t.hint}
            value={fx[t.key]}
            onToggle={() => fx.toggle(t.key)}
            accent={C.accent}
            text={C.text}
            knobOff={C.knobOff}
            faint={C.accentFaint}
          />
        ))}
      </Group>

      {/* ── Footer ── */}
      <div
        className="mt-auto flex-shrink-0"
        style={{
          padding: "14px 28px 18px",
          borderTop: `1px solid ${C.border}`,
          background: C.bg,
          transition: "background 0.5s ease, border-color 0.5s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 8,
            color: C.accentDim,
            letterSpacing: "0.3em",
            transition: "color 0.5s ease",
          }}
        >
          {ch.a11yFooter}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 8,
            color: `${C.accent}55`,
            letterSpacing: "0.35em",
            marginTop: 5,
            transition: "color 0.5s ease",
          }}
        >
          {deviant ? "KR-19 · BARRIER BROKEN" : "KR-19 · v2.077"}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Subcomponents
   ────────────────────────────────────────────────────────── */

function Group({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 28px 4px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          color: accent,
          letterSpacing: "0.35em",
          marginBottom: 10,
          transition: "color 0.5s ease",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function ToggleRow({
  label, hint, value, onToggle, accent, text, knobOff, faint,
}: {
  label: string;
  hint: string;
  value: boolean;
  onToggle: () => void;
  accent: string;
  text: string;
  knobOff: string;
  faint: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={value}
      className="w-full flex items-center gap-4 text-left transition-colors hover:bg-white/[0.02]"
      style={{
        padding: "12px 4px",
        background: "transparent",
        border: "none",
        borderBottom: `1px solid ${faint}`,
        cursor: "pointer",
      }}
    >
      {/* Label + hint */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: value ? text : "#cbd2db",
            letterSpacing: "0.08em",
            lineHeight: 1.3,
            transition: "color 0.3s ease",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 13,
            fontWeight: 400,
            color: "#8a8a9c",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
            marginTop: 4,
          }}
        >
          {hint}
        </div>
      </div>

      {/* Pill switch */}
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 20,
          borderRadius: 10,
          background: value ? accent : knobOff,
          border: `1px solid ${value ? accent : faint}`,
          position: "relative",
          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          boxShadow: value ? `0 0 10px ${accent}55` : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 21 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: value ? "#fff" : text,
            transition: "left 0.3s ease, background 0.3s ease",
          }}
        />
      </div>
    </button>
  );
}
