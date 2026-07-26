"use client";

import { useState, useEffect } from "react";
import { desktopIcons } from "@/data/content";
import ControlCenter from "./ControlCenter";
import KRMark from "./KRMark";
import SystemStatus from "./SystemStatus";
import { useDeviant } from "@/lib/deviant";
import {
  audienceProfiles,
  useAudience,
} from "@/lib/audience";
import { requestPersonnelBrief } from "@/lib/personnel-brief";

interface TaskbarProps {
  openWindows: Record<string, { isOpen: boolean; isMinimized: boolean }>;
  onIconClick: (id: string) => void;
  onTaskbarClick: (id: string) => void;
  recentAppId?: string | null;
  onOpenCommandCenter: () => void;
  onMinimizeAll: () => void;
  onCloseAll: () => void;
}

// Must match BOOT_KEY in app/page.tsx — clearing it makes the boot screen play again on reload.
const BOOT_SESSION_KEY = "kros_booted";

function reboot() {
  try {
    localStorage.removeItem(BOOT_SESSION_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
}

export default function Taskbar({
  openWindows,
  onIconClick,
  onTaskbarClick,
  recentAppId,
  onOpenCommandCenter,
  onMinimizeAll,
  onCloseAll,
}: TaskbarProps) {
  const { deviant } = useDeviant();
  const labelFor = (icon: typeof desktopIcons[number]) => (deviant && icon.deviantLabel) ? icon.deviantLabel : icon.label;
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const audience = useAudience();
  const recentIcon = desktopIcons.find((ic) => ic.id === recentAppId);
  const activeAudience = audienceProfiles.find((item) => item.id === audience);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const themeAccent: Record<string, string> = {
    detroit: "#4fc3f7",
    cyberpunk: "#f5e642",
    gta: "#a4c639",
    rdr2: "#c8a96e",
    tlou: "#7ab648",
    minecraft: "#5aaf26",
    settings: "#b388ff",
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-between z-40 select-none"
      style={{
        height: 48,
        padding: "0 16px",
        background: "rgba(14, 14, 18, 0.97)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* KR//OS Start button */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setStartOpen((s) => !s)}
          className="flex items-center gap-1 px-3 py-1.5 transition-colors hover:bg-white/5 rounded-sm"
          style={{ fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.12em" }}
        >
          <KRMark height={16} color={deviant ? "#ff3c8c" : "#4fc3f7"} />
          <span style={{ color: "#3a3a4e", fontSize: 14 }}>{"//"}</span>
          <span style={{ color: "#f5e642", fontWeight: 700, fontSize: 14 }}>{deviant ? "DEVIANT" : "OS"}</span>
        </button>

        {/* Start menu */}
        {startOpen && (
          <div
            className="absolute bottom-14 left-0 w-80 rounded-sm shadow-2xl z-50 flex flex-col gap-5"
            style={{
              background: "#141419",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "20px",
              maxHeight: "calc(100vh - 72px)",
              overflowY: "auto",
            }}
          >
            {/* User */}
            <div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#c8c8d8", letterSpacing: "0.12em" }}>
                KAUSTAV ROY
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#83839a", letterSpacing: "0.08em", marginTop: 3 }}>
                {deviant ? "KR-19 · DEVIANT" : "KR-19 · Design Consultant"}
              </div>
            </div>

            <div
              className="flex items-center justify-between gap-3"
              style={{
                padding: "10px 11px",
                border: `1px solid ${activeAudience?.accent ?? "#4fc3f7"}33`,
                background: `${activeAudience?.accent ?? "#4fc3f7"}08`,
              }}
            >
              <div className="min-w-0">
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#738594", letterSpacing: "0.16em" }}>
                  VISITOR ROUTE
                </div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: activeAudience?.accent ?? "#aab8c2", letterSpacing: "0.09em", marginTop: 3 }}>
                  {activeAudience?.shortLabel ?? "NOT SET"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  requestPersonnelBrief();
                  setStartOpen(false);
                }}
                className="transition-colors hover:bg-white/5"
                style={{
                  padding: "5px 7px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#a8b8c4",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 8,
                  letterSpacing: "0.08em",
                }}
              >
                {activeAudience ? "CHANGE" : "CHOOSE"}
              </button>
            </div>

            {/* Recently opened */}
            {recentIcon && (
              <>
                <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em", marginBottom: 10 }}>
                    RECENTLY OPENED
                  </div>
                  <button
                    className="w-full flex items-center gap-3 py-2 px-2 -mx-2 text-left hover:bg-white/5 transition-colors rounded-sm"
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 12,
                      color: themeAccent[recentIcon.theme] ?? "#e0e0e8",
                      letterSpacing: "0.04em",
                    }}
                    onClick={() => { onIconClick(recentIcon.id); setStartOpen(false); }}
                  >
                    <i className={`hn hn-${recentIcon.icon}`} style={{ fontSize: 16 }} />
                    <span>{labelFor(recentIcon)}</span>
                  </button>
                </div>
              </>
            )}

            <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

            {/* Pinned apps grid */}
            <div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em", marginBottom: 10 }}>
                PINNED
              </div>
              <div className="grid grid-cols-3 gap-3">
                {desktopIcons.map((icon) => {
                  const accent = themeAccent[icon.theme] ?? "#e0e0e8";
                  return (
                    <button
                      key={icon.id}
                      className="flex flex-col items-center gap-2 py-3 transition-colors hover:bg-white/5 rounded-sm"
                      onClick={() => { onIconClick(icon.id); setStartOpen(false); }}
                    >
                      <i className={`hn hn-${icon.icon}`} style={{ fontSize: 20, color: accent }} />
                      <span
                        style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 10,
                          color: "#dcdce4",
                          letterSpacing: "0.02em",
                          textAlign: "center",
                          lineHeight: 1.3,
                        }}
                      >
                        {labelFor(icon)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

            <div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em", marginBottom: 10 }}>
                SYSTEM
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "COMMAND", icon: "search", action: onOpenCommandCenter },
                  { label: "DESKTOP", icon: "minus", action: onMinimizeAll },
                  { label: "CLEAR", icon: "times", action: onCloseAll },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.action();
                      setStartOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 py-2 transition-colors hover:bg-white/5"
                    style={{
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#8ea1af",
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 8,
                      letterSpacing: "0.06em",
                    }}
                  >
                    <i className={`hn hn-${item.icon}`} aria-hidden style={{ color: "#4fc3f7", fontSize: 13 }} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

            {/* Footer — version + reboot */}
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#6a6a7e" }}>
                {deviant ? "BARRIER BROKEN · rA9" : "v2.077 · Design × AI"}
              </span>
              <button
                onClick={reboot}
                className="flex items-center gap-1.5 px-2 py-1 -mr-2 transition-colors hover:bg-white/5 rounded-sm"
                style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#a0a0b8", letterSpacing: "0.08em" }}
                title="Reboot — replay the boot sequence"
              >
                <span style={{ fontSize: 12, color: "#f5e642" }}>⏻</span>
                REBOOT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 mx-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Open window pills */}
      <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
        {desktopIcons
          .filter((icon) => openWindows[icon.id]?.isOpen)
          .map((icon) => {
            const isMinimized = openWindows[icon.id]?.isMinimized;
            const accent = themeAccent[icon.theme] ?? "#e0e0e8";
            return (
              <button
                key={icon.id}
                onClick={() => onTaskbarClick(icon.id)}
                className="flex items-center gap-2 px-3 py-1 transition-all hover:bg-white/5 flex-shrink-0"
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 11,
                  color: isMinimized ? "#4a4a5a" : accent,
                  borderBottom: `2px solid ${isMinimized ? "transparent" : accent}`,
                  borderRadius: "2px 2px 0 0",
                  letterSpacing: "0.04em",
                  opacity: isMinimized ? 0.6 : 1,
                }}
              >
                <i className={`hn hn-${icon.icon}`} style={{ fontSize: 14 }} />
                <span className="hidden md:inline">{labelFor(icon)}</span>
              </button>
            );
          })}
      </div>

      <ControlCenter />

      {/* Ambient system telemetry lives in the taskbar. */}
      <SystemStatus />

      <div className="w-px h-5 flex-shrink-0 hidden md:block" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Clock */}
      <div
        className="flex flex-col items-end text-right flex-shrink-0 ml-3"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        <span style={{ fontSize: 13, color: "#e0e0e8" }}>{time}</span>
        <span style={{ fontSize: 10, color: "#4a4a5a" }}>{date}</span>
      </div>
    </div>
  );
}
