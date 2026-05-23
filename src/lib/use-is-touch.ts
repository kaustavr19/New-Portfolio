"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────
   Detects whether the device has a touch screen.

   Independent of useIsMobile():
     · A Surface in tablet mode is touch + wide   → desktop shell, touch wallpaper
     · A phone is touch + narrow                  → mobile shell, touch wallpaper
     · A regular laptop is non-touch + narrow win → mobile shell, mouse wallpaper

   Used by DesktopBg to wire touchstart/touchmove events for bubble pops.
   ────────────────────────────────────────────────────────── */

export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Combine the two reliable signals: matchMedia hover/pointer + the
    // legacy ontouchstart marker (still helpful on some Android browsers).
    const hasFineHover =
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
    const hasTouchPoints =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

    setIsTouch(hasTouchPoints && !hasFineHover);
  }, []);

  return isTouch;
}
