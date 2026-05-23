/* ──────────────────────────────────────────────────────────
   Shared palette drift logic.
   Both DesktopBg and KROSLogo subscribe to this so the
   wallpaper and the brand mark breathe together.
   ────────────────────────────────────────────────────────── */

/* Normal mode — 3 palette keyframes, 5 stops each (dark → brightest accent) */
export const PALETTES: number[][][] = [
  [[8, 14, 28],  [12, 30, 58], [18, 60, 110], [30, 140, 200], [79, 195, 247]],   // navy
  [[12, 8, 24],  [28, 18, 52], [60, 30, 100], [120, 60, 180], [200, 140, 240]],  // purple
  [[8, 20, 28],  [16, 46, 58], [30, 90, 110], [60, 160, 200], [120, 220, 247]],  // dawn cyan
];

/* Deviant mode — crimson / blood-red / magenta */
export const PALETTES_DEVIANT: number[][][] = [
  [[16, 4, 10],  [38, 8, 22],   [80, 18, 44],   [160, 30, 80],   [255, 60, 140]],   // crimson rose
  [[20, 4, 6],   [50, 8, 14],   [110, 20, 28],  [180, 40, 50],   [255, 80, 100]],   // blood red
  [[18, 4, 18],  [44, 10, 44],  [90, 20, 90],   [170, 40, 160],  [240, 100, 220]],  // magenta dusk
];

export const PALETTE_CYCLE_MS = 90_000;

/* Interpolate to the full 5-stop palette at time ts (ms) */
export function samplePalette(ts: number, deviant = false): number[][] {
  const set = deviant ? PALETTES_DEVIANT : PALETTES;
  const phase = (ts % PALETTE_CYCLE_MS) / PALETTE_CYCLE_MS;
  const segPos = phase * set.length;
  const segIdx = Math.floor(segPos);
  const t = segPos - segIdx;
  const a = set[segIdx];
  const b = set[(segIdx + 1) % set.length];
  return a.map((stop, i) => stop.map((c, ci) => Math.round(c + (b[i][ci] - c) * t)));
}

/* Convenience: return the brightest stop (the accent color) as #rrggbb */
export function sampleAccent(ts: number, deviant = false): string {
  const pal = samplePalette(ts, deviant);
  const [r, g, b] = pal[4];
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
