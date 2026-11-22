/* InkOS primitives — hook-free, so they render in the OS and on the
   server-rendered /work and /about pages alike. Styling lives in ink.css. */
import type { ReactNode } from "react";

export function Label({ children, live, className = "" }: { children: ReactNode; live?: boolean; className?: string }) {
  return <span className={`ink-label ${live ? "ink-live" : ""} ${className}`}>{children}</span>;
}

/* A project / page title in Doto, kept legible: dot-matrix type falls apart
   past ~20 characters, so a " — subtitle" moves to Inter underneath, and a
   long main title steps one size down the Doto scale. `tier` = where it sits. */
const DOT_TITLE = {
  page: { short: "clamp(var(--dot-l), 8vw, var(--dot-xl))", long: "clamp(var(--dot-m), 6vw, var(--dot-l))", sub: 22 },
  window: { short: "clamp(var(--dot-m), 6cqi, var(--dot-l))", long: "var(--dot-m)", sub: 18 },
  card: { short: "var(--dot-m)", long: "var(--dot-s)", sub: 16 },
} as const;

export function DotTitle({ text, as: Tag = "h3", tier }: { text: string; as?: "h1" | "h2" | "h3" | "h4" | "span"; tier: keyof typeof DOT_TITLE }) {
  const [main, ...rest] = text.split(/\s[—–]\s/);
  const sub = rest.join(" — ");
  const t = DOT_TITLE[tier];
  return (
    <Tag style={{ display: "block", margin: 0 }}>
      <span className="ink-dot-900" style={{ display: "block", fontSize: main.length > 22 ? t.long : t.short, lineHeight: 0.98, textTransform: "uppercase", overflowWrap: "anywhere", textWrap: "balance" }}>
        {main}
      </span>
      {sub && <span style={{ display: "block", fontSize: t.sub, fontWeight: 600, marginTop: 6, color: "var(--ink-soft)" }}>— {sub}</span>}
    </Tag>
  );
}

/* Section heading: optional dot-matrix index, mono label, hairline to the edge. */
export function SectionHead({ n, children, as: Tag = "h3" }: { n?: string | number; children: ReactNode; as?: "h2" | "h3" | "h4" }) {
  return (
    <Tag className="ink-h">
      {n !== undefined && <span className="ink-h-n">{typeof n === "number" ? String(n).padStart(2, "0") : n}</span>}
      <span className="ink-label">{children}</span>
    </Tag>
  );
}

/* Segmented bar. value 0–100. The leading segment is blue (progress edge),
   or a blinking red when `live` (in progress). */
export function SegBar({
  value,
  segments = 25,
  live = false,
  height = 8,
  label,
}: {
  value: number;
  segments?: number;
  live?: boolean;
  height?: number;
  label?: string;
}) {
  const n = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);
  const full = value >= 100;
  return (
    <div
      className="ink-bar"
      style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      {Array.from({ length: segments }, (_, i) => {
        const cls = i < n - 1 || (full && i < n) ? "f" : i === n - 1 ? `tip${live ? " live" : ""}` : "";
        return <i key={i} className={cls} style={{ height }} />;
      })}
    </div>
  );
}

/* Big dot-matrix figure with a mono caption — key numbers, intel tiles. */
/* Sizes are steps of the Doto scale (ink.css · --dot-*), never raw pixels. */
export function StatTile({ value, label, size = "m" }: { value: string; label: string; size?: "m" | "l" }) {
  return (
    <div className="ink-tile">
      <b className="ink-dot-900" style={{ display: "block", fontSize: `var(--dot-${size})`, lineHeight: 1 }}>{value}</b>
      <span className="ink-label" style={{ display: "block", marginTop: 6, fontSize: 11, letterSpacing: ".06em", lineHeight: 1.4 }}>
        {label}
      </span>
    </div>
  );
}

/* Round pill switch with a label; the switch itself is aria-hidden, the button carries role=switch. */
export function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%", padding: "12px 0", textAlign: "left" }}
    >
      <span>
        <span style={{ display: "block", fontSize: 14, color: "var(--ink-fg)" }}>{label}</span>
        {hint && <span className="ink-meta" style={{ display: "block", marginTop: 2 }}>{hint}</span>}
      </span>
      <span className="ink-switch" aria-hidden />
    </button>
  );
}

/* Monochrome line icons, one stroke weight. */
const ICON_PATHS: Record<string, ReactNode> = {
  about: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  projects: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  skills: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  experience: (<><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h6M9 14h6M9 18h4" /></>),
  contact: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  terminal: <path d="m5 8 4 4-4 4M12 17h7" />,
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>),
  resume: (<><path d="M7 3h7l4 4v14H7z" /><path d="M10 12h5M10 16h5" /></>),
  mail: (<><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></>),
  search: (<><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  back: <path d="M15 5l-7 7 7 7" />,
};

export function Icon({ name, size = 24, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICON_PATHS[name] ?? ICON_PATHS.about}
    </svg>
  );
}
