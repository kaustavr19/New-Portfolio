"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

/* ──────────────────────────────────────────────────────────
   Accessibility preferences — global context + localStorage.
   Components import useA11y() to read/write user prefs.
   Defaults respect `prefers-reduced-motion`.
   ────────────────────────────────────────────────────────── */

export type A11yPrefs = {
  motionReduced: boolean;
  soundEffects: boolean;   // pop sounds, boot chimes, UI blips
  ambience: boolean;       // subtle galactic background hum
  highContrast: boolean;
};

type A11yCtx = A11yPrefs & {
  setPref: <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => void;
  toggle: (key: keyof A11yPrefs) => void;
};

const DEFAULTS: A11yPrefs = {
  motionReduced: false,
  soundEffects: true,
  ambience: true,
  highContrast: false,
};

const STORAGE_KEY = "kros_a11y";

const Ctx = createContext<A11yCtx | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage + check prefers-reduced-motion on mount
  useEffect(() => {
    let next = { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<A11yPrefs> & { audioMuted?: boolean };
        next = { ...next, ...parsed };
        // Migrate the old single `audioMuted` flag → split sound toggles.
        if (parsed.audioMuted !== undefined && parsed.soundEffects === undefined) {
          next.soundEffects = !parsed.audioMuted;
          next.ambience = !parsed.audioMuted;
        }
      } else if (typeof window !== "undefined" && window.matchMedia) {
        // No user override yet — respect OS preference
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          next.motionReduced = true;
        }
      }
    } catch {
      // ignore parse / storage errors
    }
    setPrefs(next);
    setReady(true);
  }, []);

  // Persist on change (skip the first hydration pass)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // storage unavailable
    }
  }, [prefs, ready]);

  const setPref: A11yCtx["setPref"] = useCallback((key, value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);

  const toggle: A11yCtx["toggle"] = useCallback((key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  return <Ctx.Provider value={{ ...prefs, setPref, toggle }}>{children}</Ctx.Provider>;
}

export function useA11y(): A11yCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Safe fallback so isolated components don't crash if provider's missing
    return {
      ...DEFAULTS,
      setPref: () => {},
      toggle: () => {},
    };
  }
  return v;
}
