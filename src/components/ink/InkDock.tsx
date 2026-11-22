"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useA11y } from "@/lib/a11y";
import { useReaderMode } from "@/lib/reader-mode";
import { THEMES, useTheme } from "@/lib/theme";
import { INK_APPS, cityTime } from "./data";
import { useClock } from "./useClock";
import { SwitchRow } from "./ui";
import KrosMark from "./KrosMark";
import InkModePicker from "./InkModePicker";
import AskBar from "./AskBar";
import InkPet from "./pet/InkPet";

/* Theme switch — a segmented control; used in the dock menu and Settings. */
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="ink-seg" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button key={t.id} type="button" aria-pressed={theme === t.id} title={t.hint} onClick={() => setTheme(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* KR//OS system menu — theme, reading view, preferences. Opens from the dock. */
function SystemMenu({ onClose, onOpenApp }: { onClose: () => void; onOpenApp: (id: string) => void }) {
  const a11y = useA11y();
  const { setOpen: openReader } = useReaderMode();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as HTMLElement).closest("[data-dock-start]")) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="System menu"
      className="ink-card"
      style={{ position: "absolute", bottom: "calc(100% + 12px)", left: 0, width: 340, padding: 20, display: "flex", flexDirection: "column", gap: 18, boxShadow: "var(--ink-shadow)", animation: "ink-in .16s ease-out" }}
    >
      <div>
        <div className="ink-dot-900" style={{ fontSize: "var(--dot-m)", display: "flex", alignItems: "center", gap: 10 }}><KrosMark size={24} />KR//OS</div>
        <div className="ink-meta">Kaustav Roy · portfolio system</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="ink-label">Theme</span>
        <ThemePicker />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="ink-label">Appearance</span>
        <InkModePicker />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="ink-pill" onClick={() => { openReader(true); onClose(); }}>Reading view</button>
        <button type="button" className="ink-pill" onClick={() => { onOpenApp("settings"); onClose(); }}>About this OS</button>
        <Link className="ink-pill action" href="/work">Case studies ↗</Link>
      </div>
      <div style={{ borderTop: "1px solid var(--ink-line)" }}>
        <SwitchRow label="Sound effects" checked={a11y.soundEffects} onChange={() => a11y.toggle("soundEffects")} />
        <SwitchRow label="Ambience" checked={a11y.ambience} onChange={() => a11y.toggle("ambience")} />
        <SwitchRow label="Reduce motion" checked={a11y.motionReduced} onChange={() => a11y.toggle("motionReduced")} />
        <SwitchRow label="Dock pet" checked={a11y.dockPet} onChange={() => a11y.toggle("dockPet")} />
      </div>
    </div>
  );
}

export default function InkDock({
  openApps,
  focusedApp,
  onAppClick,
  onOpenApp,
}: {
  openApps: { id: string; minimized: boolean }[];
  focusedApp: string | null;
  onAppClick: (id: string) => void;
  onOpenApp: (id: string) => void;
}) {
  const [menu, setMenu] = useState(false);
  const { ambience, toggle, motionReduced } = useA11y();
  const now = useClock();
  const t = now ? cityTime(now) : null;

  return (
    <nav
      aria-label="Dock"
      className="ink"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 20,
        transform: "translateX(-50%)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 7,
        borderRadius: "var(--r-pill)",
        background: "var(--ink-dock)",
        border: "1px solid var(--ink-line-strong)",
        backdropFilter: "blur(10px)",
        maxWidth: "calc(100vw - 24px)",
      }}
    >
      <InkPet />
      <div style={{ position: "relative" }}>
        <button
          type="button"
          data-dock-start
          aria-expanded={menu}
          aria-haspopup="dialog"
          onClick={() => setMenu((m) => !m)}
          className="ink-dot-900"
          aria-label="KR//OS system menu"
          style={{ fontSize: 16, padding: "8px 14px", borderRadius: "var(--r-pill)", background: menu ? "var(--ink-raised)" : "transparent", display: "flex", alignItems: "center", gap: 8 }}
        >
          <KrosMark size={16} />
          KR//OS
        </button>
        {menu && <SystemMenu onClose={() => setMenu(false)} onOpenApp={onOpenApp} />}
      </div>
      <span aria-hidden style={{ width: 1, height: 20, background: "var(--ink-line-strong)", margin: "0 4px" }} />
      <AskBar variant="dock" />
      <span aria-hidden style={{ width: 1, height: 20, background: "var(--ink-line-strong)", margin: "0 4px" }} />

      {openApps.length === 0 && <span className="ink-meta" style={{ padding: "0 10px", whiteSpace: "nowrap" }}>No windows open</span>}
      {openApps.map(({ id, minimized }) => {
        const app = INK_APPS.find((a) => a.id === id);
        const active = id === focusedApp && !minimized;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onAppClick(id)}
            aria-pressed={active}
            title={minimized ? `Restore ${app?.name}` : `Minimise ${app?.name}`}
            className="ink-label"
            style={{
              padding: "9px 14px",
              borderRadius: "var(--r-pill)",
              background: active ? "var(--ink-fg)" : "transparent",
              color: active ? "var(--ink-on-fg)" : minimized ? "var(--ink-dim)" : "var(--ink-fg)",
              fontSize: 11,
              letterSpacing: ".08em",
            }}
          >
            {app?.name}
          </button>
        );
      })}

      <span aria-hidden style={{ width: 1, height: 20, background: "var(--ink-line-strong)", margin: "0 4px" }} />
      <button
        type="button"
        onClick={() => toggle("ambience")}
        aria-pressed={ambience}
        aria-label={ambience ? "Ambience on — mute" : "Ambience off — unmute"}
        title="Ambience"
        style={{ padding: "8px 12px", borderRadius: "var(--r-pill)", display: "flex", gap: 3, alignItems: "flex-end", height: 34 }}
      >
        {[0, 0.2, 0.4, 0.1].map((d, i) => (
          <i
            key={i}
            style={{
              display: "block",
              width: 3,
              height: ambience ? 15 : 4,
              borderRadius: 2,
              background: ambience ? "var(--ink-fg)" : "var(--ink-dim)",
              animation: ambience && !motionReduced ? `ink-eq 1.1s ease-in-out ${d}s infinite` : "none",
            }}
          />
        ))}
      </button>
      <a href="/Kaustav_Roy_CV.pdf" target="_blank" rel="noopener noreferrer" className="ink-label ink-blue" style={{ padding: "9px 12px", fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>
        Resume ↗
      </a>
      <span className="ink-dot" style={{ fontSize: "var(--dot-s)", padding: "0 12px 0 6px", minWidth: 70 }} aria-label={t ? `Kolkata time ${t.h}:${t.m}` : undefined}>
        {t ? (
          <>
            {t.h}
            <span className={motionReduced ? "" : "ink-blinker"}>:</span>
            {t.m}
          </>
        ) : "--:--"}
      </span>
    </nav>
  );
}
