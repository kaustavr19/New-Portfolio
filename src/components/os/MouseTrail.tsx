"use client";

import { useEffect, useRef } from "react";

const CELL     = 6;    // snap-to-grid size — matches DesktopBg pixel size
const MAX_PX   = 120;  // cap so it never gets heavy

type Pixel = {
  x: number; y: number;
  alpha: number; decay: number;
  r: number; g: number; b: number;
};

export default function MouseTrail() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const pixels     = useRef<Pixel[]>([]);
  const rafRef     = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      if (pixels.current.length >= MAX_PX) return;

      // Snap cursor to pixel grid
      const gx = Math.floor(e.clientX / CELL) * CELL;
      const gy = Math.floor(e.clientY / CELL) * CELL;

      // Spawn 3–5 pixels in a small scatter around the cursor
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const ox = (Math.floor(Math.random() * 7) - 3) * CELL;
        const oy = (Math.floor(Math.random() * 7) - 3) * CELL;

        // Vary hue from deep blue → brand cyan → near-white
        const t = Math.random();
        pixels.current.push({
          x:     gx + ox,
          y:     gy + oy,
          alpha: 0.55 + Math.random() * 0.45,
          decay: 0.032 + Math.random() * 0.038,
          r:     Math.floor(10  + t * 180),
          g:     Math.floor(100 + t * 140),
          b:     Math.floor(210 + t * 45),
        });
      }
    };

    window.addEventListener("mousemove", onMove);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pixels.current = pixels.current.filter((p) => p.alpha > 0.02);

      for (const p of pixels.current) {
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
        // Sharp CELL−1 square — the 1px gap keeps the pixelated grid look
        ctx.fillRect(p.x, p.y, CELL - 1, CELL - 1);
        p.alpha -= p.decay;
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
