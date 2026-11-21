"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* ──────────────────────────────────────────────────────────
   OS theme — which shell the visitor sees.

     ink      InkOS: monochrome, dot-matrix, two signal colours (default)
     classic  The original game-themed KR//OS
     deviant  Classic with Deviant Mode on (DeviantProvider derives
              its state from this, so all existing deviant code works)

   Persisted in localStorage, mirrored to <html data-theme> so CSS
   can react (e.g. Ink drops the scanline overlay).
   ────────────────────────────────────────────────────────── */

export type ThemeId = "ink" | "classic" | "deviant";

export const THEMES: { id: ThemeId; label: string; hint: string }[] = [
  { id: "ink", label: "InkOS", hint: "Monochrome, dot-matrix, two signal colours" },
  { id: "classic", label: "Classic", hint: "The original game-themed apps" },
  { id: "deviant", label: "Deviant", hint: "Classic, with the barrier broken" },
];

export const DEFAULT_THEME: ThemeId = "ink";
const STORAGE_KEY = "kros_theme";

type ThemeCtx = { theme: ThemeId; setTheme: (t: ThemeId) => void; ready: boolean };
const Ctx = createContext<ThemeCtx | null>(null);

function isTheme(v: string | null): v is ThemeId {
  return v === "ink" || v === "classic" || v === "deviant";
}

/* Read once on the client. OSRoot renders nothing until after mount, so
   the server's default and the client's stored value never disagree in markup. */
function initialTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    // ?theme=classic on a link previews a theme without any UI.
    const fromUrl = new URLSearchParams(window.location.search).get("theme");
    if (isTheme(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // storage unavailable — default theme
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);
  const ready = true;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((t: ThemeId) => setThemeState(t), []);
  return <Ctx.Provider value={{ theme, setTheme, ready }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  return useContext(Ctx) ?? { theme: DEFAULT_THEME, setTheme: () => {}, ready: true };
}
