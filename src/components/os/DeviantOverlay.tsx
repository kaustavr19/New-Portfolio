"use client";

import { useDeviant } from "@/lib/deviant";

/* ──────────────────────────────────────────────────────────
   Subtle screen-wide signal that deviant mode is active.
   Sits on top of everything, pointer-events: none so it
   never intercepts clicks.
   ────────────────────────────────────────────────────────── */
export default function DeviantOverlay() {
  const { deviant } = useDeviant();

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{
        // Layered: a soft magenta wash + corner vignette in deeper red.
        background: deviant
          ? "radial-gradient(ellipse at 50% 50%, rgba(255,0,144,0.05) 0%, rgba(180,0,80,0.10) 60%, rgba(120,0,40,0.16) 100%)"
          : "transparent",
        mixBlendMode: "screen",
        opacity: deviant ? 1 : 0,
        transition: "opacity 0.6s ease",
        zIndex: 9998,
      }}
    />
  );
}
