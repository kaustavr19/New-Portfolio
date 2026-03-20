"use client";

import { useState, useEffect } from "react";
import { desktopIcons } from "@/data/content";

interface TaskbarProps {
  openWindows: Record<string, { isOpen: boolean; isMinimized: boolean }>;
  onIconClick: (id: string) => void;
  onTaskbarClick: (id: string) => void;
}

export default function Taskbar({ openWindows, onIconClick, onTaskbarClick }: TaskbarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [startOpen, setStartOpen] = useState(false);

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
          <span style={{ color: "#4fc3f7", fontWeight: 700, fontSize: 14 }}>KR</span>
          <span style={{ color: "#3a3a4e", fontSize: 14 }}>//</span>
          <span style={{ color: "#f5e642", fontWeight: 700, fontSize: 14 }}>OS</span>
        </button>

        {/* Start menu */}
        {startOpen && (
          <div
            className="absolute bottom-14 left-0 w-52 rounded-sm shadow-2xl py-2 z-50"
            style={{
              background: "rgba(18, 18, 24, 0.99)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-4 py-2 mb-1">
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#6b6b7e", letterSpacing: "0.12em" }}>
                KAUSTAV ROY
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#3a3a4e", letterSpacing: "0.08em" }}>
                KR-19 · Design Consultant
              </div>
            </div>
            <div className="h-px mx-3 mb-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            {desktopIcons.map((icon) => (
              <button
                key={icon.id}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors"
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 12,
                  color: themeAccent[icon.theme] ?? "#e0e0e8",
                  letterSpacing: "0.04em",
                }}
                onClick={() => { onIconClick(icon.id); setStartOpen(false); }}
              >
                <span style={{ fontSize: 16 }}>{icon.icon}</span>
                <span>{icon.label}</span>
              </button>
            ))}
            <div className="h-px mx-3 mt-1 mb-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="px-4 py-1.5" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#3a3a4e" }}>
              v2.077 · Design × AI
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
                <span style={{ fontSize: 14 }}>{icon.icon}</span>
                <span className="hidden md:inline">{icon.label}</span>
              </button>
            );
          })}
      </div>

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
