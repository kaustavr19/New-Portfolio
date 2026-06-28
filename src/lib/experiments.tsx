"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

/* ──────────────────────────────────────────────────────────
   EXPERIMENTS — WebGL/3D feature flags (sandbox).

   A direct sibling of A11yProvider: context + localStorage, but
   ALSO hydrates from a `?fx=` URL param so effects can be flipped
   on a preview link without any UI.

   Defaults (see DEFAULTS): CRT + WebGL boot ship ON as part of the
   default OS look; the cosmic starfield is OFF and opt-in via the
   desktop wallpaper switcher. Flags gate lazily-imported effects,
   so an OFF flag means that effect's code is never downloaded.

   Toggle surfaces:
     · URL    →  ?fx=crt,skills3d   (aliases below)
     · In-app →  SettingsApp "LABS" section
   ────────────────────────────────────────────────────────── */

export type Experiments = {
  crtShader: boolean;       // Phase 1 — full-screen CRT post layer
  skills3d: boolean;        // Phase 2 — Skills as a 3D node graph (WIP)
  bootWebgl: boolean;       // Phase 3 — WebGL boot moment (WIP)
  starfieldWebgl: boolean;  // Phase 4 — GPU desktop starfield (WIP)
};

type ExperimentsCtx = Experiments & {
  setFlag: <K extends keyof Experiments>(key: K, value: Experiments[K]) => void;
  toggle: (key: keyof Experiments) => void;
};

const DEFAULTS: Experiments = {
  crtShader: true,        // shipped on — part of the default OS look
  bootWebgl: true,        // shipped on — synthwave cold-boot backdrop
  skills3d: false,
  starfieldWebgl: false,  // opt-in wallpaper — toggled via the desktop switcher
};

/* Short URL aliases → flag keys. `?fx=crt,skills3d` */
const FX_ALIASES: Record<string, keyof Experiments> = {
  crt: "crtShader",
  skills3d: "skills3d",
  boot: "bootWebgl",
  starfield: "starfieldWebgl",
};

const STORAGE_KEY = "kros_experiments";

const Ctx = createContext<ExperimentsCtx | null>(null);

/* Parse `?fx=crt,starfield` (and `?fx=none` to clear) into a partial. */
function parseUrlFlags(): Partial<Experiments> | "clear" | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("fx");
  if (raw == null) return null;
  const tokens = raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tokens.includes("none") || tokens.includes("off")) return "clear";
  const out: Partial<Experiments> = {};
  for (const t of tokens) {
    const key = FX_ALIASES[t];
    if (key) out[key] = true;
  }
  return Object.keys(out).length ? out : null;
}

export function ExperimentsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Experiments>(DEFAULTS);
  const [ready, setReady] = useState(false);

  // Hydrate: localStorage first, then URL param overrides on top.
  useEffect(() => {
    let next: Experiments = { ...DEFAULTS };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) next = { ...next, ...(JSON.parse(stored) as Partial<Experiments>) };
    } catch {
      // ignore parse / storage errors
    }
    const url = parseUrlFlags();
    if (url === "clear") next = { ...DEFAULTS };
    else if (url) next = { ...next, ...url };

    setFlags(next);
    setReady(true);
  }, []);

  // Persist on change (skip the first hydration pass).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch {
      // storage unavailable
    }
  }, [flags, ready]);

  const setFlag: ExperimentsCtx["setFlag"] = useCallback((key, value) => {
    setFlags((f) => ({ ...f, [key]: value }));
  }, []);

  const toggle: ExperimentsCtx["toggle"] = useCallback((key) => {
    setFlags((f) => ({ ...f, [key]: !f[key] }));
  }, []);

  return <Ctx.Provider value={{ ...flags, setFlag, toggle }}>{children}</Ctx.Provider>;
}

export function useExperiments(): ExperimentsCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Safe fallback so isolated components don't crash without a provider.
    return { ...DEFAULTS, setFlag: () => {}, toggle: () => {} };
  }
  return v;
}
