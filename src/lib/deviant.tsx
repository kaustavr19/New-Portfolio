"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

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

const STORAGE_KEY = "kros_deviant";
const Ctx = createContext<DeviantCtx | null>(null);

export function DeviantProvider({ children }: { children: ReactNode }) {
  const [deviant, setDeviantState] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setDeviantState(true);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, deviant ? "1" : "0"); } catch {}
  }, [deviant, ready]);

  const setDeviant = useCallback((v: boolean) => setDeviantState(v), []);
  const toggle = useCallback(() => setDeviantState((d) => !d), []);

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
