"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

/* ──────────────────────────────────────────────────────────
   Reading mode — a site-wide taskbar toggle that renders
   About / Experience / Projects as one scrollable, printable
   document. Transient (not persisted): it's a view you open,
   not an ambient preference, so it starts closed every visit.
   ────────────────────────────────────────────────────────── */

type ReaderModeCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const Ctx = createContext<ReaderModeCtx | null>(null);

export function ReaderModeProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const setOpen = useCallback((v: boolean) => setOpenState(v), []);
  const toggle = useCallback(() => setOpenState((o) => !o), []);
  return <Ctx.Provider value={{ open, setOpen, toggle }}>{children}</Ctx.Provider>;
}

export function useReaderMode(): ReaderModeCtx {
  const v = useContext(Ctx);
  if (!v) return { open: false, setOpen: () => {}, toggle: () => {} };
  return v;
}
