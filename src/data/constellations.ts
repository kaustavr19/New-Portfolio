/* ──────────────────────────────────────────────────────────
   Canonical constellations — star coordinates in a normalized
   100×100 box, plus edges connecting them.
   `mag` = visual magnitude approximation; lower = brighter.
   ────────────────────────────────────────────────────────── */

export type Constellation = {
  name: string;
  stars: { x: number; y: number; mag: number }[];
  edges: [number, number][];
};

export const CONSTELLATIONS: Constellation[] = [
  {
    name: "URSA MAJOR",
    stars: [
      { x: 88, y: 35, mag: 2 }, // 0 Dubhe
      { x: 88, y: 70, mag: 2 }, // 1 Merak
      { x: 65, y: 75, mag: 2 }, // 2 Phecda
      { x: 65, y: 40, mag: 3 }, // 3 Megrez
      { x: 50, y: 32, mag: 2 }, // 4 Alioth
      { x: 28, y: 22, mag: 2 }, // 5 Mizar
      { x: 8,  y: 18, mag: 2 }, // 6 Alkaid
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],   // bowl
      [3, 4], [4, 5], [5, 6],            // handle
    ],
  },
  {
    name: "ORION",
    stars: [
      { x: 28, y: 22, mag: 1 }, // 0 Betelgeuse
      { x: 72, y: 28, mag: 2 }, // 1 Bellatrix
      { x: 38, y: 50, mag: 2 }, // 2 Mintaka
      { x: 50, y: 52, mag: 2 }, // 3 Alnilam
      { x: 62, y: 54, mag: 2 }, // 4 Alnitak
      { x: 75, y: 82, mag: 2 }, // 5 Saiph
      { x: 25, y: 80, mag: 1 }, // 6 Rigel
    ],
    edges: [
      [0, 1],          // shoulders
      [0, 2],          // left shoulder → belt
      [1, 4],          // right shoulder → belt
      [2, 3], [3, 4],  // belt
      [2, 6],          // belt left → Rigel
      [4, 5],          // belt right → Saiph
    ],
  },
  {
    name: "CASSIOPEIA",
    stars: [
      { x: 8,  y: 38, mag: 2 },
      { x: 28, y: 70, mag: 2 },
      { x: 50, y: 30, mag: 2 },
      { x: 72, y: 65, mag: 2 },
      { x: 92, y: 40, mag: 2 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: "CYGNUS",
    stars: [
      { x: 50, y: 8,  mag: 1 }, // 0 Deneb
      { x: 50, y: 50, mag: 2 }, // 1 Sadr
      { x: 50, y: 92, mag: 3 }, // 2 Albireo
      { x: 12, y: 58, mag: 2 }, // 3 Gienah
      { x: 88, y: 52, mag: 2 }, // 4 Aljanah
    ],
    edges: [[0, 1], [1, 2], [3, 1], [1, 4]],
  },
  {
    name: "CRUX",
    stars: [
      { x: 50, y: 12, mag: 2 }, // 0 Gacrux
      { x: 50, y: 88, mag: 1 }, // 1 Acrux
      { x: 20, y: 60, mag: 2 }, // 2 Mimosa
      { x: 80, y: 52, mag: 2 }, // 3 Imai
    ],
    edges: [[0, 1], [2, 3]],
  },
  {
    name: "LYRA",
    stars: [
      { x: 50, y: 8,  mag: 1 }, // 0 Vega
      { x: 30, y: 45, mag: 3 }, // 1 Sheliak
      { x: 70, y: 50, mag: 3 }, // 2 Sulafat
      { x: 35, y: 80, mag: 3 }, // 3 Delta Lyrae
      { x: 65, y: 85, mag: 3 }, // 4 Zeta Lyrae
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  },
];
