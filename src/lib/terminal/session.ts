"use client";

/* ──────────────────────────────────────────────────────────
   One conversation, many windows.

   The InkOS terminal window, the dock's ask bar and the phone's ask
   sheet all read and write this store, so a question asked in the dock
   is already in the terminal when you "Open in Terminal", and follow-up
   context carries across all of them.
   ────────────────────────────────────────────────────────── */

import { useSyncExternalStore } from "react";
import { runTerminal, type Chip, type TermLine, type TermResult } from "./engine";

export type Block = { id: number; input?: string; lines: TermLine[]; chips?: Chip[] };
type Snapshot = { blocks: Block[]; history: string[] };

const GREETING: TermLine[] = [
  { type: "system", text: "§fKR//OS §8InkOS terminal" },
  { type: "system", text: "§8Ask anything about Kaustav — or type §fhelp§8 for commands." },
];

let seq = 1;
let snap: Snapshot = { blocks: [{ id: seq++, lines: GREETING }], history: [] };
const listeners = new Set<() => void>();
const emit = (next: Snapshot) => {
  snap = next;
  listeners.forEach((l) => l());
};

export const termSession = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => snap,

  /* Run a command or question; returns the new block (null after `clear`)
     and the raw result, whose `action` the caller performs. */
  run(raw: string): { block: Block | null; result: TermResult } {
    const result = runTerminal(raw);
    const history = raw.trim() ? [raw, ...snap.history.filter((x) => x !== raw)].slice(0, 40) : snap.history;
    if (result.action?.kind === "clear") {
      emit({ blocks: [{ id: seq++, lines: [{ type: "system", text: "§8Cleared." }] }], history });
      return { block: null, result };
    }
    const block: Block = { id: seq++, input: raw, lines: result.lines, chips: result.chips };
    emit({ blocks: [...snap.blocks, block].slice(-150), history });
    return { block, result };
  },
};

export function useTermSession(): Snapshot {
  return useSyncExternalStore(termSession.subscribe, termSession.get, termSession.get);
}
