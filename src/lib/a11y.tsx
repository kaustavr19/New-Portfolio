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
  // Whether the user has ever explicitly touched the Reduce Motion switch
  // themselves, as opposed to it just reflecting the auto-detected OS
  // preference. Only once this is true does motionReduced stop re-syncing
  // to the live `prefers-reduced-motion` query on every load.
  const [motionUserSet, setMotionUserSet] = useState(false);

  // Hydrate from localStorage + check prefers-reduced-motion on mount
  useEffect(() => {
    let next = { ...DEFAULTS };
    let userSetMotion = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<A11yPrefs> & { audioMuted?: boolean; motionReducedUserSet?: boolean };
        next = { ...next, ...parsed };
        userSetMotion = !!parsed.motionReducedUserSet;
        // Migrate the old single `audioMuted` flag → split sound toggles.
        if (parsed.audioMuted !== undefined && parsed.soundEffects === undefined) {
          next.soundEffects = !parsed.audioMuted;
          next.ambience = !parsed.audioMuted;
        }
      }
      // Unless the user has explicitly chosen Reduce Motion themselves,
      // always follow the live OS preference rather than whatever it
      // happened to read on a long-ago first visit — otherwise a stale
      // `true` (e.g. from testing in an environment that reports reduced
      // motion) sticks forever, surviving cache clears and hard reloads
      // since it lives in localStorage, not the cache.
      if (!userSetMotion && typeof window !== "undefined" && window.matchMedia) {
        next.motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }
    } catch {
      // ignore parse / storage errors
    }
    setPrefs(next);
    setMotionUserSet(userSetMotion);
    setReady(true);
  }, []);

  // Persist on change (skip the first hydration pass)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, motionReducedUserSet: motionUserSet }));
    } catch {
      // storage unavailable
    }
  }, [prefs, motionUserSet, ready]);

  const setPref: A11yCtx["setPref"] = useCallback((key, value) => {
    if (key === "motionReduced") setMotionUserSet(true);
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);

  const toggle: A11yCtx["toggle"] = useCallback((key) => {
    if (key === "motionReduced") setMotionUserSet(true);
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
