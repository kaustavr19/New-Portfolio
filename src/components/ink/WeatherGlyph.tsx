import type { WeatherKind } from "@/app/api/weather/route";

/* 7×7 dot-matrix weather icons. "#" = lit dot, "." = off. */
const GLYPHS: Record<string, string[]> = {
  sun: ["...#...", ".#...#.", "..###..", "#.###.#", "..###..", ".#...#.", "...#..."],
  moon: ["..###..", ".##....", "##.....", "##.....", "##.....", ".##....", "..###.."],
  partly: ["....#..", "..#.#.#", "...###.", ".####..", "######.", "######.", "......."],
  cloud: [".......", "..##...", ".####..", "######.", "#######", "#######", "......."],
  fog: [".......", "#####..", ".......", ".######", ".......", "#####..", "......."],
  rain: ["..##...", ".####..", "######.", "#######", ".......", "#.#.#.#", ".#.#.#."],
  storm: ["..##...", ".####..", "######.", "#######", "...#...", "..#....", ".#....."],
};

function glyphFor(kind: WeatherKind, isDay: boolean) {
  if (kind === "clear") return isDay ? GLYPHS.sun : GLYPHS.moon;
  if (kind === "partly") return isDay ? GLYPHS.partly : GLYPHS.moon;
  if (kind === "fog") return GLYPHS.fog;
  if (kind === "rain") return GLYPHS.rain;
  if (kind === "storm") return GLYPHS.storm;
  return GLYPHS.cloud;
}

export default function WeatherGlyph({ kind, isDay, size = 22 }: { kind: WeatherKind; isDay: boolean; size?: number }) {
  const rows = glyphFor(kind, isDay);
  const step = size / 7;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (
          <circle key={`${x}-${y}`} cx={x * step + step / 2} cy={y * step + step / 2} r={ch === "#" ? step * 0.42 : step * 0.14} fill="currentColor" opacity={ch === "#" ? 1 : 0.18} />
        )),
      )}
    </svg>
  );
}
