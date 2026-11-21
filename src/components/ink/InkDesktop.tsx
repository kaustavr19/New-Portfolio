"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { desktopIcons, profile } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { parseHash, setAppHash } from "@/lib/deep-link";
import { playCodecBeep } from "@/lib/sound";
import InkWindow, { type Rect } from "./InkWindow";
import InkDock from "./InkDock";
import InkBrief from "./InkBrief";
import { INK_APPS, CITY, CURRENT, LIVE_PROJECT, LONGFORM_COUNT, cityDate, cityTime } from "./data";
import { useClock } from "./useClock";
import { Icon, SegBar } from "./ui";
import { INK_APP_COMPONENTS } from "./apps";

type Win = { open: boolean; minimized: boolean; z: number; order: number };
type Wins = Record<string, Win>;

/* Stacking and cascade order come from state, not module counters, so they
   survive hot reloads and remounts. */
const nextZ = (w: Wins) => Math.max(10, ...Object.values(w).map((x) => x.z)) + 1;
const nextOrder = (w: Wins) => Object.values(w).filter((x) => x.open).length;

function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

/* ── Widgets ── */
function Widgets({ onOpenApp }: { onOpenApp: (id: string, sub?: string) => void }) {
  const now = useClock();
  const t = now ? cityTime(now) : null;
  const { motionReduced } = useA11y();
  return (
    <aside aria-label="Widgets" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="ink-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="ink-label">{CITY}</span>
          <span className="ink-label">{now ? cityDate(now) : ""}</span>
        </div>
        <div className="ink-dot-900" style={{ fontSize: 74, lineHeight: 0.9, marginTop: 14 }} aria-label={t ? `${CITY} time ${t.h}:${t.m}` : undefined}>
          {t ? t.h : "--"}
          <span className={`ink-red ${motionReduced ? "" : "ink-blinker"}`}>:</span>
          {t ? t.m : "--"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="ink-card">
          <span className="ink-label">Status</span>
          <div className="ink-dot-900" style={{ fontSize: 24, marginTop: 14 }}>{profile.status}</div>
          <div className="ink-meta" style={{ marginTop: 6 }}>{profile.unit} · online</div>
        </div>
        <button type="button" className="ink-card" style={{ textAlign: "left" }} onClick={() => onOpenApp("projects")}>
          <span className="ink-label">Missions</span>
          <div className="ink-dot-900" style={{ fontSize: 44, lineHeight: 1, marginTop: 10 }}>{String(LONGFORM_COUNT).padStart(2, "0")}</div>
          <div className="ink-meta" style={{ marginTop: 6 }}>long-form case studies</div>
        </button>
      </div>
      {LIVE_PROJECT && (
        <button type="button" className="ink-card" style={{ textAlign: "left" }} onClick={() => onOpenApp("projects", LIVE_PROJECT!.id)}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="ink-label ink-live">Live now</span>
            <span className="ink-meta ink-blue">open →</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>{LIVE_PROJECT.name}</div>
          <div className="ink-meta" style={{ marginTop: 4 }}>{LIVE_PROJECT.tagline}</div>
        </button>
      )}
      {CURRENT.project && (
        <button type="button" className="ink-card" style={{ textAlign: "left" }} onClick={() => onOpenApp("projects", CURRENT.project!.id)}>
          <span className="ink-label">Currently</span>
          <div style={{ fontSize: 15, marginTop: 10, lineHeight: 1.5 }}>
            {CURRENT.project.name} at <b style={{ fontWeight: 600 }}>{CURRENT.company.charAt(0) + CURRENT.company.slice(1).toLowerCase()}</b>
          </div>
          <div style={{ marginTop: 14 }}>
            <SegBar value={CURRENT.project.completion} live label="Mission progress" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span className="ink-meta">mission progress</span>
            <span className="ink-meta">{CURRENT.project.completion}%</span>
          </div>
        </button>
      )}
    </aside>
  );
}

export default function InkDesktop() {
  const { soundEffects, motionReduced } = useA11y();
  const vp = useViewport();
  const [wins, setWins] = useState<Wins>({});

  /* Layout: widgets column on the left, icon rail on the right, windows
     between them; both side columns fold away on narrower screens. */
  const showWidgets = vp.w >= 1180;
  const left = showWidgets ? 360 : 24;
  const right = vp.w >= 900 ? 200 : 24;
  const DOCK = 92;
  const bounds: Rect = { x: 16, y: 16, w: vp.w - 32, h: vp.h - 16 - DOCK };
  const baseRect = useCallback(
    (order: number): Rect => {
      const off = (order % 4) * 26;
      return { x: left + off, y: 28 + off, w: Math.max(560, vp.w - left - right - 12 - 3 * 26), h: Math.max(420, vp.h - 28 - DOCK - 6 - 3 * 26) };
    },
    [left, right, vp],
  );

  const openApp = useCallback(
    (id: string) => {
      setWins((prev) => ({
        ...prev,
        [id]: { open: true, minimized: false, z: nextZ(prev), order: prev[id]?.open ? prev[id].order : nextOrder(prev) },
      }));
      setAppHash(id);
      if (soundEffects) playCodecBeep();
    },
    [soundEffects],
  );

  const openAppAt = useCallback(
    (id: string, sub?: string) => {
      if (sub) {
        window.history.replaceState(null, "", `#${id}/${sub}`);
        window.dispatchEvent(new Event("hashchange"));
      }
      openApp(id);
    },
    [openApp],
  );

  const close = useCallback((id: string) => setWins((p) => ({ ...p, [id]: { ...p[id], open: false } })), []);
  const minimize = useCallback((id: string) => setWins((p) => ({ ...p, [id]: { ...p[id], minimized: true } })), []);
  const focus = useCallback((id: string) => {
    setWins((p) => (p[id] && p[id].z === nextZ(p) - 1 ? p : { ...p, [id]: { ...p[id], z: nextZ(p) } }));
    setAppHash(id);
  }, []);

  // Global "open app" events (terminal, brief, widgets) + deep links.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (desktopIcons.some((ic) => ic.id === id)) openApp(id);
    };
    const fromHash = () => {
      const target = parseHash();
      if (target && desktopIcons.some((ic) => ic.id === target.app)) openApp(target.app);
    };
    fromHash();
    window.addEventListener("kros:open-app", onOpen);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("kros:open-app", onOpen);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [openApp]);

  // Alt+1…7 opens apps, like the classic desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA") return;
      if (e.altKey && /^[1-7]$/.test(e.key)) {
        e.preventDefault();
        const ic = desktopIcons[Number(e.key) - 1];
        if (ic) openApp(ic.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openApp]);

  const visible = Object.entries(wins).filter(([, w]) => w.open && !w.minimized);
  const focusedId = visible.length ? visible.reduce((a, b) => (b[1].z > a[1].z ? b : a))[0] : null;
  const openList = useMemo(
    () => Object.entries(wins).filter(([, w]) => w.open).sort((a, b) => a[1].order - b[1].order).map(([id, w]) => ({ id, minimized: w.minimized })),
    [wins],
  );

  const onDockApp = (id: string) => {
    const w = wins[id];
    if (!w) return;
    if (w.minimized) {
      setWins((p) => ({ ...p, [id]: { ...p[id], minimized: false, z: nextZ(p) } }));
    } else if (id !== focusedId) focus(id);
    else minimize(id);
  };

  return (
    <div className={`ink fixed inset-0 select-none ${motionReduced ? "ink-motion-off" : ""}`} style={{ background: "#000" }}>
      <div aria-hidden className="ink-dotgrid absolute inset-0" />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 45% 40%, transparent 40%, #000 95%)" }} />
      <h1 className="sr-only">KR//OS — {profile.name}, {profile.designation}</h1>

      {showWidgets && (
        <div className="absolute ink-scroll" style={{ left: 40, top: 32, width: 300, bottom: DOCK + 8, zIndex: 1 }}>
          <Widgets onOpenApp={openAppAt} />
        </div>
      )}

      <nav aria-label="Apps" className="absolute" style={{ right: vp.w >= 900 ? 40 : 16, top: 32, zIndex: 1, display: "grid", gridTemplateColumns: vp.w >= 900 ? "repeat(2, 72px)" : "72px", gap: "18px 12px" }}>
        {INK_APPS.map((app) => {
          const on = wins[app.id]?.open && !wins[app.id]?.minimized;
          return (
            <button key={app.id} type="button" onClick={() => openApp(app.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }} aria-label={`Open ${app.name}`}>
              <span style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", background: on ? "var(--ink-fg)" : "var(--ink-raised)", border: "1px solid var(--ink-line)", color: on ? "#000" : "var(--ink-fg)", transition: "background .15s" }}>
                <Icon name={app.id} size={25} />
              </span>
              <span className="ink-meta" style={{ color: "var(--ink-fg)", fontSize: 10.5 }}>{app.name}</span>
            </button>
          );
        })}
        <a href="/Kaustav_Roy_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }} aria-label="Resume (PDF)">
          <span style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", border: "1px solid #7ab2ff66", color: "var(--ink-blue)" }}>
            <Icon name="resume" size={25} />
          </span>
          <span className="ink-meta ink-blue" style={{ fontSize: 10.5 }}>Resume</span>
        </a>
      </nav>

      {INK_APPS.map((app) => {
        const w = wins[app.id];
        if (!w?.open) return null;
        const Comp = INK_APP_COMPONENTS[app.id];
        return (
          <InkWindow
            key={app.id}
            id={app.id}
            title={app.title}
            index={`${app.index}/0${INK_APPS.length}`}
            isOpen={w.open}
            isMinimized={w.minimized}
            isFocused={app.id === focusedId}
            zIndex={w.z}
            initial={baseRect(w.order)}
            bounds={bounds}
            onClose={close}
            onMinimize={minimize}
            onFocus={focus}
          >
            {Comp ? <Comp /> : null}
          </InkWindow>
        );
      })}

      <InkDock openApps={openList} focusedApp={focusedId} onAppClick={onDockApp} onOpenApp={openApp} />
      <InkBrief />
    </div>
  );
}
