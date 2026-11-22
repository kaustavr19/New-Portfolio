/* ──────────────────────────────────────────────────────────
   Project covers — generated, not drawn.

   Every project gets a dot-matrix "badge" on the same 18px-style dot
   grid as the InkOS wallpaper, built only from its own data:
     · its code (UW, EDT, NXV…) in a 5×7 LED font, doubled
     · a progress row that fills to its completion, red tip if live
     · a type marker, same legend as the work map:
       filled = main, ring = contract, small = side
     · a faint scatter seeded by its id, so no two covers match
   Pure geometry here; ProjectCover (React) and the OG images render it.
   NDA-safe by construction — nothing on a cover comes from client work.
   ────────────────────────────────────────────────────────── */

import type { Project } from "@/data/content";

export const COVER_COLS = 48;
export const COVER_ROWS = 27; // 16:9

export type CoverDot = { c: number; r: number; tone: "lit" | "live" | "soft" };
export type Cover = { code: string; dots: CoverDot[]; marker: { c: number; r: number; kind: Project["type"] } };

/* 5×7 LED glyphs, A–Z and 0–9. */
const G: Record<string, string> = {
  A: ".###.#...##...#######...##...##...#", B: "####.#...##...#####.#...##...#####.",
  C: ".###.#...##....#....#....#...#.###.", D: "####.#...##...##...##...##...#####.",
  E: "######....#....####.#....#....#####", F: "######....#....####.#....#....#....",
  G: ".###.#...##....#.####...##...#.###.", H: "#...##...##...#######...##...##...#",
  I: ".###...#....#....#....#....#...###.", J: "..###...#....#....#....##..#..##...",
  K: "#...##..#.#.#..##...#.#..#..#.#...#", L: "#....#....#....#....#....#....#####",
  M: "#...###.###.#.##.#.##...##...##...#", N: "#...##...###..##.#.##..###...##...#",
  O: ".###.#...##...##...##...##...#.###.", P: "####.#...##...#####.#....#....#....",
  Q: ".###.#...##...##...##.#.##..#..##.#", R: "####.#...##...#####.#.#..#..#.#...#",
  S: ".#####....#.....###.....#....#####.", T: "#####..#....#....#....#....#....#..",
  U: "#...##...##...##...##...##...#.###.", V: "#...##...##...##...##...#.#.#...#..",
  W: "#...##...##...##.#.##.#.##.#.#.#.#.", X: "#...##...#.#.#...#...#.#.#...##...#",
  Y: "#...##...#.#.#...#....#....#....#..", Z: "#####....#...#...#...#...#....#####",
  "0": ".###.#...##..###.#.###..##...#.###.", "1": "..#...##....#....#....#....#...###.",
  "2": ".###.#...#....#...#...#...#...#####", "3": "#####...#...#.....#.....##...#.###.",
  "4": "...#...##..#.#.#..#.#####...#....#.", "5": "######....####.....#....##...#.###.",
  "6": "..##..#...#....####.#...##...#.###.", "7": "#####....#...#...#...#....#....#...",
  "8": ".###.#...##...#.###.#...##...#.###.", "9": ".###.#...##...#.####....#...#..##..",
};

const SKIP = new Set(["operation", "project", "the", "a", "an", "of", "realignment", "platform"]);
/* Hand-picked where the derived code would read badly. */
const CODE: Record<string, string> = { underwriting: "UW", "cogentiq-dls": "DLS", "agent-compose": "AC", jotmd: "MD" };

export function coverCode(p: Pick<Project, "id" | "name">): string {
  if (CODE[p.id]) return CODE[p.id];
  const words = p.name.split(/\s[—–-]\s/)[0].split(/\s+/).filter((w) => !SKIP.has(w.toLowerCase()));
  if (words.length >= 2) return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  const w = (words[0] ?? p.name).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const rest = w.slice(1).replace(/[AEIOU]/g, "");
  return (w[0] + rest.slice(0, 2)).padEnd(2, w[1] ?? "");
}

/* Small deterministic PRNG, seeded by the project id. */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function buildCover(p: Pick<Project, "id" | "name" | "type" | "status" | "completion">): Cover {
  const code = coverCode(p);
  const dots: CoverDot[] = [];
  const taken = new Set<string>();
  const put = (c: number, r: number, tone: CoverDot["tone"]) => {
    const k = `${c},${r}`;
    if (c < 0 || r < 0 || c >= COVER_COLS || r >= COVER_ROWS || taken.has(k)) return;
    taken.add(k);
    dots.push({ c, r, tone });
  };

  // Code, each glyph pixel doubled (10×14 dots per letter, 2-dot gaps).
  const S = 2, GAP = 2, X0 = 4, Y0 = 5;
  [...code].forEach((ch, i) => {
    const g = G[ch];
    if (!g) return;
    for (let gy = 0; gy < 7; gy++)
      for (let gx = 0; gx < 5; gx++)
        if (g[gy * 5 + gx] === "#")
          for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) put(X0 + i * (5 * S + GAP) + gx * S + dx, Y0 + gy * S + dy, "lit");
  });

  // Progress row.
  const live = p.status === "IN PROGRESS";
  const len = COVER_COLS - 8;
  const n = Math.max(1, Math.round((Math.min(100, p.completion) / 100) * len));
  for (let i = 0; i < n; i++) put(4 + i, 23, live && i === n - 1 ? "live" : "lit");

  // Faint scatter to the right of the code — unique per project.
  const rand = rng(p.id);
  const codeRight = X0 + code.length * (5 * S + GAP);
  for (let r = 3; r < 21; r++) for (let c = Math.max(codeRight + 1, 30); c < COVER_COLS - 2; c++) if (rand() < 0.07) put(c, r, "soft");

  return { code, dots, marker: { c: COVER_COLS - 5, r: 4, kind: p.type } };
}

/* Standalone SVG markup (for OG images, which can't read CSS variables). */
export function coverSvg(p: Parameters<typeof buildCover>[0], col: { lit: string; live: string; soft: string; grid: string; marker: string }, pitch = 10): string {
  const { dots, marker } = buildCover(p);
  const W = COVER_COLS * pitch, H = COVER_ROWS * pitch, h = pitch / 2;
  const grid: string[] = [];
  for (let r = 0; r < COVER_ROWS; r++) for (let c = 0; c < COVER_COLS; c++) grid.push(`<circle cx="${c * pitch + h}" cy="${r * pitch + h}" r="${pitch * 0.11}" fill="${col.grid}"/>`);
  const lit = dots.map((d) => `<circle cx="${d.c * pitch + h}" cy="${d.r * pitch + h}" r="${pitch * (d.tone === "soft" ? 0.2 : 0.36)}" fill="${d.tone === "live" ? col.live : d.tone === "soft" ? col.soft : col.lit}"/>`);
  const mx = marker.c * pitch + h, my = marker.r * pitch + h;
  const m =
    marker.kind === "main"
      ? `<circle cx="${mx}" cy="${my}" r="${pitch * 0.9}" fill="${col.marker}"/>`
      : marker.kind === "consulting"
        ? `<circle cx="${mx}" cy="${my}" r="${pitch * 0.8}" fill="none" stroke="${col.marker}" stroke-width="${pitch * 0.22}"/>`
        : `<circle cx="${mx}" cy="${my}" r="${pitch * 0.45}" fill="${col.marker}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid.join("")}${lit.join("")}${m}</svg>`;
}
