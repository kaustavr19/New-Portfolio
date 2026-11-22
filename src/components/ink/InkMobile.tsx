"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { desktopIcons, profile } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { parseHash, setAppHash } from "@/lib/deep-link";
import InkBrief from "./InkBrief";
import { INK_APPS, CITY, CURRENT, cityDate, cityTime } from "./data";
import { useClock } from "./useClock";
import { Icon, SegBar } from "./ui";
import KrosMark from "./KrosMark";
import InkWallpaper from "./InkWallpaper";
import { ExperienceTile, WorkMap } from "./widgets";
import { useWeather } from "./useWeather";
import WeatherGlyph from "./WeatherGlyph";
import { INK_APP_COMPONENTS } from "./apps";
import AskBar from "./AskBar";

/* InkOS phone shell: lock → home → app. Shares the kros_booted session
   key with the classic shell, and keeps deep links across the unlock. */

type View = "lock" | "home" | "app";
const BOOT_KEY = "kros_booted";
const isApp = (id?: string) => !!id && desktopIcons.some((ic) => ic.id === id);

function StatusBar() {
  const now = useClock();
  const t = now ? cityTime(now) : null;
  return (
    <div aria-hidden style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "calc(env(safe-area-inset-top, 0px) + 14px) 24px 6px", flexShrink: 0 }}>
      <span className="ink-dot" style={{ fontSize: 16 }}>{t ? `${t.h}:${t.m}` : ""}</span>
      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
          {[5, 8, 11, 11].map((h, i) => <i key={i} style={{ width: 3, height: h, borderRadius: 1, background: i === 3 ? "var(--ink-dim)" : "var(--ink-fg)" }} />)}
        </span>
        <span style={{ display: "flex", gap: 2, padding: 2, border: "1px solid var(--ink-mute)", borderRadius: 4 }}>
          {[1, 1, 1, 1, 0].map((f, i) => <i key={i} style={{ width: 3, height: 8, borderRadius: 1, background: f ? "var(--ink-fg)" : "transparent" }} />)}
        </span>
      </span>
    </div>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const now = useClock();
  const w = useWeather();
  const cur = CURRENT.project;
  const t = now ? cityTime(now) : null;
  const { motionReduced } = useA11y();
  const startY = useRef<number | null>(null);

  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 24px calc(env(safe-area-inset-bottom, 0px) + 28px)", position: "relative" }}
      onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (startY.current !== null && startY.current - e.changedTouches[0].clientY > 60) onUnlock();
        startY.current = null;
      }}
    >
      <h1 className="sr-only">KR//OS — {profile.name}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <KrosMark size={18} />
        <span className="ink-dot-900" style={{ fontSize: 16 }}>KR//OS</span>
      </div>
      <div className="ink-dot-900" style={{ fontSize: "min(38vw, 160px)", lineHeight: 0.82, letterSpacing: "-.02em" }} aria-label={t ? `${CITY} time ${t.h}:${t.m}` : undefined}>
        {t ? t.h : "--"}
        <br />
        {t ? t.m : "--"}
        <span className={`ink-red ${motionReduced ? "" : "ink-blinker"}`}>.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
        <span className="ink-label" style={{ fontSize: 12 }}>{now ? cityDate(now) : ""} · {CITY}</span>
        {w && (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <WeatherGlyph kind={w.kind} isDay={w.isDay} size={14} />
            <span className="ink-label" style={{ fontSize: 12, color: "var(--ink-fg)" }}>{w.temp}°</span>
          </span>
        )}
      </div>

      {cur && (
        <button
          type="button"
          onClick={() => {
            window.history.replaceState(null, "", `#projects/${cur.id}`);
            onUnlock();
          }}
          className="ink-card"
          style={{ marginTop: "auto", display: "flex", gap: 12, textAlign: "left", background: "var(--ink-dock)" }}
        >
          <span aria-hidden style={{ width: 3, borderRadius: 3, background: "var(--ink-red)", boxShadow: "0 0 10px var(--ink-red)" }} />
          <span style={{ flex: 1 }}>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="ink-label ink-live">Currently</span>
              <span className="ink-meta">{cur.completion}%</span>
            </span>
            <span style={{ display: "block", fontSize: 14, margin: "6px 0 10px", lineHeight: 1.45 }}>
              Designing <b style={{ fontWeight: 600 }}>{cur.name}</b> at {CURRENT.company.charAt(0) + CURRENT.company.slice(1).toLowerCase()}
            </span>
            <SegBar value={cur.completion} live segments={30} label="Mission progress" />
          </span>
        </button>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
        <a href="/Kaustav_Roy_CV.pdf" target="_blank" rel="noopener noreferrer" aria-label="Resume (PDF)" style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--ink-raised)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center" }}>
          <Icon name="resume" size={22} />
        </a>
        <button type="button" onClick={onUnlock} className="ink-label" style={{ padding: 14 }}>
          Tap or swipe up to unlock
        </button>
        <a href={`mailto:${profile.social.email}`} aria-label="Email Kaustav" style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--ink-raised)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center" }}>
          <Icon name="mail" size={22} />
        </a>
      </div>
    </div>
  );
}

function HomeScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const openAt = (id: string, sub?: string) => {
    if (sub) window.history.replaceState(null, "", `#${id}/${sub}`);
    onOpen(id);
  };
  return (
    <div className="ink-scroll" style={{ flex: 1, padding: "10px 18px calc(env(safe-area-inset-bottom, 0px) + 26px)", display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 className="sr-only">KR//OS home</h1>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, alignItems: "start" }}>
        <button type="button" onClick={() => onOpen("about")} className="ink-card" style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "flex-end", textAlign: "left", borderRadius: 26 }}>
          <span>
            <span className="ink-label">{profile.name}</span>
            <span style={{ display: "block", fontSize: 15, marginTop: 8, lineHeight: 1.4 }}>
              {profile.designation}
              <br />
              <span style={{ color: "var(--ink-mute)" }}>AI · Enterprise UX</span>
            </span>
          </span>
          <span style={{ color: "var(--ink-fg)" }}><KrosMark size={52} /></span>
        </button>
        <div style={{ minWidth: 0 }}>
          <WorkMap onOpenApp={openAt} compact />
        </div>
        <ExperienceTile onOpenApp={openAt} round />
      </div>

      <nav aria-label="Apps" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px 0", marginTop: 4 }}>
        {INK_APPS.map((a) => (
          <button key={a.id} type="button" onClick={() => onOpen(a.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
            <span style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--ink-raised)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center", position: "relative" }}>
              <Icon name={a.id} size={24} />
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{a.name}</span>
          </button>
        ))}
        <a href="/Kaustav_Roy_CV.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, textDecoration: "none" }}>
          <span style={{ width: 58, height: 58, borderRadius: "50%", border: "1px solid var(--ink-blue-soft)", display: "grid", placeItems: "center", color: "var(--ink-blue)" }}>
            <Icon name="resume" size={24} />
          </span>
          <span className="ink-blue" style={{ fontSize: 11 }}>Resume</span>
        </a>
      </nav>

      <AskBar variant="mobile" />
    </div>
  );
}

export default function InkMobile() {
  const [view, setView] = useState<View>("lock");
  const [app, setApp] = useState<string | null>(null);
  const { motionReduced } = useA11y();
  const target = useRef(parseHash());

  const open = useCallback((id: string) => {
    setApp(id);
    setView("app");
    setAppHash(id);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_KEY) === "1") {
        if (isApp(target.current?.app)) open(target.current!.app);
        else setView("home");
      }
    } catch {
      // keep lock
    }
  }, [open]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (isApp(id)) open(id);
    };
    window.addEventListener("kros:open-app", onOpen);
    return () => window.removeEventListener("kros:open-app", onOpen);
  }, [open]);

  const unlock = () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // ignore
    }
    const t = parseHash() ?? target.current;
    if (isApp(t?.app)) open(t!.app);
    else setView("home");
  };

  const meta = INK_APPS.find((a) => a.id === app);
  const Comp = app ? INK_APP_COMPONENTS[app] : null;

  return (
    <div className={`ink fixed inset-0 flex flex-col ${motionReduced ? "ink-motion-off" : ""}`} style={{ background: "var(--ink-bg)" }}>
      {view !== "app" && <InkWallpaper dim={view === "home" ? 0.5 : 0} />}
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <StatusBar />
        {view === "lock" && <LockScreen onUnlock={unlock} />}
        {view === "home" && <HomeScreen onOpen={open} />}
        {view === "app" && meta && Comp && (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", animation: motionReduced ? undefined : "ink-in .18s ease-out" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px 12px", borderBottom: "1px solid var(--ink-line)" }}>
              <button
                type="button"
                aria-label="Back to home"
                onClick={() => {
                  setView("home");
                  setAppHash("");
                }}
                style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--ink-line-strong)", display: "grid", placeItems: "center" }}
              >
                <Icon name="back" size={16} />
              </button>
              <h2 className="ink-dot-900" style={{ fontSize: 24, textTransform: "uppercase" }}>{meta.name}</h2>
              <span className="ink-label" aria-hidden>{meta.index}</span>
            </header>
            <main style={{ flex: 1, minHeight: 0 }}>
              <Comp />
            </main>
          </div>
        )}
      </div>
      {view !== "lock" && <InkBrief />}
    </div>
  );
}
