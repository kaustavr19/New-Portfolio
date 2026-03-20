"use client";

import { useEffect, useRef } from "react";

const CELL = 5;       // pixel cell size (px)
const FPS  = 14;      // low fps = intentional pixel-art choppiness

// Colour stops: index 0 = darkest, 4 = brightest
const PALETTE = [
  [8,  14, 28],   // near-black navy
  [12, 30, 58],   // deep blue
  [18, 60, 110],  // mid blue
  [30, 140, 200], // cyan-blue
  [79, 195, 247], // brand cyan #4fc3f7
];

type Cell = { v: number; target: number; ttl: number };

export default function DesktopBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    const dt = 1000 / FPS;

    let cols = 0, rows = 0;
    let grid: Cell[] = [];

    // Rare "pulse clusters" that ripple brightness out from a point
    const pulses: { cx: number; cy: number; r: number; max: number }[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight - 48; // exclude taskbar
      cols = Math.ceil(canvas.width  / CELL);
      rows = Math.ceil(canvas.height / CELL);
      grid = Array.from({ length: cols * rows }, () => ({
        v:      0,
        target: rnd() < 0.018 ? rnd() * 0.55 : 0,
        ttl:    Math.floor(rnd() * 60),
      }));
    };

    const rnd = () => Math.random();

    const spawnPulse = () => {
      pulses.push({
        cx:  Math.floor(rnd() * cols),
        cy:  Math.floor(rnd() * rows),
        r:   0,
        max: 8 + Math.floor(rnd() * 14),
      });
    };

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < dt) return;
      last = ts;

      // Occasionally spawn a pulse
      if (rnd() < 0.04) spawnPulse();

      // Grow pulses, boost cells they touch
      for (let p = pulses.length - 1; p >= 0; p--) {
        pulses[p].r += 0.9;
        if (pulses[p].r > pulses[p].max) { pulses.splice(p, 1); continue; }
        const { cx, cy, r } = pulses[p];
        const ir = Math.floor(r);
        for (let dy = -ir; dy <= ir; dy++) {
          for (let dx = -ir; dx <= ir; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(dist - r) > 1.2) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const cell = grid[ny * cols + nx];
            cell.target = Math.min(1, cell.target + 0.5);
            cell.ttl    = Math.max(cell.ttl, 8);
          }
        }
      }

      // Draw background
      ctx.fillStyle = "#080d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update + draw each cell
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];

        // Decay TTL, pick new target
        if (--cell.ttl <= 0) {
          cell.target = rnd() < 0.022 ? rnd() * 0.6 : 0;
          cell.ttl    = 12 + Math.floor(rnd() * 50);
        }

        // Ease toward target
        cell.v += (cell.target - cell.v) * 0.18;
        if (cell.v < 0.015) continue;

        // Pick palette colour
        const palIdx = Math.min(PALETTE.length - 1, Math.floor(cell.v * PALETTE.length));
        const [r, g, b] = PALETTE[palIdx];
        const alpha = cell.v * 0.72;

        const x = (i % cols) * CELL;
        const y = Math.floor(i / cols) * CELL;

        // Sharp pixel — no anti-aliasing
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(x, y, CELL - 1, CELL - 1);

        // Occasional bright pixel on top of bright cell
        if (cell.v > 0.75) {
          ctx.fillStyle = `rgba(200,240,255,${(cell.v - 0.75) * 1.2})`;
          ctx.fillRect(x + 1, y + 1, CELL - 3, CELL - 3);
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0, top: 0, left: 0 }}
    />
  );
}
