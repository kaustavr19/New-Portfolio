"use client";

import { useDeviant } from "@/lib/deviant";

/* ──────────────────────────────────────────────────────────
   Bottom home indicator — iPhone-style horizontal pill.
   Optional `onTap` lets the AppView use it as a "return home"
   action. When omitted (e.g. on HomeScreen itself), it's just
   decorative chrome.
   ────────────────────────────────────────────────────────── */

export default function HomeIndicator({
  onTap,
  width = 134,
  height = 5,
}: {
  onTap?: () => void;
  width?: number;
  height?: number;
}) {
  const { deviant } = useDeviant();

  const fill = deviant ? "rgba(255,60,140,0.7)" : "rgba(255,255,255,0.55)";
  const Tag = onTap ? "button" : "div";

  return (
    <div
      className="flex justify-center items-center flex-shrink-0 select-none"
      style={{
        paddingTop: 8,
        // env(safe-area-inset-bottom) sits the pill above the iOS gesture area
        paddingBottom: "max(10px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <Tag
        onClick={onTap}
        aria-label={onTap ? "Return to home screen" : undefined}
        style={{
          // Generous invisible touch target wrapping the visible pill
          padding: "10px 60px",
          background: "transparent",
          border: "none",
          cursor: onTap ? "pointer" : "default",
          margin: 0,
          // Inherit alignment from flex parent above
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width,
            height,
            borderRadius: height,
            background: fill,
            transition: "background 0.4s ease",
            boxShadow: deviant ? "0 0 6px rgba(255,60,140,0.4)" : "none",
          }}
        />
      </Tag>
    </div>
  );
}
