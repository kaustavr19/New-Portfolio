"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useTheme } from "@/lib/theme";

/* ──────────────────────────────────────────────────────────
   Global "Deviant Mode" state — the holistic version of the
   toggle that used to live inside AboutApp.
   When on:
     · Copy switches to deviant variants
     · Wallpaper palette swaps to deviant set
     · A subtle red wash is applied globally
     · Per-app accents shift toward magenta where opted in
   ────────────────────────────────────────────────────────── */

type DeviantCtx = {
  deviant: boolean;
  setDeviant: (v: boolean) => void;
  toggle: () => void;
};

const Ctx = createContext<DeviantCtx | null>(null);

/* Deviant is now one of the OS themes (see lib/theme). This provider
   derives from it, so every existing useDeviant() caller keeps working:
   turning deviant on switches to the "deviant" theme, off to "classic". */
export function DeviantProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const deviant = theme === "deviant";
  const setDeviant = useCallback((v: boolean) => setTheme(v ? "deviant" : "classic"), [setTheme]);
  const toggle = useCallback(() => setTheme(deviant ? "classic" : "deviant"), [deviant, setTheme]);
  return <Ctx.Provider value={{ deviant, setDeviant, toggle }}>{children}</Ctx.Provider>;
}

export function useDeviant(): DeviantCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Safe fallback for tests / isolated mounts
    return { deviant: false, setDeviant: () => {}, toggle: () => {} };
  }
  return v;
}

/* ──────────────────────────────────────────────────────────
   Content helpers — shallow-merge a deviant override onto its
   base when deviant is on. Generic so any { normal, deviant }
   pair works.
   ────────────────────────────────────────────────────────── */
export function pickCopy<T>(normal: T, deviant: T, isDeviant: boolean): T {
  return isDeviant ? deviant : normal;
}

export function mergeDeviant<T extends object>(base: T, override: Partial<T>, isDeviant: boolean): T {
  return isDeviant ? { ...base, ...override } : base;
}
