"use client";

import Link from "next/link";
import { useA11y } from "@/lib/a11y";
import { requestPersonnelBrief } from "@/lib/personnel-brief";
import { useReaderMode } from "@/lib/reader-mode";
import { THEMES, useTheme, type ThemeId } from "@/lib/theme";
import { SectionHead, SwitchRow } from "../ui";
import SoundLab from "../SoundLab";
import InkModePicker from "../InkModePicker";

/* The colophon — how the OS is made. Facts only; keep in step with the code. */
const COLOPHON: { term: string; detail: string }[] = [
  { term: "Wallpaper", detail: "One canvas of fixed dots. The logo, clouds, rain, birds and stars are drawn by brightening dots that never move — and the sky follows the real Kolkata weather (Open-Meteo, refreshed every 30 min)." },
  { term: "Sound", detail: "Synthesised live with the Web Audio API — no audio files. The rain you hear is drops landing on the wallpaper, panned to where they fall." },
  { term: "Ask KR-19", detail: "The terminal answers questions with no AI: it parses the question, computes the answer from this site's own content, and falls back to a BM25 search." },
  { term: "Type", detail: "Doto for the dot-matrix display, Space Mono for data, Inter for reading. Monochrome, with red for state and blue for actions." },
  { term: "Stack", detail: "Next.js 16, React 19 and TypeScript, deployed on Vercel. Light and dark themes, reduced-motion support and a plain reading view at /work." },
];

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
        <section id="about-os" aria-label="About this OS">
          <SectionHead as="h3">About this OS</SectionHead>
          <p className="ink-body" style={{ maxWidth: 620 }}>
            KR//OS is a portfolio built as an operating system — designed and coded by Kaustav Roy. Everything below is live, not a recording.
          </p>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 14 }}>
            {COLOPHON.map((c) => (
              <div key={c.term} className="ink-card" style={{ padding: "14px 16px" }}>
                <dt className="ink-label">{c.term}</dt>
                <dd style={{ fontSize: 14, lineHeight: 1.5, marginTop: 6, color: "var(--ink-soft)" }}>{c.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

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
                    {SWATCH[t.id].map((c) => <span key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "1px solid var(--ink-line-strong)" }} />)}
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
          <SectionHead as="h3">Appearance</SectionHead>
          <InkModePicker />
          <p className="ink-meta" style={{ marginTop: 10 }}>Auto follows your device&apos;s light or dark setting. Applies to InkOS and the reading pages.</p>
        </section>

        <section>
          <SectionHead as="h3">Accessibility</SectionHead>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <SwitchRow label="Reduce motion" hint="Stops the boot sweep, light-bar pulses and blinking dots" checked={a11y.motionReduced} onChange={() => a11y.toggle("motionReduced")} />
            <SwitchRow label="Sound effects" hint="Window blips, relay ticks on toggles, a soft thock on the desktop" checked={a11y.soundEffects} onChange={() => a11y.toggle("soundEffects")} />
            <SwitchRow label="Ambience" hint="Calm room tone and pad, plus stars, birds and rain from the wallpaper" checked={a11y.ambience} onChange={() => a11y.toggle("ambience")} />
            <SwitchRow label="High contrast" hint="Brighter secondary text in the classic theme" checked={a11y.highContrast} onChange={() => a11y.toggle("highContrast")} />
          </div>
        </section>

        <SoundLab />

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
