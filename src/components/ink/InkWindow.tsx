"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useA11y } from "@/lib/a11y";
import { uiClose, uiTick } from "@/lib/ink-sound";
import { WindowFocusContext } from "@/components/os/Window";
import { usePerch } from "./pet/perches";

/* InkOS window — rounded black panel, hairline border, three outline
   controls (close is the red one), and a light bar on the top edge
   that pulses whenever the window takes focus. Drag by the title bar;
   double-click it to maximise. */

export type Rect = { x: number; y: number; w: number; h: number };

export default function InkWindow({
  id,
  title,
  index,
  isOpen,
  isMinimized,
  isFocused,
  zIndex,
  initial,
  bounds,
  onClose,
  onMinimize,
  onFocus,
  children,
}: {
  id: string;
  title: string;
  index: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  zIndex: number;
  initial: Rect;
  bounds: Rect;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
}) {
  const { motionReduced, soundEffects } = useA11y();
  const click = useCallback(
    (kind: "close" | "tick") => {
      if (!soundEffects) return;
      if (kind === "close") uiClose();
      else uiTick();
    },
    [soundEffects],
  );
  const [rect, setRect] = useState<Rect>(initial);
  const [maximized, setMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  usePerch(`window:${id}`, "window", sectionRef, { active: isOpen && !isMinimized, focused: isFocused, maximized });

  // Opening a window sends a ripple through the wallpaper from its centre.
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    window.dispatchEvent(new CustomEvent("ink:ripple", { detail: { x: initial.x + initial.w / 2, y: initial.y + initial.h / 2 } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isMinimized]);

  const onDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      onFocus(id);
      let start = rect;
      if (maximized) {
        start = { ...rect, x: Math.max(bounds.x, e.clientX - rect.w / 2), y: Math.max(bounds.y, e.clientY - 26) };
        setMaximized(false);
        setRect(start);
      }
      offset.current = { x: e.clientX - start.x, y: e.clientY - start.y };
      setDragging(true);
      const move = (ev: MouseEvent) => {
        setRect((r) => ({
          ...r,
          x: Math.max(0, Math.min(ev.clientX - offset.current.x, window.innerWidth - 120)),
          y: Math.max(0, Math.min(ev.clientY - offset.current.y, window.innerHeight - 120)),
        }));
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [id, rect, maximized, bounds, onFocus],
  );

  const r = maximized ? bounds : rect;

  return (
    <AnimatePresence>
      {isOpen && !isMinimized && (
        <motion.section
          ref={sectionRef}
          key={id}
          role="dialog"
          aria-label={title}
          className="ink fixed flex flex-col"
          style={{
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            zIndex,
            background: "var(--ink-surface)",
            border: `1px solid ${isFocused ? "var(--ink-line-strong)" : "var(--ink-line)"}`,
            borderRadius: "var(--r-window)",
            overflow: "hidden",
            boxShadow: "var(--ink-shadow)",
            transition: dragging
              ? "none"
              : "left .22s cubic-bezier(.25,0,.25,1), top .22s cubic-bezier(.25,0,.25,1), width .22s cubic-bezier(.25,0,.25,1), height .22s cubic-bezier(.25,0,.25,1)",
          }}
          initial={motionReduced ? false : { opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={motionReduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={motionReduced ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
          onMouseDown={() => onFocus(id)}
        >
          <span
            key={isFocused ? "focused" : "idle"} /* remount → the pulse replays on every focus */
            aria-hidden
            className={`ink-glyph ${isFocused ? (motionReduced ? "" : "pulse") : "idle"}`}
          />
          <header
            onMouseDown={onDown}
            onDoubleClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              setMaximized((m) => !m);
            }}
            style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid var(--ink-line)", cursor: dragging ? "grabbing" : "grab", userSelect: "none" }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Close", act: () => onClose(id), red: true },
                { label: "Minimise", act: () => onMinimize(id) },
                { label: maximized ? "Restore" : "Maximise", act: () => { onFocus(id); setMaximized((m) => !m); } },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  aria-label={b.label}
                  title={b.label}
                  onClick={() => { click(b.red ? "close" : "tick"); b.act(); }}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    border: `1.5px solid ${b.red ? "var(--ink-red)" : "var(--ink-mute)"}`,
                    background: b.red && isFocused ? "var(--ink-red)" : "transparent",
                  }}
                />
              ))}
            </div>
            <h2 className="ink-label" style={{ color: "var(--ink-fg)", letterSpacing: ".2em", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
              {title}
            </h2>
            <span className="ink-label" aria-hidden>{index}</span>
          </header>
          <div className="flex-1 min-h-0 overflow-hidden">
            <WindowFocusContext.Provider value={isFocused}>{children}</WindowFocusContext.Provider>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
