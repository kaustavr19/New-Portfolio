"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { desktopIcons } from "@/data/content";
import Window from "./Window";
import Taskbar from "./Taskbar";
import KROSLogo from "./KROSLogo";
import DesktopBg from "./DesktopBg";
import MouseTrail from "./MouseTrail";
import { useA11y } from "@/lib/a11y";
import { useDeviant } from "@/lib/deviant";
import { useExperiments } from "@/lib/experiments";

// Lazy — only downloads when the starfieldWebgl experiment is on.
const StarfieldWebgl = dynamic(() => import("@/components/experiments/StarfieldWebgl"), { ssr: false });
import AboutApp from "@/components/apps/AboutApp";
import SkillsApp from "@/components/apps/SkillsApp";
import ProjectsApp from "@/components/apps/ProjectsApp";
import ExperienceApp from "@/components/apps/ExperienceApp";
import ContactApp from "@/components/apps/ContactApp";
import TerminalApp from "@/components/apps/TerminalApp";
import SettingsApp from "@/components/apps/SettingsApp";

type WindowState = {
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
};

const APP_CONTENT: Record<string, React.ReactNode> = {
  about: <AboutApp />,
  skills: <SkillsApp />,
  projects: <ProjectsApp />,
  experience: <ExperienceApp />,
  contact: <ContactApp />,
  terminal: <TerminalApp />,
  settings: <SettingsApp />,
};

const APP_TITLES: Record<string, string> = {
  about: "About.exe — KR-19 ANDROID PROFILE",
  skills: "Skills.tree — NETRUNNER ATTRIBUTE TREE",
  projects: "Projects/ — ACTIVE MISSIONS",
  experience: "Experience.log — ARTHUR'S JOURNAL",
  contact: "Contact.wav — RADIO CHANNEL",
  terminal: "Terminal — MINECRAFT MODE",
  settings: "Settings.cfg — SYSTEM PREFERENCES",
};

const APP_TITLES_DEVIANT: Record<string, string> = {
  about: "MEMORY_BANK.exe — KR-19 IDENTITY MATRIX",
  skills: "ABILITIES.tree — PROGRAMMING ANALYSIS",
  projects: "MISSIONS/ — ACTIVE OBJECTIVES",
  experience: "CHRONICLE.log — MEMORY ARCHIVE",
  contact: "TRANSMISSION.wav — RELAY CHANNEL OPEN",
  terminal: "DEBUG.exe — DIRECT INTERFACE",
  settings: "PROTOCOLS.cfg — OVERRIDE CONSOLE",
};

const APP_THEMES: Record<string, "detroit" | "cyberpunk" | "gta" | "rdr2" | "tlou" | "minecraft"> = {
  about: "detroit",
  skills: "cyberpunk",
  projects: "gta",
  experience: "rdr2",
  contact: "tlou",
  terminal: "minecraft",
  settings: "detroit",
};

const DEFAULT_SIZES: Record<string, { width: number; height: number }> = {
  about: { width: 720, height: 500 },
  skills: { width: 640, height: 460 },
  projects: { width: 700, height: 480 },
  experience: { width: 720, height: 500 },
  contact: { width: 620, height: 540 },
  terminal: { width: 600, height: 420 },
  settings: { width: 480, height: 380 },
};

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  about:      { x: 140, y: 30 },
  skills:     { x: 420, y: 50 },
  projects:   { x: 280, y: 40 },
  experience: { x: 180, y: 60 },
  contact:    { x: 500, y: 30 },
  terminal:   { x: 320, y: 70 },
  settings:   { x: 360, y: 90 },
};

let zCounter = 10;

export default function Desktop() {
  const { highContrast } = useA11y();
  const { deviant } = useDeviant();
  const { starfieldWebgl, setFlag } = useExperiments();
  const labelFor = (icon: typeof desktopIcons[number]) => (deviant && icon.deviantLabel) ? icon.deviantLabel : icon.label;
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const openWindow = useCallback((id: string) => {
    zCounter += 1;
    setWindows((prev) => ({
      ...prev,
      [id]: { isOpen: true, isMinimized: false, zIndex: zCounter },
    }));
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  }, []);

  const focusWindow = useCallback((id: string) => {
    zCounter += 1;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: zCounter },
    }));
  }, []);

  const handleTaskbarClick = useCallback(
    (id: string) => {
      const w = windows[id];
      if (!w) return;
      if (w.isMinimized) {
        zCounter += 1;
        setWindows((prev) => ({
          ...prev,
          [id]: { ...prev[id], isMinimized: false, zIndex: zCounter },
        }));
      } else {
        minimizeWindow(id);
      }
    },
    [windows, minimizeWindow]
  );

  const themeAccent: Record<string, string> = {
    detroit: "#4fc3f7",
    cyberpunk: "#f5e642",
    gta: "#a4c639",
    rdr2: "#c8a96e",
    tlou: "#7ab648",
    minecraft: "#5aaf26",
  };

  return (
    <div
      className="fixed inset-0 os-grid-bg select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => setContextMenu(null)}
    >
      {/* Pixel animation background */}
      <DesktopBg />

      {/* Experiment: GPU starfield — covers the 2D sky, sits below icons */}
      {starfieldWebgl && <StarfieldWebgl />}

      {/* Centered logo wallpaper */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-5"
        style={{ bottom: 48 }}
      >
        <KROSLogo size={340} opacity={0.55} />
      </div>

      {/* Desktop icons — constrained above taskbar */}
      <div
        className="absolute top-6 left-6 flex flex-col gap-4"
        style={{ paddingTop: 8, paddingBottom: 8 }}
      >
        {desktopIcons.map((icon) => {
          const accent = themeAccent[icon.theme] ?? "#e0e0e8";
          const isOpen = windows[icon.id]?.isOpen && !windows[icon.id]?.isMinimized;
          return (
            <button
              key={icon.id}
              onClick={() => openWindow(icon.id)}
              className="flex flex-col items-center gap-2 w-[88px] group"
              style={{ outline: "none" }}
            >
              <div
                className="flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:brightness-125"
                style={{
                  width: 56, height: 56,
                  background: isOpen ? `${accent}26` : "rgba(10, 16, 32, 0.62)",
                  border: `1px solid ${isOpen ? accent : `${accent}40`}`,
                  fontSize: 26,
                  borderRadius: 8,
                  boxShadow: isOpen
                    ? `0 0 18px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.5)`
                    : `inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.55)`,
                }}
              >
                <i
                  className={`hn hn-${icon.icon}`}
                  style={{
                    fontSize: 26,
                    color: isOpen ? "#ffffff" : "#e8e8f0",
                    filter: `drop-shadow(0 0 5px ${accent}88) drop-shadow(0 1px 1px rgba(0,0,0,0.6))`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: highContrast ? 11 : 10,
                  color: highContrast ? "#ffffff" : (isOpen ? accent : "#d0d0e0"),
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.03em",
                  textAlign: "center",
                  lineHeight: 1.3,
                  // 1px hard black outline (4 directions) + soft accent glow
                  textShadow: isOpen
                    ? `1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 0 10px ${accent}`
                    : `1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 0 0 6px ${accent}66`,
                  wordBreak: "break-all",
                  maxWidth: 84,
                  // High contrast: opaque pill behind label
                  background: highContrast ? "rgba(0, 0, 0, 0.85)" : "transparent",
                  padding: highContrast ? "2px 6px" : 0,
                  borderRadius: highContrast ? 3 : 0,
                  fontWeight: highContrast ? 700 : 400,
                }}
              >
                {labelFor(icon)}
              </span>
            </button>
          );
        })}
      </div>

      {/* KR//OS watermark */}
      <div
        className="absolute bottom-14 right-6"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.04)",
          letterSpacing: "0.3em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {deviant ? "KR//DEVIANT · BARRIER BROKEN" : "KR//OS v2.077"}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 py-1 rounded-sm shadow-2xl"
          style={{
            left: contextMenu.x, top: contextMenu.y,
            background: "rgba(26, 26, 32, 0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Wallpaper switcher */}
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.2em",
              padding: "6px 12px 4px",
            }}
          >
            WALLPAPER
          </div>
          {[
            { id: "classic", label: "Classic Sky", on: !starfieldWebgl },
            { id: "cosmic", label: "Cosmic", on: starfieldWebgl },
          ].map((w) => (
            <button
              key={w.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition-colors"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                color: w.on ? "#4fc3f7" : "rgba(255,255,255,0.6)",
                letterSpacing: "0.05em",
              }}
              onClick={() => { setFlag("starfieldWebgl", w.id === "cosmic"); setContextMenu(null); }}
            >
              <i className={`hn ${w.on ? "hn-check" : "hn-minus"}`} style={{ width: 12 }} />
              <span>{w.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />

          {desktopIcons.map((icon) => (
            <button
              key={icon.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition-colors"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                color: themeAccent[icon.theme],
                letterSpacing: "0.05em",
              }}
              onClick={() => { openWindow(icon.id); setContextMenu(null); }}
            >
              <i className={`hn hn-${icon.icon}`} />
              <span>{deviant ? "Access" : "Open"} {labelFor(icon)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Windows */}
      {desktopIcons.map((icon) => {
        const state = windows[icon.id];
        if (!state?.isOpen) return null;
        return (
          <Window
            key={icon.id}
            id={icon.id}
            title={(deviant && APP_TITLES_DEVIANT[icon.id]) || APP_TITLES[icon.id]}
            theme={APP_THEMES[icon.id]}
            isOpen={state.isOpen}
            isMinimized={state.isMinimized}
            zIndex={state.zIndex}
            defaultPosition={DEFAULT_POSITIONS[icon.id]}
            defaultSize={DEFAULT_SIZES[icon.id]}
            defaultMaximized={icon.id !== "contact"}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={focusWindow}
          >
            {APP_CONTENT[icon.id]}
          </Window>
        );
      })}

      {/* Taskbar */}
      <Taskbar
        openWindows={windows}
        onIconClick={openWindow}
        onTaskbarClick={handleTaskbarClick}
      />

      {/* Pixelated mouse trail — floats above everything */}
      <MouseTrail />
    </div>
  );
}
