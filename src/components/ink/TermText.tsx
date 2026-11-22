"use client";

import type { Chip, TermLine } from "@/lib/terminal/engine";

/* The terminal engine writes Minecraft §-colour codes; InkOS maps them onto
   its palette: greens/whites → ink, golds → bright, aquas/blues → blue,
   reds → red, greys → muted. */
const FG = "var(--ink-fg)", SOFT = "var(--ink-soft)", MUTE = "var(--ink-mute)", DIM = "var(--ink-dim)", RED = "var(--ink-red)", BLUE = "var(--ink-blue)", STRONG = "var(--ink-strong)";
const INK_CODES: Record<string, string> = {
  "0": DIM, "1": BLUE, "2": FG, "3": BLUE, "4": RED,
  "5": SOFT, "6": STRONG, "7": SOFT, "8": MUTE, "9": BLUE,
  a: FG, b: BLUE, c: RED, d: SOFT, e: STRONG, f: FG,
};
export const LINE_BASE: Record<TermLine["type"], string> = { input: FG, output: SOFT, error: RED, system: MUTE };

export function Segments({ text, base }: { text: string; base: string }) {
  const parts: { t: string; c: string }[] = [];
  let color = base;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "§" && i + 1 < text.length && INK_CODES[text[i + 1].toLowerCase()]) {
      if (buf) parts.push({ t: buf, c: color });
      buf = "";
      color = INK_CODES[text[i + 1].toLowerCase()];
      i++;
      continue;
    }
    buf += text[i];
  }
  if (buf) parts.push({ t: buf, c: color });
  return <>{parts.map((p, i) => <span key={i} style={{ color: p.c }}>{p.t}</span>)}</>;
}

export function TermLines({ lines }: { lines: TermLine[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: "1.6em" }}>
          <Segments text={l.text} base={LINE_BASE[l.type]} />
        </div>
      ))}
    </>
  );
}

/* Follow-up buttons under an answer. */
export function ChipRow({ chips, onChip }: { chips?: Chip[]; onChip: (c: Chip) => void }) {
  if (!chips?.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 2px" }} aria-label="Follow-ups">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          data-tick
          className={`ink-pill${c.act.kind === "open" && c.act.app === "contact" ? " action" : ""}`}
          onClick={() => onChip(c)}
          style={{ padding: "5px 11px", fontFamily: "var(--font-mono)", fontSize: 11.5 }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
