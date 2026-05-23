"use client";

import { useEffect, useRef } from "react";
import { CONSTELLATIONS } from "@/data/constellations";
import { PLANETS, DSOS, PlanetName, DsoName, PlanetDef, DsoDef } from "@/data/celestial";

/* ──────────────────────────────────────────────────────────
   KR//OS Desktop Background
   Layers (back → front):
     · Background fill (palette-drifted)
     · Deep-sky objects (named: Pleiades, Andromeda, etc.) — stationary
     · Planets (named solar-system bodies) — stationary
     · Cell flicker grid ("starfield" noise)
     · Constellation lines + stars + labels (idle)
     · Pop animations + particle bursts
     · Meteors (foreground)
   ────────────────────────────────────────────────────────── */

const CELL = 5;
const FPS  = 14;

/* Palette drift */
const PALETTES: number[][][] = [
  [[8, 14, 28], [12, 30, 58],  [18, 60, 110], [30, 140, 200], [79, 195, 247]],   // navy
  [[12, 8, 24], [28, 18, 52],  [60, 30, 100], [120, 60, 180], [200, 140, 240]],  // purple
  [[8, 20, 28], [16, 46, 58],  [30, 90, 110], [60, 160, 200], [120, 220, 247]],  // dawn cyan
];
const PALETTE_CYCLE_MS = 90_000;

/* Pops */
const POP_RADIUS = 28;
const POP_AUDIO_THROTTLE = 80;
const POP_ANIM_MS = 180;

/* Constellations */
const IDLE_THRESHOLD_MS = 6000;
const CONSTELLATION_TARGET_ALPHA = 0.85;
const CONSTELLATION_LINE_ALPHA = 0.12;
const CONSTELLATION_FADE_SPEED = 0.05;
const CONSTELLATION_SIZE_PX = 240;
const CONSTELLATION_MARGIN = CONSTELLATION_SIZE_PX / 2 + 50; // fits stars + label

/* Generic label timing (used by constellations + sky objects) */
const LABEL_DELAY_MS = 600;
const LABEL_HOLD_MS  = 2200;
const LABEL_FADE_MS  = 700;

/* Meteors */
const STAR_MIN_INTERVAL_MS = 30_000;
const STAR_MAX_INTERVAL_MS = 60_000;

/* Stationary sky objects */
const PLANET_MIN_INTERVAL_MS = 60_000;
const PLANET_MAX_INTERVAL_MS = 120_000;
const DSO_MIN_INTERVAL_MS    = 30_000;
const DSO_MAX_INTERVAL_MS    = 55_000;
const SKY_LIFETIME_MIN_MS    = 18_000;
const SKY_LIFETIME_MAX_MS    = 26_000;
const SKY_FADE_MS            = 3500;

/* ── Types ── */
type Cell = { v: number; target: number; ttl: number };
type Particle = {
  x: number; y: number; vx: number; vy: number;
  alpha: number; decay: number; r: number; g: number; b: number;
};
type Meteor = {
  x: number; y: number; vx: number; vy: number;
  trail: { x: number; y: number; alpha: number }[];
};
type ActiveConstellation = {
  id: number;
  centerX: number; centerY: number;
  scale: number;
  alpha: number; alphaTarget: number;
  ageMs: number;
  twinklePhases: number[];
};
type SkyObject = {
  kind: "planet" | "dso";
  name: PlanetName | DsoName;
  x: number; y: number;
  alpha: number;       // current alpha
  alphaPeak: number;   // target peak alpha
  ageMs: number;
  lifetimeMs: number;
  twinklePhases?: number[]; // for clusters/nebulae with embedded stars
};

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

    /* ── State ── */
    let cols = 0, rows = 0;
    let grid: Cell[] = [];

    const pulses: { cx: number; cy: number; r: number; max: number }[] = [];
    let particles: Particle[] = [];
    const meteors: Meteor[] = [];
    const constellations: ActiveConstellation[] = [];
    const skyObjects: SkyObject[] = [];
    const popAnimations = new Map<number, number>();

    let mouseX = -1, mouseY = -1;
    let lastMouseMove = performance.now();
    let lastPopAudio = 0;

    const now0 = performance.now();
    let nextMeteorTime = now0 + rand(STAR_MIN_INTERVAL_MS, STAR_MAX_INTERVAL_MS);
    let nextPlanetTime = now0 + rand(PLANET_MIN_INTERVAL_MS, PLANET_MAX_INTERVAL_MS) * 0.3;
    let nextDsoTime    = now0 + rand(DSO_MIN_INTERVAL_MS, DSO_MAX_INTERVAL_MS) * 0.4;

    function rand(a: number, b: number) { return a + Math.random() * (b - a); }

    /* ── Font preload (so canvas can use Press Start 2P) ── */
    if (typeof document !== "undefined" && document.fonts && "load" in document.fonts) {
      document.fonts.load("8px 'Press Start 2P'").catch(() => {});
    }

    /* ── Audio ── */
    let audioCtx: AudioContext | null = null;
    const ensureAudio = () => {
      if (!audioCtx) {
        try {
          const AC = window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtx = new AC();
        } catch { return; }
      }
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    };
    const playPop = (intensity: number) => {
      if (!audioCtx || audioCtx.state !== "running") return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      const pitch = 520 + intensity * 600;
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, t + 0.05);
      gain.gain.setValueAtTime(0.022, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    };
    ensureAudio();

    /* ── Resize ── */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight - 48;
      cols = Math.ceil(canvas.width  / CELL);
      rows = Math.ceil(canvas.height / CELL);
      grid = Array.from({ length: cols * rows }, () => ({
        v: 0,
        target: Math.random() < 0.018 ? Math.random() * 0.55 : 0,
        ttl: Math.floor(Math.random() * 60),
      }));
      constellations.length = 0;
      skyObjects.length = 0;
    };

    /* ── Palette ── */
    const samplePalette = (ts: number): number[][] => {
      const phase = (ts % PALETTE_CYCLE_MS) / PALETTE_CYCLE_MS;
      const segPos = phase * PALETTES.length;
      const segIdx = Math.floor(segPos);
      const t = segPos - segIdx;
      const a = PALETTES[segIdx];
      const b = PALETTES[(segIdx + 1) % PALETTES.length];
      return a.map((stop, i) => stop.map((c, ci) => Math.round(c + (b[i][ci] - c) * t)));
    };

    /* ── Label alpha helper (shared by constellations + sky objects) ── */
    const labelAlpha = (ageMs: number) => {
      if (ageMs < LABEL_DELAY_MS) return 0;
      const t = ageMs - LABEL_DELAY_MS;
      if (t < LABEL_FADE_MS) return t / LABEL_FADE_MS;
      if (t < LABEL_FADE_MS + LABEL_HOLD_MS) return 1;
      if (t < LABEL_FADE_MS * 2 + LABEL_HOLD_MS)
        return 1 - (t - LABEL_FADE_MS - LABEL_HOLD_MS) / LABEL_FADE_MS;
      return 0;
    };

    const drawLabel = (text: string, x: number, y: number, alpha: number, color: [number, number, number]) => {
      if (alpha < 0.02) return;
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.85})`;
      ctx.fillText(text, x, y);
    };

    /* ── Spawners ── */
    const spawnPulse = () => {
      let cx: number, cy: number;
      if (mouseX >= 0 && Math.random() < 0.4) {
        const mc = Math.floor(mouseX / CELL);
        const mr = Math.floor(mouseY / CELL);
        cx = Math.max(0, Math.min(cols - 1, mc + Math.floor((Math.random() - 0.5) * 10)));
        cy = Math.max(0, Math.min(rows - 1, mr + Math.floor((Math.random() - 0.5) * 10)));
      } else {
        cx = Math.floor(Math.random() * cols);
        cy = Math.floor(Math.random() * rows);
      }
      pulses.push({ cx, cy, r: 0, max: 8 + Math.floor(Math.random() * 14) });
    };

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      const angle = (Math.random() * 0.25 + 0.18) * Math.PI;
      const speed = 12 + Math.random() * 6;
      const x = fromLeft ? -30 : canvas.width + 30;
      const y = Math.random() * canvas.height * 0.55;
      const vx = (fromLeft ? 1 : -1) * Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      meteors.push({ x, y, vx, vy, trail: [] });
    };

    /* Pick a non-overlapping position for sky objects */
    const pickSkyPos = (radius: number): { x: number; y: number } | null => {
      const margin = radius + 60;
      const minSeparation = radius * 2 + 80;
      for (let tries = 0; tries < 30; tries++) {
        const x = margin + Math.random() * Math.max(1, canvas.width - margin * 2);
        const y = margin + Math.random() * Math.max(1, canvas.height - margin * 2);
        let collides = false;
        for (const o of skyObjects) {
          if (Math.hypot(o.x - x, o.y - y) < minSeparation) { collides = true; break; }
        }
        if (!collides) return { x, y };
      }
      return null;
    };

    const spawnPlanet = () => {
      // Avoid repeating last shown planet
      const used = new Set(skyObjects.filter(o => o.kind === "planet").map(o => o.name));
      const candidates = PLANETS.filter(p => !used.has(p.name));
      if (candidates.length === 0) return;
      const def = candidates[Math.floor(Math.random() * candidates.length)];
      const renderRad = def.radius * CELL + 14; // include some halo padding
      const pos = pickSkyPos(renderRad);
      if (!pos) return;
      skyObjects.push({
        kind: "planet",
        name: def.name,
        x: pos.x, y: pos.y,
        alpha: 0,
        alphaPeak: def.alpha,
        ageMs: 0,
        lifetimeMs: rand(SKY_LIFETIME_MIN_MS, SKY_LIFETIME_MAX_MS),
      });
    };

    const spawnDso = () => {
      const used = new Set(skyObjects.filter(o => o.kind === "dso").map(o => o.name));
      const candidates = DSOS.filter(d => !used.has(d.name));
      if (candidates.length === 0) return;
      const def = candidates[Math.floor(Math.random() * candidates.length)];
      const renderRad = def.width / 2 + 14;
      const pos = pickSkyPos(renderRad);
      if (!pos) return;
      skyObjects.push({
        kind: "dso",
        name: def.name,
        x: pos.x, y: pos.y,
        alpha: 0,
        alphaPeak: def.alpha,
        ageMs: 0,
        lifetimeMs: rand(SKY_LIFETIME_MIN_MS, SKY_LIFETIME_MAX_MS),
        twinklePhases: Array.from({ length: 12 }, () => Math.random() * Math.PI * 2),
      });
    };

    /* ── Constellation spawn ── */
    const spawnConstellations = () => {
      const count = Math.random() < 0.6 ? 2 : 1;
      const placed: { x: number; y: number }[] = [];
      const minSeparation = CONSTELLATION_SIZE_PX * 1.05;
      for (let i = 0; i < count; i++) {
        for (let tries = 0; tries < 25; tries++) {
          const cx = CONSTELLATION_MARGIN + Math.random() * Math.max(1, canvas.width - CONSTELLATION_MARGIN * 2);
          const cy = CONSTELLATION_MARGIN + Math.random() * Math.max(1, canvas.height - CONSTELLATION_MARGIN * 2);
          let collides = false;
          for (const p of placed) if (Math.hypot(p.x - cx, p.y - cy) < minSeparation) { collides = true; break; }
          if (collides) continue;
          const usedIds = new Set(constellations.map(c => c.id));
          const cands = CONSTELLATIONS.map((_, idx) => idx).filter(idx => !usedIds.has(idx));
          if (cands.length === 0) break;
          const id = cands[Math.floor(Math.random() * cands.length)];
          const starCount = CONSTELLATIONS[id].stars.length;
          constellations.push({
            id, centerX: cx, centerY: cy, scale: CONSTELLATION_SIZE_PX,
            alpha: 0, alphaTarget: CONSTELLATION_TARGET_ALPHA,
            ageMs: 0,
            twinklePhases: Array.from({ length: starCount }, () => Math.random() * Math.PI * 2),
          });
          placed.push({ x: cx, y: cy });
          break;
        }
      }
    };

    /* ── Bubble pop ── */
    const tryPop = (ts: number) => {
      if (mouseX < 0 || grid.length === 0) return;
      const cellX = Math.floor(mouseX / CELL);
      const cellY = Math.floor(mouseY / CELL);
      const radCells = Math.ceil(POP_RADIUS / CELL);
      const popped: number[] = [];
      let topIntensity = 0;

      for (let dy = -radCells; dy <= radCells; dy++) {
        for (let dx = -radCells; dx <= radCells; dx++) {
          const cx = cellX + dx;
          const cy = cellY + dy;
          if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
          const idx = cy * cols + cx;
          const cell = grid[idx];
          if (cell.v < 0.5) continue;
          if (popAnimations.has(idx)) continue;
          const px = cx * CELL + CELL / 2;
          const py = cy * CELL + CELL / 2;
          if (Math.hypot(mouseX - px, mouseY - py) > POP_RADIUS) continue;

          topIntensity = Math.max(topIntensity, cell.v);
          popped.push(idx);
          popAnimations.set(idx, POP_ANIM_MS);

          const burstCount = 4 + Math.floor(Math.random() * 3);
          for (let b = 0; b < burstCount; b++) {
            const ang = (b / burstCount) * Math.PI * 2 + Math.random() * 0.6;
            const sp = 0.7 + Math.random() * 1.5;
            particles.push({
              x: px - CELL / 2, y: py - CELL / 2,
              vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
              alpha: 0.9, decay: 0.045 + Math.random() * 0.035,
              r: 200, g: 240, b: 255,
            });
          }
          cell.v = 0; cell.target = 0; cell.ttl = 30;
        }
      }
      if (popped.length > 0 && ts - lastPopAudio > POP_AUDIO_THROTTLE) {
        playPop(topIntensity);
        lastPopAudio = ts;
      }
    };

    /* ──────────────────────────────────────────────────────────
       PLANET RENDERERS
       Each draws a unique pixel-art rendition centered at (cx, cy).
       Alpha multiplies the base colors.
       ────────────────────────────────────────────────────────── */
    const drawCircle = (cx: number, cy: number, rad: number, fillFn: (dx: number, dy: number, dist: number) => string | null) => {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > rad + 0.3) continue;
          const fill = fillFn(dx, dy, dist);
          if (!fill) continue;
          ctx.fillStyle = fill;
          ctx.fillRect(Math.round(cx + dx * CELL), Math.round(cy + dy * CELL), CELL - 1, CELL - 1);
        }
      }
    };

    const drawPlanet = (obj: SkyObject, def: PlanetDef) => {
      const [r, g, b] = def.baseColor;
      const a = obj.alpha;
      const rad = def.radius;

      switch (def.name) {
        case "SATURN": {
          // body
          drawCircle(obj.x, obj.y, rad, (_dx, _dy, dist) => {
            const shade = 1 - dist / (rad * 1.4);
            return `rgba(${r},${g},${b},${a * shade})`;
          });
          // 2 rings
          for (const [rx, ry, alphaMul] of [[2.0, 0.45, 0.7], [2.5, 0.55, 0.55]] as const) {
            const steps = 48;
            for (let i = 0; i < steps; i++) {
              const ang = (i / steps) * Math.PI * 2;
              // Only render front + back arcs (skip ones occluded by body? simple — render all)
              const dx = Math.cos(ang) * rad * rx;
              const dy = Math.sin(ang) * rad * ry;
              ctx.fillStyle = `rgba(${r},${g - 20},${b - 30},${a * alphaMul})`;
              ctx.fillRect(Math.round(obj.x + dx * CELL), Math.round(obj.y + dy * CELL), CELL - 1, CELL - 1);
            }
          }
          break;
        }
        case "JUPITER": {
          drawCircle(obj.x, obj.y, rad, (_dx, dy, dist) => {
            const shade = 1 - dist / (rad * 1.5);
            // horizontal bands at y = -3, -1, 1, 3 (rough)
            let band = 0;
            if (dy === -3 || dy === 3) band = -30;
            else if (dy === -1 || dy === 2) band = -18;
            return `rgba(${r + band},${g + band},${b + band * 1.2},${a * shade})`;
          });
          // tiny red spot
          ctx.fillStyle = `rgba(200,80,60,${a * 0.85})`;
          ctx.fillRect(Math.round(obj.x - 1 * CELL), Math.round(obj.y + 1 * CELL), CELL * 2 - 1, CELL - 1);
          break;
        }
        case "MARS": {
          drawCircle(obj.x, obj.y, rad, (_dx, dy, dist) => {
            const shade = 1 - dist / (rad * 1.4);
            return `rgba(${r},${g},${b},${a * shade})`;
          });
          // polar caps
          ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
          ctx.fillRect(Math.round(obj.x - CELL / 2), Math.round(obj.y - rad * CELL), CELL - 1, CELL - 1);
          ctx.fillRect(Math.round(obj.x - CELL / 2), Math.round(obj.y + (rad - 1) * CELL), CELL - 1, CELL - 1);
          break;
        }
        case "NEPTUNE": {
          drawCircle(obj.x, obj.y, rad, (_dx, _dy, dist) => {
            const shade = 1 - dist / (rad * 1.4);
            return `rgba(${r},${g},${b},${a * shade})`;
          });
          break;
        }
        case "VENUS": {
          // Bright cream, slight glow
          drawCircle(obj.x, obj.y, rad, (_dx, _dy, dist) => {
            const shade = 1 - dist / (rad * 1.7);
            return `rgba(${r},${g},${b},${a * shade * 1.1})`;
          });
          // Inner glow brightness
          ctx.fillStyle = `rgba(255,255,240,${a * 0.6})`;
          ctx.fillRect(Math.round(obj.x - CELL), Math.round(obj.y - CELL), CELL * 2 - 1, CELL * 2 - 1);
          break;
        }
        case "EARTH": {
          // blue ocean base
          drawCircle(obj.x, obj.y, rad, (_dx, _dy, dist) => {
            const shade = 1 - dist / (rad * 1.4);
            return `rgba(${r},${g},${b},${a * shade})`;
          });
          // continents (green patches)
          const greens: [number, number][] = [[-2, -1], [-1, -1], [1, 0], [2, 0], [-1, 2], [0, 2]];
          for (const [dx, dy] of greens) {
            ctx.fillStyle = `rgba(80,180,90,${a * 0.95})`;
            ctx.fillRect(Math.round(obj.x + dx * CELL), Math.round(obj.y + dy * CELL), CELL - 1, CELL - 1);
          }
          // clouds (white smudges)
          ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
          ctx.fillRect(Math.round(obj.x + 0 * CELL), Math.round(obj.y - 2 * CELL), CELL - 1, CELL - 1);
          ctx.fillRect(Math.round(obj.x + 2 * CELL), Math.round(obj.y + 2 * CELL), CELL - 1, CELL - 1);
          break;
        }
        case "MOON": {
          drawCircle(obj.x, obj.y, rad, (_dx, _dy, dist) => {
            const shade = 1 - dist / (rad * 1.4);
            return `rgba(${r},${g},${b},${a * shade})`;
          });
          // Mare (darker spots)
          const mare: [number, number][] = [[-2, -1], [1, -2], [-1, 1], [2, 1], [0, 3]];
          for (const [dx, dy] of mare) {
            ctx.fillStyle = `rgba(120,120,130,${a * 0.85})`;
            ctx.fillRect(Math.round(obj.x + dx * CELL), Math.round(obj.y + dy * CELL), CELL - 1, CELL - 1);
          }
          break;
        }
      }
    };

    /* ──────────────────────────────────────────────────────────
       DEEP-SKY OBJECT RENDERERS
       ────────────────────────────────────────────────────────── */
    const drawDso = (obj: SkyObject, def: DsoDef, ts: number) => {
      const [r, g, b] = def.baseColor;
      const a = obj.alpha;

      const drawRadialGlow = (rad: number, alphaMul: number) => {
        const grad = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, rad);
        grad.addColorStop(0,   `rgba(${r},${g},${b},${a * alphaMul})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${a * alphaMul * 0.45})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(obj.x - rad, obj.y - rad, rad * 2, rad * 2);
      };

      const drawTwinkleStar = (px: number, py: number, baseAlpha: number, idx: number, size = CELL * 1.4) => {
        const twinkle = 0.7 + Math.sin(ts * 0.003 + (obj.twinklePhases?.[idx] ?? 0)) * 0.3;
        ctx.fillStyle = `rgba(230,245,255,${baseAlpha * twinkle})`;
        ctx.fillRect(Math.round(px - size / 2), Math.round(py - size / 2), Math.round(size), Math.round(size));
      };

      switch (def.name) {
        case "ORION NEBULA": {
          // pink/red glow
          drawRadialGlow(def.width / 2, 1.4);
          // 4 trapezium stars in center
          const offsets: [number, number][] = [[-5, -3], [5, -2], [-3, 5], [4, 4]];
          offsets.forEach(([dx, dy], i) => {
            drawTwinkleStar(obj.x + dx, obj.y + dy, a * 4.5, i, CELL * 1.6);
          });
          break;
        }
        case "PLEIADES": {
          // 7-star cluster pattern (rough Pleiades layout, normalized to width)
          const w = def.width;
          const positions: [number, number][] = [
            [-0.30, -0.20],  // Alcyone
            [-0.10,  0.10],  // Atlas
            [ 0.15, -0.05],  // Maia
            [ 0.35,  0.15],  // Electra
            [-0.40,  0.20],  // Merope
            [ 0.05,  0.30],  // Taygeta
            [ 0.30, -0.30],  // Pleione
          ];
          // Faint blue glow halo
          drawRadialGlow(w / 2, 0.5);
          positions.forEach(([fx, fy], i) => {
            const px = obj.x + fx * w;
            const py = obj.y + fy * w;
            // each star has a tiny halo
            ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.6})`;
            ctx.fillRect(Math.round(px - CELL), Math.round(py - CELL), CELL * 2 - 1, CELL * 2 - 1);
            drawTwinkleStar(px, py, a * 4.5, i, CELL * 1.6);
          });
          break;
        }
        case "ANDROMEDA": {
          // Elongated oval at ~30° angle, bright core
          const w = def.width;
          const angle = Math.PI / 6; // 30°
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          // Halo (use multiple offset radial gradients for elongated shape)
          for (let i = -3; i <= 3; i++) {
            const dx = i * 8 * cos;
            const dy = i * 8 * sin;
            const rad = w * 0.35 - Math.abs(i) * 6;
            if (rad <= 0) continue;
            const grad = ctx.createRadialGradient(obj.x + dx, obj.y + dy, 0, obj.x + dx, obj.y + dy, rad);
            const intensity = 1 - Math.abs(i) / 4;
            grad.addColorStop(0,   `rgba(${r},${g},${b},${a * 0.7 * intensity})`);
            grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(obj.x + dx - rad, obj.y + dy - rad, rad * 2, rad * 2);
          }
          // bright core
          ctx.fillStyle = `rgba(255,240,210,${a * 4})`;
          ctx.fillRect(Math.round(obj.x - CELL), Math.round(obj.y - CELL), CELL * 2 - 1, CELL * 2 - 1);
          break;
        }
        case "PINWHEEL": {
          // Two spiral arms
          drawRadialGlow(def.width / 2, 0.45);
          // core
          ctx.fillStyle = `rgba(255,255,255,${a * 4})`;
          ctx.fillRect(Math.round(obj.x - CELL), Math.round(obj.y - CELL), CELL * 2 - 1, CELL * 2 - 1);
          // spirals
          const arms = 2;
          const pointsPerArm = 14;
          const maxR = def.width / 2;
          for (let arm = 0; arm < arms; arm++) {
            for (let p = 0; p < pointsPerArm; p++) {
              const t = p / pointsPerArm;
              const radius = t * maxR;
              const angle = arm * Math.PI + t * Math.PI * 2.5;
              const px = obj.x + Math.cos(angle) * radius;
              const py = obj.y + Math.sin(angle) * radius;
              ctx.fillStyle = `rgba(${r},${g},${b},${a * 2 * (1 - t * 0.5)})`;
              ctx.fillRect(Math.round(px), Math.round(py), CELL - 1, CELL - 1);
            }
          }
          break;
        }
        case "CARINA NEBULA": {
          // Diffuse orange-red, multiple overlapping glows
          drawRadialGlow(def.width / 2, 1.2);
          // secondary smaller glow off-center
          const oldX = obj.x, oldY = obj.y;
          obj.x = oldX + 12; obj.y = oldY - 8;
          drawRadialGlow(def.width / 3, 0.8);
          obj.x = oldX - 10; obj.y = oldY + 10;
          drawRadialGlow(def.width / 3.5, 0.7);
          obj.x = oldX; obj.y = oldY;
          // embedded bright stars
          const embedded: [number, number][] = [[-8, -5], [10, -3], [-5, 8], [6, 7]];
          embedded.forEach(([dx, dy], i) => {
            drawTwinkleStar(obj.x + dx, obj.y + dy, a * 4, i, CELL * 1.4);
          });
          break;
        }
        case "HELIX NEBULA": {
          // Ring/donut shape — render torus as circle of glowing pixels
          const radius = def.width * 0.35;
          const ringThickness = CELL * 1.5;
          const steps = 40;
          // Outer ring
          for (let i = 0; i < steps; i++) {
            const ang = (i / steps) * Math.PI * 2;
            for (let t = -1; t <= 1; t++) {
              const rad = radius + t * ringThickness;
              const px = obj.x + Math.cos(ang) * rad;
              const py = obj.y + Math.sin(ang) * rad;
              const alphaMul = 1 - Math.abs(t) * 0.4;
              ctx.fillStyle = `rgba(${r},${g},${b},${a * 3 * alphaMul})`;
              ctx.fillRect(Math.round(px), Math.round(py), CELL - 1, CELL - 1);
            }
          }
          // Faint pink center
          ctx.fillStyle = `rgba(255,180,200,${a * 1.2})`;
          ctx.fillRect(Math.round(obj.x - CELL), Math.round(obj.y - CELL), CELL * 2 - 1, CELL * 2 - 1);
          break;
        }
      }
    };

    /* ── Constellation draw ── */
    const drawConstellation = (c: ActiveConstellation, palette: number[][], ts: number) => {
      const def = CONSTELLATIONS[c.id];
      const half = c.scale / 2;
      const project = (s: { x: number; y: number }) => ({
        px: c.centerX - half + (s.x / 100) * c.scale,
        py: c.centerY - half + (s.y / 100) * c.scale,
      });

      const lineColor = palette[4] as [number, number, number];
      const lineA = c.alpha * CONSTELLATION_LINE_ALPHA;
      if (lineA > 0.005) {
        ctx.strokeStyle = `rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},${lineA})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const [i, j] of def.edges) {
          const a = project(def.stars[i]);
          const b = project(def.stars[j]);
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
        }
        ctx.stroke();
      }

      for (let i = 0; i < def.stars.length; i++) {
        const s = def.stars[i];
        const { px, py } = project(s);
        const baseSize = s.mag <= 1 ? CELL * 2 : s.mag <= 2 ? CELL * 1.6 : CELL * 1.2;
        const twinkle = 0.85 + Math.sin(ts * 0.003 + c.twinklePhases[i]) * 0.15;
        const starAlpha = c.alpha * twinkle * (s.mag <= 1 ? 1 : s.mag <= 2 ? 0.85 : 0.65);
        ctx.fillStyle = `rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},${starAlpha * 0.25})`;
        ctx.fillRect(Math.round(px - baseSize), Math.round(py - baseSize), Math.round(baseSize * 2), Math.round(baseSize * 2));
        ctx.fillStyle = `rgba(230,245,255,${starAlpha})`;
        ctx.fillRect(Math.round(px - baseSize / 2), Math.round(py - baseSize / 2), Math.round(baseSize), Math.round(baseSize));
      }

      const lA = labelAlpha(c.ageMs) * c.alpha;
      drawLabel(def.name, c.centerX, c.centerY + half + 12, lA, lineColor);
    };

    /* ──────────────────────────────────────────────────────────
       MAIN TICK
       ────────────────────────────────────────────────────────── */
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < dt) return;
      last = ts;

      const palette = samplePalette(ts);

      /* Spawns */
      if (Math.random() < 0.065) spawnPulse(); // ~1.6× more frequent than baseline
      if (ts >= nextMeteorTime) {
        spawnMeteor();
        nextMeteorTime = ts + rand(STAR_MIN_INTERVAL_MS, STAR_MAX_INTERVAL_MS);
      }
      if (ts >= nextPlanetTime && skyObjects.filter(o => o.kind === "planet").length === 0) {
        spawnPlanet();
        nextPlanetTime = ts + rand(PLANET_MIN_INTERVAL_MS, PLANET_MAX_INTERVAL_MS);
      }
      if (ts >= nextDsoTime && skyObjects.filter(o => o.kind === "dso").length < 2) {
        spawnDso();
        nextDsoTime = ts + rand(DSO_MIN_INTERVAL_MS, DSO_MAX_INTERVAL_MS);
      }

      tryPop(ts);

      /* Pulses */
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

      /* Meteors update */
      for (let s = meteors.length - 1; s >= 0; s--) {
        const m = meteors[s];
        m.trail.unshift({ x: m.x, y: m.y, alpha: 1 });
        if (m.trail.length > 8) m.trail.pop();
        m.x += m.vx; m.y += m.vy;
        for (let i = 0; i < m.trail.length; i++) m.trail[i].alpha -= 0.12;
        if (m.x < -50 || m.x > canvas.width + 50 || m.y > canvas.height + 50) meteors.splice(s, 1);
      }

      /* Sky objects update — stationary, just fade in/out + age */
      for (let i = skyObjects.length - 1; i >= 0; i--) {
        const o = skyObjects[i];
        o.ageMs += dt;
        const tIn  = Math.min(1, o.ageMs / SKY_FADE_MS);
        const tOut = Math.min(1, (o.lifetimeMs - o.ageMs) / SKY_FADE_MS);
        const fade = Math.max(0, Math.min(tIn, tOut));
        o.alpha = o.alphaPeak * fade;
        if (o.ageMs >= o.lifetimeMs) skyObjects.splice(i, 1);
      }

      /* Constellations update */
      const idleTime = ts - lastMouseMove;
      const wantConstellations = idleTime > IDLE_THRESHOLD_MS;
      if (wantConstellations && constellations.length === 0) spawnConstellations();
      for (let i = constellations.length - 1; i >= 0; i--) {
        const c = constellations[i];
        c.alphaTarget = wantConstellations ? CONSTELLATION_TARGET_ALPHA : 0;
        c.alpha += (c.alphaTarget - c.alpha) * CONSTELLATION_FADE_SPEED;
        if (wantConstellations) c.ageMs += dt;
        if (!wantConstellations && c.alpha < 0.01) constellations.splice(i, 1);
      }

      /* ────────── DRAW ────────── */
      // Bg
      ctx.fillStyle = `rgb(${palette[0][0]},${palette[0][1]},${palette[0][2]})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // DSOs (behind everything else)
      for (const o of skyObjects) {
        if (o.kind !== "dso") continue;
        const def = DSOS.find(d => d.name === o.name);
        if (def) {
          drawDso(o, def, ts);
          const lA = labelAlpha(o.ageMs);
          if (lA > 0) drawLabel(o.name, o.x, o.y + def.width / 2 + 14, lA * 0.85, def.baseColor);
        }
      }

      // Planets (more prominent, drawn above DSOs but below cells)
      for (const o of skyObjects) {
        if (o.kind !== "planet") continue;
        const def = PLANETS.find(p => p.name === o.name);
        if (def) {
          drawPlanet(o, def);
          const lA = labelAlpha(o.ageMs);
          if (lA > 0) drawLabel(o.name, o.x, o.y + def.radius * CELL + 16, lA * 0.9, def.baseColor);
        }
      }

      // Cells
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        if (popAnimations.has(i)) continue;
        if (--cell.ttl <= 0) {
          cell.target = Math.random() < 0.022 ? Math.random() * 0.6 : 0;
          cell.ttl    = 12 + Math.floor(Math.random() * 50);
        }
        cell.v += (cell.target - cell.v) * 0.18;
        if (cell.v < 0.015) continue;
        const palIdx = Math.min(palette.length - 1, Math.floor(cell.v * palette.length));
        const [r, g, b] = palette[palIdx];
        const alpha = cell.v * 0.72;
        const x = (i % cols) * CELL;
        const y = Math.floor(i / cols) * CELL;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(x, y, CELL - 1, CELL - 1);
        if (cell.v > 0.75) {
          ctx.fillStyle = `rgba(220,245,255,${(cell.v - 0.75) * 1.2})`;
          ctx.fillRect(x + 1, y + 1, CELL - 3, CELL - 3);
        }
      }

      // Constellations
      for (const c of constellations) drawConstellation(c, palette, ts);

      // Pop animations
      for (const [idx, remaining] of popAnimations) {
        const t = remaining / POP_ANIM_MS;
        const scale = 1 + (1 - t) * 1.6;
        const size = CELL * scale;
        const baseX = (idx % cols) * CELL + CELL / 2;
        const baseY = Math.floor(idx / cols) * CELL + CELL / 2;
        ctx.fillStyle = `rgba(220,245,255,${0.85 * t})`;
        ctx.fillRect(Math.round(baseX - size / 2), Math.round(baseY - size / 2), Math.round(size), Math.round(size));
        const next = remaining - dt;
        if (next <= 0) popAnimations.delete(idx);
        else popAnimations.set(idx, next);
      }

      // Particles
      particles = particles.filter(p => p.alpha > 0.02);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${Math.max(0, p.alpha)})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), CELL - 1, CELL - 1);
      }

      // Meteors
      for (const m of meteors) {
        for (let i = 0; i < m.trail.length; i++) {
          const t = m.trail[i];
          if (t.alpha <= 0) continue;
          ctx.fillStyle = `rgba(180,230,255,${t.alpha * 0.7})`;
          ctx.fillRect(Math.round(t.x), Math.round(t.y), CELL - 1, CELL - 1);
        }
        ctx.fillStyle = `rgba(255,255,255,0.95)`;
        ctx.fillRect(Math.round(m.x) - 1, Math.round(m.y) - 1, CELL + 1, CELL + 1);
      }
    };

    /* ── Events ── */
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      lastMouseMove = performance.now();
    };
    const onMouseLeave = () => { mouseX = -1; mouseY = -1; };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", ensureAudio);
    window.addEventListener("keydown", ensureAudio);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", ensureAudio);
      window.removeEventListener("keydown", ensureAudio);
      if (audioCtx) audioCtx.close().catch(() => {});
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
