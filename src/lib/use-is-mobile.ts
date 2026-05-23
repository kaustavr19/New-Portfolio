"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────
   Viewport-based mobile detection.
   Returns true when viewport is narrower than the breakpoint.
   Listens for resize so it reacts to orientation changes
   and DevTools viewport switching.

   We use width-based detection (not user-agent sniffing) so:
     · Desktop browsers in narrow windows get the mobile shell
     · iPads in landscape get the desktop shell (good — they have room)
     · The breakpoint is the single source of truth
   ────────────────────────────────────────────────────────── */

export const MOBILE_BREAKPOINT_PX = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT_PX): boolean {
  // Start as `null` so SSR + first client render agree; flip on mount.
  // Components should treat `null`/`false` as "render desktop" by default.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setIsMobile(mql.matches);

    sync();

    // Modern browsers: addEventListener; older Safari: addListener
    if (mql.addEventListener) {
      mql.addEventListener("change", sync);
      return () => mql.removeEventListener("change", sync);
    } else {
      // @ts-expect-error legacy API
      mql.addListener(sync);
      // @ts-expect-error legacy API
      return () => mql.removeListener(sync);
    }
  }, [breakpoint]);

  return isMobile;
}
