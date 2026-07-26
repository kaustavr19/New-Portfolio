"use client";

import { useEffect, useRef, useState } from "react";
import AccessibilityMenu from "./AccessibilityMenu";
import DeviantToggle from "./DeviantToggle";
import ReaderModeToggle from "./ReaderModeToggle";
import SoundToggle from "./SoundToggle";

const MONO = "'Share Tech Mono', monospace";

export default function ControlCenter() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 px-3 py-1 transition-all hover:bg-white/5"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: open ? "#4fc3f7" : "#a0a0b8",
          letterSpacing: "0.1em",
          border: `1px solid ${open ? "rgba(79,195,247,0.38)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 2,
        }}
        title="Open system controls"
        aria-label="Open system controls"
        aria-expanded={open}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#7ab648",
            boxShadow: "0 0 7px rgba(122,182,72,0.6)",
          }}
        />
        <span>CONTROL</span>
        <span style={{ color: "#4a4a5a", fontSize: 9 }}>{open ? "▼" : "▲"}</span>
      </button>

      {open && (
        <div
          className="absolute right-0"
          style={{
            bottom: "100%",
            marginBottom: 10,
            width: 330,
            padding: 16,
            background: "rgba(10,16,32,0.98)",
            border: "1px solid rgba(79,195,247,0.24)",
            borderRadius: 4,
            boxShadow: "0 16px 48px rgba(0,0,0,0.68)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            zIndex: 100,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              paddingBottom: 10,
              marginBottom: 12,
              borderBottom: "1px solid rgba(79,195,247,0.13)",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#70cfff", letterSpacing: "0.25em" }}>
              SYSTEM CONTROL
            </span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: "#4a5b68", letterSpacing: "0.14em" }}>
              KR//OS
            </span>
          </div>

          <ControlSection title="VIEW & SOUND">
            <SoundToggle />
            <ReaderModeToggle />
          </ControlSection>

          <ControlSection title="SYSTEM" last>
            <DeviantToggle />
            <AccessibilityMenu anchor="right" />
          </ControlSection>
        </div>
      )}
    </div>
  );
}

function ControlSection({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      style={{
        paddingBottom: last ? 0 : 12,
        marginBottom: last ? 0 : 12,
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 8,
          color: "#596a76",
          letterSpacing: "0.2em",
          marginBottom: 7,
        }}
      >
        {title}
      </div>
      <div className="grid grid-cols-2 items-center gap-1">{children}</div>
    </section>
  );
}
