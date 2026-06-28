"use client";

import { useEffect, useRef, useState } from "react";
import { useA11y, A11yPrefs } from "@/lib/a11y";
import { useDeviant } from "@/lib/deviant";
import { osChrome, osChromeDeviant } from "@/data/content";

const MONO = "'Share Tech Mono', monospace";
// Body-text font for hint/description copy in the popover
const BODY = "'Rajdhani', sans-serif";

type Toggle = {
  key: keyof A11yPrefs;
  label: string;
  hint: string;
};

export default function AccessibilityMenu() {
  const a11y = useA11y();
  const { deviant } = useDeviant();
  const ch = deviant ? osChromeDeviant : osChrome;
  const TOGGLES: Toggle[] = [
    { key: "motionReduced", label: ch.reduceMotion,   hint: ch.reduceMotionHint },
    { key: "soundEffects",  label: ch.soundEffects,   hint: ch.soundEffectsHint },
    { key: "ambience",      label: ch.ambience,       hint: ch.ambienceHint },
    { key: "highContrast",  label: ch.highContrast,   hint: ch.highContrastHint },
  ];
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Count prefs flipped away from their default (motion/contrast on, sound off).
  const activeCount = [a11y.motionReduced, a11y.highContrast, !a11y.soundEffects, !a11y.ambience].filter(Boolean).length;

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1 transition-all hover:bg-white/5 group"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: open ? "#f5e642" : "#a0a0b8",
          letterSpacing: "0.1em",
          border: `1px solid ${open ? "#f5e64255" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 2,
          marginRight: 8,
        }}
        title="Accessibility options"
        aria-label="Accessibility options"
        aria-expanded={open}
      >
        <i className="hn hn-glasses" style={{ fontSize: 12, color: "#f5e642" }} />
        <span className="hidden md:inline group-hover:text-white transition-colors">{ch.a11yLabel}</span>
        {activeCount > 0 && (
          <span
            style={{
              fontSize: 8,
              color: "#0a0a14",
              background: "#f5e642",
              padding: "1px 4px",
              borderRadius: 2,
              letterSpacing: 0,
              fontWeight: 700,
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Popover panel */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 mb-2"
          style={{
            bottom: "100%",
            width: 280,
            background: "rgba(10, 16, 32, 0.96)",
            border: "1px solid rgba(245,230,66,0.25)",
            borderRadius: 4,
            padding: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "#f5e64288",
              letterSpacing: "0.3em",
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid rgba(245,230,66,0.15)",
            }}
          >
            {ch.a11yHeader}
          </div>

          <div className="flex flex-col gap-3">
            {TOGGLES.map((t) => {
              const active = a11y[t.key];
              return (
                <label
                  key={t.key}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  {/* Pill switch */}
                  <button
                    type="button"
                    onClick={() => a11y.toggle(t.key)}
                    aria-pressed={active}
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 18,
                      borderRadius: 10,
                      background: active ? "#f5e642" : "#1a2030",
                      border: `1px solid ${active ? "#f5e642" : "#3a4050"}`,
                      position: "relative",
                      transition: "background 0.15s, border-color 0.15s",
                      cursor: "pointer",
                      marginTop: 2,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 1,
                        left: active ? 18 : 1,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: active ? "#0a0a14" : "#c8c8d8",
                        transition: "left 0.15s, background 0.15s",
                      }}
                    />
                  </button>

                  <div
                    onClick={() => a11y.toggle(t.key)}
                    style={{ flex: 1 }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: active ? "#f5e642" : "#e0e0e8",
                        letterSpacing: "0.1em",
                        lineHeight: 1.2,
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        fontFamily: BODY,
                        fontSize: 12,
                        fontWeight: 400,
                        color: "#8a8a9c",
                        letterSpacing: "0.01em",
                        lineHeight: 1.35,
                        marginTop: 4,
                      }}
                    >
                      {t.hint}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontFamily: MONO,
              fontSize: 8,
              color: "#4a4a5a",
              letterSpacing: "0.15em",
              textAlign: "center",
            }}
          >
            {ch.a11yFooter}
          </div>
        </div>
      )}
    </div>
  );
}
