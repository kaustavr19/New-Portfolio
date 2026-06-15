"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LockScreen from "./mobile/LockScreen";
import HomeScreen from "./mobile/HomeScreen";
import AppView from "./mobile/AppView";

/* DesktopBg and MouseTrail are dynamically imported, same pattern as
   Desktop.tsx — keeps SSR happy (both touch window/canvas). */
const DesktopBg = dynamic(() => import("./DesktopBg"), { ssr: false });
const MouseTrail = dynamic(() => import("./MouseTrail"), { ssr: false });

type View = "lock" | "home" | "app";

const BOOT_KEY = "kros_booted";

/* ──────────────────────────────────────────────────────────
   MobileOS — the phone shell.

   - Owns the wallpaper canvas (always-mounted, persists across views)
   - State machine: lock → home → app → home
   - Skips lock if user already authenticated in this session
     (shares the kros_booted sessionStorage key with desktop boot
     so resizing from desktop to mobile doesn't re-prompt)
   - The single tap on LockScreen also satisfies the browser's
     autoplay gesture requirement — DesktopBg's existing window-level
     click listener will pick it up and resume the audio context
   ────────────────────────────────────────────────────────── */

export default function MobileOS() {
  const [view, setView] = useState<View>("lock");
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Hydration: skip lock if already booted this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_KEY) === "1") {
        setView("home");
      }
    } catch {
      // sessionStorage unavailable — keep showing lock
    }
  }, []);

  /* Toggle a body class while a full-screen app is open. DesktopBg
     reads this to suppress touch-driven wallpaper interactions
     (bubble pops, cursor pulses) when the wallpaper is hidden behind
     an app — otherwise scrolling inside an app would trigger phantom
     pops on the cells behind it. */
  useEffect(() => {
    const cls = "kros-app-open";
    if (view === "app") {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => { document.body.classList.remove(cls); };
  }, [view]);

  const handleUnlock = () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setView("home");
  };

  const handleOpenApp = (id: string) => {
    setActiveApp(id);
    setView("app");
  };

  const handleBack = () => {
    setView("home");
    // Keep activeApp set briefly so AppView doesn't unmount mid-fade
    // (no animation yet, but defensive for the polish phase)
    setTimeout(() => setActiveApp(null), 200);
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#0a0a14" }}
    >
      {/* Wallpaper — always mounted */}
      <DesktopBg />
      <MouseTrail />

      {/* Active view — sits above the wallpaper */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {view === "lock" && <LockScreen onUnlock={handleUnlock} />}
        {view === "home" && <HomeScreen onOpenApp={handleOpenApp} />}
        {view === "app" && activeApp && (
          <AppView appId={activeApp} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
