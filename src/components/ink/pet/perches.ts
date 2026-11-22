"use client";

import { useEffect, useRef, type RefObject } from "react";

/* ──────────────────────────────────────────────────────────
   Perches — places the desktop husky can sit: the dock, and the top
   edge of the focused window. Each host registers its element; the
   pet reads live rects every frame, so it rides along when a window
   is dragged and survives windows opening, closing and maximising.
   ────────────────────────────────────────────────────────── */

export type Perch = {
  id: string;
  kind: "dock" | "window";
  el: HTMLElement;
  focused: boolean;
  maximized: boolean;
};

const perches = new Map<string, Perch>();

export function getPerch(id: string) {
  return perches.get(id);
}

/* Where the husky wants to be: the focused window if there is one, else the dock. */
export function desiredPerch(): Perch | undefined {
  for (const p of perches.values()) if (p.kind === "window" && p.focused) return p;
  return perches.get("dock");
}

/* Register `ref`'s element as a perch while `active`. Flags update every render. */
export function usePerch(
  id: string,
  kind: Perch["kind"],
  ref: RefObject<HTMLElement | null>,
  { active = true, focused = false, maximized = false }: { active?: boolean; focused?: boolean; maximized?: boolean } = {},
) {
  const flags = useRef({ focused, maximized });

  useEffect(() => {
    flags.current = { focused, maximized };
    const p = perches.get(id);
    if (p) Object.assign(p, flags.current);
  }, [id, focused, maximized]);

  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    perches.set(id, { id, kind, el, ...flags.current });
    return () => {
      if (perches.get(id)?.el === el) perches.delete(id);
    };
  }, [id, kind, ref, active]);
}
