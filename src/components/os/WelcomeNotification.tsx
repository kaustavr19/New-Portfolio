"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ──────────────────────────────────────────────────────────
   WelcomeNotification — a one-time CODEC-style toast pointing
   first-ever visitors toward Projects/. Mounted by Desktop.tsx
   (unconditionally — it only mounts post-boot) and MobileOS.tsx
   (only once past the lock screen), so each shell's own "ready"
   moment gates the component instead of needing a shared event.

   Styled as system-level OS chrome (matches the Taskbar Start
   Menu palette) rather than any single app's theme.
   ────────────────────────────────────────────────────────── */

const WELCOMED_KEY = "kros_welcomed";
const DELAY_MS = 2500;
const MONO = "'Share Tech Mono', monospace";

export default function WelcomeNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(WELCOMED_KEY) === "1") return;
    } catch {
      return;
    }
    const t = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(WELCOMED_KEY, "1");
    } catch {
      // ignore — worst case it shows again next visit
    }
  }

  function openProjects() {
    window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "projects" }));
    dismiss();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3 }}
          role="status"
          className="fixed rounded-sm shadow-2xl"
          style={{
            zIndex: 9990,
            right: "max(16px, env(safe-area-inset-right, 0px))",
            bottom: "max(80px, calc(env(safe-area-inset-bottom, 0px) + 64px))",
            width: 300,
            background: "#141419",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "16px 18px",
          }}
        >
          <div className="flex items-start justify-between gap-3" style={{ marginBottom: 10 }}>
            <div className="flex items-center gap-2">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4fc3f7", flexShrink: 0 }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em" }}>
                NEW TRANSMISSION
              </span>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="hover:bg-white/5 transition-colors rounded-sm"
              style={{ color: "#6a6a7e", fontSize: 12, padding: "2px 6px", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontFamily: MONO, fontSize: 12, color: "#dcdce4", letterSpacing: "0.02em", lineHeight: 1.6, marginBottom: 14 }}>
            First time here? Start with{" "}
            <span style={{ color: "#f5e642" }}>Projects/</span> — or open{" "}
            <span style={{ color: "#f5e642" }}>Terminal</span> if you&apos;re curious.
          </p>

          <button
            onClick={openProjects}
            className="hover:bg-white/5 transition-colors rounded-sm"
            style={{
              width: "100%",
              fontFamily: MONO,
              fontSize: 11,
              color: "#4fc3f7",
              letterSpacing: "0.1em",
              border: "1px solid rgba(79,195,247,0.4)",
              borderRadius: 2,
              padding: "8px 0",
            }}
          >
            OPEN PROJECTS/
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
