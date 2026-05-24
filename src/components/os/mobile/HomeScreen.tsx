"use client";

import { desktopIcons } from "@/data/content";
import { useDeviant } from "@/lib/deviant";
import { useA11y } from "@/lib/a11y";
import StatusBar from "./StatusBar";
import HomeIndicator from "./HomeIndicator";

const MONO = "'Share Tech Mono', monospace";

/* Per-app theme accent — duplicated from Desktop.tsx + Taskbar.tsx.
   TODO: extract to src/lib/themes.ts in a follow-up cleanup chunk. */
const THEME_ACCENT: Record<string, string> = {
  detroit: "#4fc3f7",
  cyberpunk: "#f5e642",
  gta: "#a4c639",
  rdr2: "#c8a96e",
  tlou: "#7ab648",
  minecraft: "#5aaf26",
};

/* ──────────────────────────────────────────────────────────
   Mobile home screen
   ┌────────────────────────────────────────┐
   │  9:41   KR//OS   ▌▌▌▌ ▰▰░             │  StatusBar
   ├────────────────────────────────────────┤
   │                                        │
   │   🤖   📁   ⚡   📖   ← row 1         │
   │   📻   ⬛   ⚙           ← row 2       │
   │                                        │
   ├────────────────────────────────────────┤
   │  ┌──────────────────────────────────┐  │
   │  │   📄  RESUME.PDF                 │  │  Dock
   │  └──────────────────────────────────┘  │
   │              ━━━━━━━━━                 │  HomeIndicator
   └────────────────────────────────────────┘
   Background is transparent — the wallpaper canvas at the
   parent (MobileOS) level shows through.
   ────────────────────────────────────────────────────────── */

interface Props {
  onOpenApp: (id: string) => void;
}

export default function HomeScreen({ onOpenApp }: Props) {
  const { deviant } = useDeviant();
  const { highContrast } = useA11y();

  const labelFor = (icon: typeof desktopIcons[number]) =>
    (deviant && icon.deviantLabel) ? icon.deviantLabel : icon.label;

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ position: "relative", background: "transparent" }}
    >
      <StatusBar />

      {/* App grid — flex-1, vertically centred */}
      <div className="flex-1 flex flex-col justify-center" style={{ padding: "12px 14px" }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            columnGap: 8,
            rowGap: 22,
            justifyItems: "center",
          }}
        >
          {desktopIcons.map((icon) => {
            const accent = THEME_ACCENT[icon.theme] ?? "#e0e0e8";
            return (
              <MobileAppIcon
                key={icon.id}
                iconClass={icon.icon}
                label={labelFor(icon)}
                accent={accent}
                highContrast={highContrast}
                onOpen={() => onOpenApp(icon.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Dock */}
      <div style={{ padding: "0 16px 6px" }}>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.42)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: 18,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <ResumeButton highContrast={highContrast} />
        </div>
      </div>

      {/* Home indicator — decorative only on home screen */}
      <HomeIndicator />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Subcomponents
   ────────────────────────────────────────────────────────── */

function MobileAppIcon({
  iconClass,
  label,
  accent,
  highContrast,
  onOpen,
}: {
  iconClass: string;
  label: string;
  accent: string;
  highContrast: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Open ${label}`}
      className="flex flex-col items-center group"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        outline: "none",
        padding: "4px 0",
        width: "100%",
        // iOS-y press feedback handled via active:scale-95 below
      }}
    >
      {/* Icon card — same DNA as the desktop pixel-card icons */}
      <div
        className="flex items-center justify-center transition-transform active:scale-95"
        style={{
          width: 60,
          height: 60,
          background: "rgba(10, 16, 32, 0.62)",
          border: `1px solid ${accent}40`,
          borderRadius: 14,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.5)`,
          marginBottom: 7,
        }}
      >
        <i
          className={`hn hn-${iconClass}`}
          style={{
            fontSize: 28,
            color: "#e8e8f0",
            filter: `drop-shadow(0 0 5px ${accent}88) drop-shadow(0 1px 1px rgba(0,0,0,0.6))`,
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: highContrast ? 10 : 9,
          color: highContrast ? "#ffffff" : "#d6d6e2",
          fontFamily: MONO,
          letterSpacing: "0.04em",
          lineHeight: 1.2,
          textAlign: "center",
          // 4-direction black outline so labels survive any wallpaper state
          textShadow: `1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 0 6px ${accent}55`,
          maxWidth: 76,
          wordBreak: "break-word",
          background: highContrast ? "rgba(0, 0, 0, 0.85)" : "transparent",
          padding: highContrast ? "2px 5px" : 0,
          borderRadius: highContrast ? 3 : 0,
          fontWeight: highContrast ? 700 : 400,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function ResumeButton({ highContrast }: { highContrast: boolean }) {
  return (
    <a
      href="/Kaustav_Roy_CV.pdf"
      target="_blank"
      rel="noopener noreferrer"
      download
      className="flex items-center gap-3 transition-transform active:scale-95"
      style={{
        padding: "6px 16px",
        textDecoration: "none",
        color: highContrast ? "#ffffff" : "#e8e8f0",
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: "0.14em",
        fontWeight: highContrast ? 700 : 500,
      }}
      aria-label="Download resume (PDF)"
    >
      <i
        className="hn hn-download"
        style={{
          fontSize: 18,
          color: "#f5e642",
          filter: "drop-shadow(0 0 5px #f5e64288) drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
        }}
      />
      <span>RESUME.PDF</span>
    </a>
  );
}
