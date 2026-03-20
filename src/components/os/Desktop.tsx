"use client";

import { useState, useCallback } from "react";
import { desktopIcons } from "@/data/content";
import Window from "./Window";
import Taskbar from "./Taskbar";
import KROSLogo from "./KROSLogo";
import AboutApp from "@/components/apps/AboutApp";
import SkillsApp from "@/components/apps/SkillsApp";
import ProjectsApp from "@/components/apps/ProjectsApp";
import ExperienceApp from "@/components/apps/ExperienceApp";
import ContactApp from "@/components/apps/ContactApp";
import TerminalApp from "@/components/apps/TerminalApp";

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
};

const APP_TITLES: Record<string, string> = {
  about: "About.exe — KR-19 ANDROID PROFILE",
  skills: "Skills.tree — NETRUNNER ATTRIBUTE TREE",
  projects: "Projects/ — ACTIVE MISSIONS",
  experience: "Experience.log — ARTHUR'S JOURNAL",
  contact: "Contact.wav — RADIO CHANNEL",
  terminal: "Terminal — MINECRAFT MODE",
};

const APP_THEMES: Record<string, "detroit" | "cyberpunk" | "gta" | "rdr2" | "tlou" | "minecraft"> = {
  about: "detroit",
  skills: "cyberpunk",
  projects: "gta",
  experience: "rdr2",
  contact: "tlou",
  terminal: "minecraft",
};

const DEFAULT_SIZES: Record<string, { width: number; height: number }> = {
  about: { width: 720, height: 500 },
  skills: { width: 640, height: 460 },
  projects: { width: 700, height: 480 },
  experience: { width: 720, height: 500 },
  contact: { width: 540, height: 520 },
  terminal: { width: 600, height: 420 },
};

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  about:      { x: 140, y: 30 },
  skills:     { x: 420, y: 50 },
  projects:   { x: 280, y: 40 },
  experience: { x: 180, y: 60 },
  contact:    { x: 500, y: 30 },
  terminal:   { x: 320, y: 70 },
};

let zCounter = 10;

export default function Desktop() {
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
      {/* Centered logo wallpaper */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-5"
        style={{ bottom: 48 }}
      >
        <KROSLogo size={300} opacity={0.055} />
        <div
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.045)",
            letterSpacing: "0.5em",
            userSelect: "none",
            textTransform: "uppercase",
          }}
        >
          Double-click an icon to open
        </div>
      </div>

      {/* Desktop icons — constrained above taskbar */}
      <div
        className="absolute top-6 left-6 flex flex-col gap-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 72px)", paddingBottom: 8 }}
      >
        {desktopIcons.map((icon) => {
          const accent = themeAccent[icon.theme] ?? "#e0e0e8";
          const isOpen = windows[icon.id]?.isOpen && !windows[icon.id]?.isMinimized;
          return (
            <button
              key={icon.id}
              onDoubleClick={() => openWindow(icon.id)}
              className="flex flex-col items-center gap-2 w-[88px] group"
              style={{ outline: "none" }}
            >
              <div
                className="flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:brightness-125"
                style={{
                  width: 56, height: 56,
                  background: isOpen ? `${accent}1a` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isOpen ? accent : "rgba(255,255,255,0.1)"}`,
                  fontSize: 26,
                  borderRadius: 8,
                  boxShadow: isOpen ? `0 0 16px ${accent}44, 0 4px 12px rgba(0,0,0,0.4)` : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {icon.icon}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: isOpen ? accent : "#a0a0b8",
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.03em",
                  textAlign: "center",
                  lineHeight: 1.3,
                  textShadow: isOpen ? `0 0 10px ${accent}` : "none",
                  wordBreak: "break-all",
                  maxWidth: 84,
                }}
              >
                {icon.label}
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
        KR//OS v2.077
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
              <span>{icon.icon}</span>
              <span>Open {icon.label}</span>
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
            title={APP_TITLES[icon.id]}
            theme={APP_THEMES[icon.id]}
            isOpen={state.isOpen}
            isMinimized={state.isMinimized}
            zIndex={state.zIndex}
            defaultPosition={DEFAULT_POSITIONS[icon.id]}
            defaultSize={DEFAULT_SIZES[icon.id]}
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
    </div>
  );
}
