"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { desktopIcons, profile } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { parseHash, setAppHash } from "@/lib/deep-link";
import { uiOpen } from "@/lib/ink-sound";
import InkWindow, { type Rect } from "./InkWindow";
import InkDock from "./InkDock";
import InkPet from "./pet/InkPet";
import InkBrief from "./InkBrief";
import { INK_APPS } from "./data";
import { Icon } from "./ui";
import InkWallpaper from "./InkWallpaper";
import { ClockCard, CurrentlyCard, ExperienceTile, StatusTile, WorkMap, type OpenApp } from "./widgets";
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
/* Short screens: shrink the column to fit instead of scrolling. Scale it
   down a little first; if that would get too small, drop the lowest-priority
   card (Currently) and fit the rest. */
const MIN_SCALE = 0.84;
const GAP = 14;

function Widgets({ onOpenApp }: { onOpenApp: OpenApp }) {
  const asideRef = useRef<HTMLElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const curH = useRef(0); // last measured Currently height + gap, remembered while it's hidden
  const [fit, setFit] = useState({ scale: 1, showCurrently: true, h: 0 });

  useLayoutEffect(() => {
    const aside = asideRef.current;
    const box = aside?.parentElement?.parentElement; // the absolutely-positioned column
    if (!aside || !box) return;
    const measure = () => {
      const room = box.clientHeight;
      if (curRef.current) curH.current = curRef.current.offsetHeight + GAP;
      const h = aside.offsetHeight; // layout height, unaffected by the transform
      const full = curRef.current ? h : h + curH.current;
      let next: { scale: number; showCurrently: boolean; h: number };
      if (full <= room) next = { scale: 1, showCurrently: true, h: full };
      else if (room / full >= MIN_SCALE) next = { scale: room / full, showCurrently: true, h: full };
      else {
        const rest = full - curH.current;
        next = { scale: Math.min(1, room / rest), showCurrently: false, h: rest };
      }
      setFit((p) => (p.scale === next.scale && p.showCurrently === next.showCurrently && p.h === next.h ? p : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(aside);
    ro.observe(box);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  return (
    /* Wrapper carries the scaled height so the column never reserves unscaled space. */
    <div style={{ height: fit.h ? fit.h * fit.scale : undefined }}>
      <aside
        ref={asideRef}
        aria-label="Widgets"
        style={{ display: "flex", flexDirection: "column", gap: GAP, width: 300, transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined, transformOrigin: "top left" }}
      >
        <ClockCard />
        {/* minmax(0, …): a wide tile (e.g. "4.3 YRS") must not push the row past the 300px column */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: GAP }}>
          <StatusTile />
          <ExperienceTile onOpenApp={onOpenApp} />
        </div>
        <WorkMap onOpenApp={onOpenApp} />
        {fit.showCurrently && (
          <div ref={curRef}>
            <CurrentlyCard onOpenApp={onOpenApp} />
          </div>
        )}
      </aside>
    </div>
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
  /* The wallpaper monogram shares the dock's centre line (the screen's
     centre), and is sized so it never reaches the widget column or the
     icon rail, whichever is closer. */
  const logoBox = useMemo(() => {
    const cx = Math.round(vp.w / 2);
    const room = Math.min(cx - left, vp.w - right - cx) - 24; // half-width available
    const size = Math.round(Math.max(0, Math.min(room * 2 * 0.8, (vp.h - DOCK) * 0.56)));
    return { cx, cy: Math.round((vp.h - DOCK) * 0.48), size };
  }, [left, right, vp.w, vp.h]);
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
      if (soundEffects) uiOpen();
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
    <div className={`ink fixed inset-0 select-none ${motionReduced ? "ink-motion-off" : ""}`} style={{ background: "var(--ink-bg)" }}>
      <InkWallpaper logo={logoBox} dim={visible.length ? 0.6 : 0} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 45% 40%, transparent 55%, var(--ink-veil) 100%)" }} />
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
              <span style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", background: on ? "var(--ink-fg)" : "var(--ink-raised)", border: "1px solid var(--ink-line)", color: on ? "var(--ink-on-fg)" : "var(--ink-fg)", transition: "background .15s" }}>
                <Icon name={app.id} size={25} />
              </span>
              <span className="ink-meta" style={{ color: "var(--ink-fg)", fontSize: 11 }}>{app.name}</span>
            </button>
          );
        })}
        <a href="/Kaustav_Roy_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }} aria-label="Resume (PDF)">
          <span style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", border: "1px solid var(--ink-blue-soft)", color: "var(--ink-blue)" }}>
            <Icon name="resume" size={25} />
          </span>
          <span className="ink-meta ink-blue" style={{ fontSize: 11 }}>Resume</span>
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
      <InkPet roam />
      <InkBrief />
    </div>
  );
}
