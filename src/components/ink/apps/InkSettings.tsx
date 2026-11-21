"use client";

import Link from "next/link";
import { useA11y } from "@/lib/a11y";
import { requestPersonnelBrief } from "@/lib/personnel-brief";
import { useReaderMode } from "@/lib/reader-mode";
import { THEMES, useTheme, type ThemeId } from "@/lib/theme";
import { SectionHead, SwitchRow } from "../ui";

/* A tiny swatch per theme so the choice is visual, not just a label. */
const SWATCH: Record<ThemeId, string[]> = {
  ink: ["#000", "#f2f2f2", "#ff3b30", "#7ab2ff"],
  classic: ["#0a1628", "#4fc3f7", "#a4c639", "#f5e642"],
  deviant: ["#16040a", "#ff3c8c", "#b4005a", "#ff6464"],
};

export default function InkSettings() {
  const a11y = useA11y();
  const { theme, setTheme } = useTheme();
  const { setOpen: openReader } = useReaderMode();

  const replayBoot = () => {
    try {
      localStorage.removeItem("kros_booted");
      sessionStorage.removeItem("kros_booted");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="ink-app ink-app-scroll">
      <div style={{ padding: "clamp(20px, 3cqi, 36px)", display: "flex", flexDirection: "column", gap: 30, maxWidth: 820 }}>
        <section>
          <SectionHead as="h3">Theme</SectionHead>
          <div role="radiogroup" aria-label="Theme" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {THEMES.map((t) => {
              const on = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTheme(t.id)}
                  style={{ textAlign: "left", padding: 16, borderRadius: 18, border: `1px solid ${on ? "var(--ink-fg)" : "var(--ink-line)"}`, background: on ? "var(--ink-raised)" : "transparent", display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <span aria-hidden style={{ display: "flex", gap: 4 }}>
                    {SWATCH[t.id].map((c) => <span key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "1px solid #ffffff22" }} />)}
                  </span>
                  <span>
                    <span className="ink-dot-900" style={{ display: "block", fontSize: 20 }}>{t.label.toUpperCase()}</span>
                    <span className="ink-meta">{t.hint}</span>
                  </span>
                  <span className={`ink-label ${on ? "ink-live" : ""}`} style={{ color: on ? "var(--ink-fg)" : undefined }}>{on ? "Active" : "Switch"}</span>
                </button>
              );
            })}
          </div>
          <p className="ink-meta" style={{ marginTop: 10 }}>Saved on this device. Terminal shortcuts: <code>ink</code>, <code>classic</code>, <code>deviant</code>.</p>
        </section>

        <section>
          <SectionHead as="h3">Accessibility</SectionHead>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <SwitchRow label="Reduce motion" hint="Stops the boot sweep, light-bar pulses and blinking dots" checked={a11y.motionReduced} onChange={() => a11y.toggle("motionReduced")} />
            <SwitchRow label="Sound effects" hint="Clicks and the open-window chime" checked={a11y.soundEffects} onChange={() => a11y.toggle("soundEffects")} />
            <SwitchRow label="Ambience" hint="A quiet background hum" checked={a11y.ambience} onChange={() => a11y.toggle("ambience")} />
            <SwitchRow label="High contrast" hint="Brighter secondary text in the classic theme" checked={a11y.highContrast} onChange={() => a11y.toggle("highContrast")} />
          </div>
        </section>

        <section>
          <SectionHead as="h3">System</SectionHead>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="ink-pill" onClick={() => openReader(true)}>Reading view</button>
            <button type="button" className="ink-pill" onClick={requestPersonnelBrief}>Show the welcome brief</button>
            <button type="button" className="ink-pill" onClick={replayBoot}>Replay boot</button>
            <Link className="ink-pill action" href="/work">All work ↗</Link>
          </div>
          <p className="ink-meta" style={{ marginTop: 14 }}>KR//OS · InkOS build 2.077 · Doto, Space Mono, Inter</p>
        </section>
      </div>
    </div>
  );
}
