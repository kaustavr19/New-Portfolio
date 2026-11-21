"use client";

import { chapters, CAREER_START, profile, projects, yearsSince, type Project } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { CITY, CURRENT, cityDate, cityTime } from "./data";
import { useClock } from "./useClock";
import { useWeather } from "./useWeather";
import { SegBar } from "./ui";
import WeatherGlyph from "./WeatherGlyph";

export type OpenApp = (id: string, sub?: string) => void;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* City, date, a centred dot-matrix clock, and Kolkata's weather underneath. */
export function ClockCard() {
  const now = useClock();
  const t = now ? cityTime(now) : null;
  const w = useWeather();
  const { motionReduced } = useA11y();
  return (
    <div className="ink-card" style={{ padding: "18px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="ink-label">{CITY}</span>
        <span className="ink-label">{now ? cityDate(now) : ""}</span>
      </div>
      <div className="ink-dot-900" style={{ fontSize: 58, lineHeight: 0.9, textAlign: "center", padding: "10px 0 6px" }} aria-label={t ? `${CITY} time ${t.h}:${t.m}` : undefined}>
        {t ? t.h : "--"}
        <span className={`ink-red ${motionReduced ? "" : "ink-blinker"}`}>:</span>
        {t ? t.m : "--"}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderTop: "1px solid var(--ink-line)", paddingTop: 12, minHeight: 36 }}>
        {w ? (
          <>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <WeatherGlyph kind={w.kind} isDay={w.isDay} size={22} />
              <span className="ink-dot" style={{ fontSize: 22 }}>{w.temp}°</span>
              <span className="ink-label" style={{ color: "var(--ink-fg)" }}>{w.label}</span>
            </span>
            <span className="ink-meta">H{w.high} · L{w.low}</span>
          </>
        ) : (
          <span className="ink-meta">Weather unavailable</span>
        )}
      </div>
    </div>
  );
}

export function StatusTile() {
  return (
    <div className="ink-card">
      <span className="ink-label">Status</span>
      <div className="ink-dot-900" style={{ fontSize: 24, marginTop: 14 }}>{profile.status}</div>
      <div className="ink-meta" style={{ marginTop: 6 }}>{profile.unit} · online</div>
    </div>
  );
}

/* Years of experience, computed from CAREER_START (internship included). */
export function ExperienceTile({ onOpenApp, round = false }: { onOpenApp: OpenApp; round?: boolean }) {
  const yrs = yearsSince(CAREER_START);
  return (
    <button
      type="button"
      className="ink-card"
      onClick={() => onOpenApp("experience")}
      aria-label={`${yrs} years of experience — open Experience`}
      style={round ? { aspectRatio: "1", borderRadius: "50%", display: "grid", placeItems: "center", textAlign: "center" } : { textAlign: "left" }}
    >
      <span>
        {!round && <span className="ink-label" style={{ display: "block" }}>Experience</span>}
        <span className="ink-dot-900" style={{ display: "block", fontSize: round ? 38 : 36, lineHeight: 1, marginTop: round ? 0 : 10, whiteSpace: "nowrap" }}>
          {yrs}
          <span style={{ fontSize: 14 }}> YRS</span>
        </span>
        <span className="ink-meta" style={{ display: "block", marginTop: 6 }}>
          {round ? "experience" : `since ${MONTHS[CAREER_START.month - 1]} ${CAREER_START.year} · ${chapters.length} companies`}
        </span>
      </span>
    </button>
  );
}

const TYPES: { type: Project["type"]; label: string }[] = [
  { type: "main", label: "Main" },
  { type: "consulting", label: "Contract" },
  { type: "side", label: "Side" },
];

/* Every project as one dot: filled = main mission, ring = contract,
   small = side project, blinking red = in progress. */
export function WorkMap({ onOpenApp, compact = false }: { onOpenApp: OpenApp; compact?: boolean }) {
  const ordered = TYPES.flatMap((t) => projects.filter((p) => p.type === t.type));
  const size = compact ? 18 : 22;
  return (
    <div className="ink-card" style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 14, padding: compact ? "14px 14px" : undefined, borderRadius: compact ? 26 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="ink-label">Work map</span>
        <button type="button" className="ink-meta ink-blue" onClick={() => onOpenApp("projects")}>all →</button>
      </div>
      <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size + 8}px, 1fr))`, gap: 6 }} aria-label="Projects">
        {ordered.map((p) => {
          const live = p.status === "IN PROGRESS";
          const d = p.type === "side" ? size * 0.42 : size * 0.72;
          return (
            <li key={p.id} style={{ display: "grid", placeItems: "center", height: size + 8 }}>
              <button
                type="button"
                title={`${p.name} — ${p.status}`}
                aria-label={`${p.name}, ${TYPES.find((t) => t.type === p.type)!.label.toLowerCase()} project, ${p.status.toLowerCase()}`}
                onClick={() => onOpenApp("projects", p.id)}
                className={live ? "ink-workdot live" : "ink-workdot"}
                style={{
                  width: d,
                  height: d,
                  borderRadius: "50%",
                  background: live ? "var(--ink-red)" : p.type === "consulting" ? "transparent" : "var(--ink-fg)",
                  border: p.type === "consulting" && !live ? "2px solid var(--ink-fg)" : 0,
                  opacity: p.type === "side" && !live ? 0.75 : 1,
                }}
              />
            </li>
          );
        })}
      </ul>
      <div style={{ display: "flex", justifyContent: "space-between", gap: compact ? "2px 8px" : 8, flexWrap: "wrap" }}>
        {TYPES.map((t) => (
          <span key={t.type} className="ink-meta" style={{ whiteSpace: "nowrap", fontSize: compact ? 10 : undefined }}>
            <b className="ink-dot" style={{ fontSize: 15, color: "var(--ink-fg)" }}>{projects.filter((p) => p.type === t.type).length}</b> {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* The in-progress mission with its segmented progress bar. */
export function CurrentlyCard({ onOpenApp }: { onOpenApp: OpenApp }) {
  if (!CURRENT.project) return null;
  const p = CURRENT.project;
  return (
    <button type="button" className="ink-card" style={{ textAlign: "left", width: "100%" }} onClick={() => onOpenApp("projects", p.id)}>
      <span className="ink-label ink-live">Currently</span>
      <span style={{ display: "block", fontSize: 15, marginTop: 10, lineHeight: 1.5 }}>
        {p.name} at <b style={{ fontWeight: 600 }}>{CURRENT.company.charAt(0) + CURRENT.company.slice(1).toLowerCase()}</b>
      </span>
      <span style={{ display: "block", marginTop: 14 }}>
        <SegBar value={p.completion} live label="Mission progress" />
      </span>
      <span style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span className="ink-meta">mission progress</span>
        <span className="ink-meta">{p.completion}%</span>
      </span>
    </button>
  );
}
