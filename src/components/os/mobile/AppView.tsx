"use client";

import { desktopIcons } from "@/data/content";
import { useDeviant } from "@/lib/deviant";
import HomeIndicator from "./HomeIndicator";
import AboutApp from "@/components/apps/AboutApp";
import SkillsApp from "@/components/apps/SkillsApp";
import ProjectsApp from "@/components/apps/ProjectsApp";
import ExperienceApp from "@/components/apps/ExperienceApp";
import ContactApp from "@/components/apps/ContactApp";
import TerminalApp from "@/components/apps/TerminalApp";
import SettingsApp from "@/components/apps/SettingsApp";

const MONO = "'Share Tech Mono', monospace";

/* Per-app theme accent (duplicated from Desktop.tsx + Taskbar.tsx +
   HomeScreen.tsx). All four sites currently maintain this map; the
   cleanup chunk after Phase 1 should extract it. */
const THEME_ACCENT: Record<string, string> = {
  detroit: "#4fc3f7",
  cyberpunk: "#f5e642",
  gta: "#a4c639",
  rdr2: "#c8a96e",
  tlou: "#7ab648",
  minecraft: "#5aaf26",
};

/* Local app registry — separate instances from Desktop.tsx so the two
   shells never collide on shared React state. (Same component class,
   own instance per shell.) */
const APP_CONTENT: Record<string, React.ReactNode> = {
  about: <AboutApp />,
  skills: <SkillsApp />,
  projects: <ProjectsApp />,
  experience: <ExperienceApp />,
  contact: <ContactApp />,
  terminal: <TerminalApp />,
  settings: <SettingsApp />,
};

/* ──────────────────────────────────────────────────────────
   Full-screen app container for mobile.
   ┌────────────────────────────────────────┐
   │ ← │   🤖  About.exe         │  spacer  │  TopBar
   ├────────────────────────────────────────┤
   │                                        │
   │           <app content>                │
   │                                        │
   ├────────────────────────────────────────┤
   │              ━━━━━━━━━                 │  HomeIndicator (tap = back)
   └────────────────────────────────────────┘
   ────────────────────────────────────────────────────────── */

interface Props {
  appId: string;
  onBack: () => void;
}

export default function AppView({ appId, onBack }: Props) {
  const { deviant } = useDeviant();
  const icon = desktopIcons.find((i) => i.id === appId);

  if (!icon) {
    // Unknown app id — fall back to home
    return null;
  }

  const label = deviant && icon.deviantLabel ? icon.deviantLabel : icon.label;
  const accent = THEME_ACCENT[icon.theme] ?? "#e0e0e8";
  const content = APP_CONTENT[appId];

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "transparent" }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          minHeight: 44,
          // env(safe-area-inset-top) pushes the bar below the notch
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "max(4px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(4px, env(safe-area-inset-right, 0px))",
          background: "rgba(8, 12, 22, 0.92)",
          borderBottom: `1px solid ${accent}33`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "#e8e8f0",
          transition: "border-color 0.5s ease",
        }}
      >
        {/* Back button — fixed 44px touch target */}
        <button
          onClick={onBack}
          className="flex items-center justify-center transition-opacity active:opacity-50"
          style={{
            width: 44,
            height: 44,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: accent,
            outline: "none",
          }}
          aria-label="Back to home"
        >
          <i className="hn hn-angle-left" style={{ fontSize: 22 }} />
        </button>

        {/* Centered icon + title */}
        <div
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "0.12em",
            textShadow: "1px 1px 0 #000",
            color: "#e8e8f0",
            minWidth: 0,
          }}
        >
          <i
            className={`hn hn-${icon.icon}`}
            style={{
              fontSize: 14,
              color: accent,
              filter: `drop-shadow(0 0 4px ${accent}88)`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>

        {/* Right spacer — balances the left back button so title stays optically centered */}
        <div style={{ width: 44, flexShrink: 0 }} aria-hidden />
      </div>

      {/* ── App content ── */}
      <div className="flex-1 overflow-hidden" style={{ position: "relative" }}>
        {content}
      </div>

      {/* ── Home indicator — tap to return ── */}
      <HomeIndicator onTap={onBack} />
    </div>
  );
}
