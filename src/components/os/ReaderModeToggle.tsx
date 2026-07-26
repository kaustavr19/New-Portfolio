"use client";

import { useReaderMode } from "@/lib/reader-mode";

const MONO = "'Share Tech Mono', monospace";

/* Taskbar toggle for the site-wide plain-text reading view — About,
   Experience and Projects as one scrollable, printable document. Aimed at
   visitors (recruiters, screen-reader users, anyone in a hurry) who want
   the content without the OS chrome. */
export default function ReaderModeToggle() {
  const { open, toggle } = useReaderMode();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-2 py-1 transition-all hover:bg-white/5 flex-shrink-0 group"
      style={{ border: "none", background: "transparent", cursor: "pointer" }}
      title={open ? "Reading mode active — click to close" : "Open reading mode"}
      aria-label="Toggle reading mode"
      aria-pressed={open}
    >
      <span
        className="hidden md:inline"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: open ? "#4fc3f7" : "#a0a0b8",
          letterSpacing: "0.1em",
        }}
      >
        READ
      </span>
      <span
        style={{
          flexShrink: 0,
          width: 32,
          height: 16,
          borderRadius: 10,
          background: open ? "#4fc3f7" : "#1a2030",
          border: `1px solid ${open ? "#4fc3f7" : "#3a4050"}`,
          position: "relative",
          transition: "background 0.15s, border-color 0.15s",
          boxShadow: open ? "0 0 8px rgba(79,195,247,0.4)" : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: open ? 16 : 1,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: open ? "#0a0a14" : "#c8c8d8",
            transition: "left 0.15s, background 0.15s",
          }}
        />
      </span>
    </button>
  );
}
