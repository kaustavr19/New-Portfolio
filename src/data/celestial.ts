/* ──────────────────────────────────────────────────────────
   Real solar-system bodies + named deep-space objects.
   Used by DesktopBg's appearing/disappearing sky layer.
   `radius` is in pixel-grid cells (CELL=5px). `alpha` is target
   visibility when fully faded in.
   ────────────────────────────────────────────────────────── */

export type PlanetName = "SATURN" | "JUPITER" | "MARS" | "NEPTUNE" | "VENUS" | "EARTH" | "MOON";
export type DsoName = "ORION NEBULA" | "PLEIADES" | "ANDROMEDA" | "PINWHEEL" | "CARINA NEBULA" | "HELIX NEBULA";

export type PlanetDef = {
  name: PlanetName;
  radius: number;       // cells
  baseColor: [number, number, number];
  alpha: number;        // base alpha at full visibility
};

export type DsoDef = {
  name: DsoName;
  width: number;        // bounding width in px (approx)
  baseColor: [number, number, number];
  alpha: number;
};

export const PLANETS: PlanetDef[] = [
  { name: "SATURN",  radius: 5, baseColor: [245, 216, 120], alpha: 0.30 },
  { name: "JUPITER", radius: 7, baseColor: [230, 184, 112], alpha: 0.30 },
  { name: "MARS",    radius: 4, baseColor: [201, 90, 58],   alpha: 0.30 },
  { name: "NEPTUNE", radius: 5, baseColor: [64, 96, 216],   alpha: 0.28 },
  { name: "VENUS",   radius: 6, baseColor: [255, 240, 200], alpha: 0.32 },
  { name: "EARTH",   radius: 5, baseColor: [64, 128, 216],  alpha: 0.30 },
  { name: "MOON",    radius: 6, baseColor: [200, 200, 200], alpha: 0.30 },
];

export const DSOS: DsoDef[] = [
  { name: "ORION NEBULA",  width: 110, baseColor: [255, 150, 180], alpha: 0.18 },
  { name: "PLEIADES",      width: 70,  baseColor: [180, 210, 255], alpha: 0.22 },
  { name: "ANDROMEDA",     width: 130, baseColor: [255, 230, 200], alpha: 0.18 },
  { name: "PINWHEEL",      width: 90,  baseColor: [200, 220, 255], alpha: 0.18 },
  { name: "CARINA NEBULA", width: 130, baseColor: [255, 170, 110], alpha: 0.18 },
  { name: "HELIX NEBULA",  width: 90,  baseColor: [150, 240, 200], alpha: 0.18 },
];
