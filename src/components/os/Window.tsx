"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WindowProps {
  id: string;
  title: string;
  theme: "detroit" | "cyberpunk" | "gta" | "rdr2" | "tlou" | "minecraft";
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  defaultMaximized?: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
}

const themeStyles: Record<string, { titleBar: string; border: string; accent: string; titleFont: string }> = {
  detroit: {
    titleBar: "bg-[#071220] border-b border-[#00e5ff33]",
    border: "border border-[#00e5ff44]",
    accent: "#00e5ff",
    titleFont: "'Orbitron', monospace",
  },
  cyberpunk: {
    titleBar: "bg-[#08080f] border-b border-[#f5e64233]",
    border: "border border-[#f5e64244]",
    accent: "#f5e642",
    titleFont: "'Rajdhani', sans-serif",
  },
  gta: {
    titleBar: "bg-[#0f0f07] border-b border-[#a4c63933]",
    border: "border border-[#a4c63944]",
    accent: "#a4c639",
    titleFont: "'Bebas Neue', cursive",
  },
  rdr2: {
    titleBar: "bg-[#1e1007] border-b border-[#c8a96e44]",
    border: "border border-[#c8a96e55]",
    accent: "#c8a96e",
    titleFont: "'Cinzel', serif",
  },
  tlou: {
    titleBar: "bg-[#111009] border-b border-[#7ab64833]",
    border: "border border-[#7ab64844]",
    accent: "#7ab648",
    titleFont: "'Special Elite', cursive",
  },
  minecraft: {
    titleBar: "bg-[#2a2a2a] border-b border-[#55555566]",
    border: "border-2 border-[#666]",
    accent: "#5aaf26",
    titleFont: "'Press Start 2P', monospace",
  },
};

export default function Window({
  id,
  title,
  theme,
  isOpen,
  isMinimized,
  zIndex,
  defaultPosition = { x: 80, y: 60 },
  defaultSize = { width: 760, height: 520 },
  defaultMaximized = true,
  onClose,
  onMinimize,
  onFocus,
  children,
}: WindowProps) {
  const [pos, setPos] = useState(defaultPosition);
  const [size] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(defaultMaximized);
  const [titleHovered, setTitleHovered] = useState(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const styles = themeStyles[theme] ?? themeStyles.detroit;

  const toggleMaximize = useCallback(() => {
    setIsMaximized((m) => !m);
  }, []);

  const onMouseDownTitleBar = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      onFocus(id);

      if (isMaximized) {
        // Unmaximize: drop window under cursor
        const nx = Math.max(0, e.clientX - size.width / 2);
        const ny = Math.max(0, e.clientY - 22);
        setIsMaximized(false);
        setPos({ x: nx, y: ny });
        dragOffset.current = { x: e.clientX - nx, y: e.clientY - ny };
      } else {
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      }

      isDragging.current = true;
      setIsDraggingActive(true);

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const nx = ev.clientX - dragOffset.current.x;
        const ny = ev.clientY - dragOffset.current.y;
        setPos({
          x: Math.max(0, Math.min(nx, window.innerWidth - size.width)),
          y: Math.max(0, Math.min(ny, window.innerHeight - 48 - 40)),
        });
      };
      const onUp = () => {
        isDragging.current = false;
        setIsDraggingActive(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [id, pos, size, isMaximized, onFocus]
  );

  const winLeft   = isMaximized ? 0 : pos.x;
  const winTop    = isMaximized ? 0 : pos.y;
  const winWidth  = isMaximized ? "100vw" : size.width;
  const winHeight = isMaximized ? "calc(100vh - 48px)" : size.height;
  const winRadius = isMaximized ? 0 : 6;

  return (
    <AnimatePresence>
      {isOpen && !isMinimized && (
        <motion.div
          ref={windowRef}
          key={id}
          className={`fixed flex flex-col overflow-hidden ${isMaximized ? "" : styles.border}`}
          style={{
            left: winLeft,
            top: winTop,
            width: winWidth,
            height: winHeight,
            zIndex,
            background: "#131318",
            borderRadius: winRadius,
            boxShadow: isMaximized
              ? "none"
              : `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ${styles.accent}22`,
            transition: isDraggingActive
              ? "none"
              : "left 0.22s cubic-bezier(0.25,0,0.25,1), top 0.22s cubic-bezier(0.25,0,0.25,1), width 0.22s cubic-bezier(0.25,0,0.25,1), height 0.22s cubic-bezier(0.25,0,0.25,1), border-radius 0.22s ease",
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          onMouseDown={() => onFocus(id)}
        >
          {/* Title bar */}
          <div
            className={`flex items-center justify-between select-none ${styles.titleBar} window-drag-handle`}
            style={{ height: 44, flexShrink: 0, paddingLeft: 36, paddingRight: 40 }}
            onMouseDown={onMouseDownTitleBar}
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          >
            {/* macOS-style traffic lights */}
            <div className="flex items-center gap-2">
              {/* Close */}
              <button
                onClick={() => onClose(id)}
                className="relative flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  width: 14, height: 14,
                  background: "#ff5f57",
                  boxShadow: titleHovered ? "0 0 6px #ff5f5788" : "none",
                }}
                aria-label="Close"
              >
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, color: "#7a0000",
                    opacity: titleHovered ? 1 : 0,
                    transition: "opacity 0.15s",
                    lineHeight: 1, userSelect: "none",
                  }}
                >
                  ✕
                </span>
              </button>

              {/* Minimize */}
              <button
                onClick={() => onMinimize(id)}
                className="relative flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  width: 14, height: 14,
                  background: "#febc2e",
                  boxShadow: titleHovered ? "0 0 6px #febc2e88" : "none",
                }}
                aria-label="Minimize"
              >
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, color: "#7a4a00",
                    opacity: titleHovered ? 1 : 0,
                    transition: "opacity 0.15s",
                    lineHeight: 1, userSelect: "none",
                    marginTop: -1,
                  }}
                >
                  −
                </span>
              </button>

              {/* Maximize / Restore */}
              <button
                onClick={() => { onFocus(id); toggleMaximize(); }}
                className="relative flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  width: 14, height: 14,
                  background: "#29c842",
                  opacity: titleHovered ? 1 : 0.35,
                  boxShadow: titleHovered ? "0 0 6px #29c84288" : "none",
                }}
                aria-label={isMaximized ? "Restore" : "Maximise"}
              >
                <span
                  style={{
                    fontSize: 8, color: "#003a00",
                    opacity: titleHovered ? 1 : 0,
                    transition: "opacity 0.15s",
                    lineHeight: 1, userSelect: "none",
                  }}
                >
                  {isMaximized ? "⊖" : "⊕"}
                </span>
              </button>
            </div>

            {/* Title */}
            <span
              style={{
                fontFamily: styles.titleFont,
                fontSize: theme === "minecraft" ? 9 : theme === "gta" ? 15 : 11,
                color: styles.accent,
                letterSpacing: theme === "gta" ? "0.12em" : "0.2em",
                opacity: 0.85,
                maxWidth: "60%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>

            {/* Theme accent dot */}
            <div
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: styles.accent,
                opacity: 0.5,
                boxShadow: `0 0 6px ${styles.accent}`,
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto min-h-0">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
