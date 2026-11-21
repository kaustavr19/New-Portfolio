"use client";

import { useEffect, useRef } from "react";
import { useA11y } from "@/lib/a11y";
import { KROS_MARK_BOX, KROS_MARK_PATH } from "./KrosMark";
import { useWeather, type Weather } from "./useWeather";

/* ──────────────────────────────────────────────────────────
   InkOS wallpaper — a dot grid that behaves like an LED matrix.
   The dots never move: everything (the logo, clouds, birds, rain,
   stars, the cursor lens, ripples) is drawn by changing the size
   and brightness of dots that are already there.

   The scene follows the real Kolkata weather from /api/weather:
   clear days get a dot sun, clouds thicken with cloud cover, rain
   falls in streaks, nights bring a moon, twinkling stars and the
   odd shooting star. Birds cross on dry days.

   Budget: ~30fps, paused while the tab is hidden, slowed when
   windows cover the desktop (`dim`), and a single static frame
   with reduce-motion on. No colour — red stays reserved for state.
   ────────────────────────────────────────────────────────── */

const PITCH = 18;
const BASE_R = 1;
const BASE_A = 0.11;

export type LogoBox = { cx: number; cy: number; size: number } | null;

type Cloud = { x: number; y: number; vx: number; blobs: { dx: number; dy: number; r: number }[]; a: number };
type Ripple = { x: number; y: number; t0: number };
type Bird = { x: number; y: number; vx: number; phase: number; scale: number };
type Streak = { x: number; y: number; vx: number; vy: number; len: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeCloud(w: number, h: number, x?: number, dense = false): Cloud {
  const n = Math.round(rand(4, dense ? 7 : 6));
  const blobs = Array.from({ length: n }, (_, i) => ({
    dx: (i - n / 2) * rand(34, 46) + rand(-10, 10),
    dy: rand(-18, 14) - Math.sin((i / (n - 1)) * Math.PI) * rand(10, 26),
    r: rand(30, 58),
  }));
  return { x: x ?? -220, y: rand(70, h * 0.58), vx: rand(9, 18), blobs, a: rand(0.28, dense ? 0.5 : 0.4) };
}

/* Kolkata-local daylight fallback when the weather call hasn't answered. */
function kolkataIsDay(d = new Date()) {
  const h = (d.getUTCHours() + 5.5) % 24;
  return h >= 6 && h < 18;
}

export default function InkWallpaper({ logo = null, dim = 0 }: { logo?: LogoBox; dim?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { motionReduced } = useA11y();
  const weather = useWeather();
  const dimRef = useRef(dim);
  const weatherRef = useRef<Weather | null>(weather);
  useEffect(() => {
    dimRef.current = dim;
    weatherRef.current = weather;
  }, [dim, weather]);

  useEffect(() => {
    const cvs = ref.current;
    const ctx = cvs?.getContext("2d");
    if (!cvs || !ctx) return;

    let W = 0, H = 0, cols = 0, rows = 0, dpr = 1;
    let logoMask = new Float32Array(0);
    let stars = new Float32Array(0); // per-dot twinkle phase, 0 = not a star
    const base = document.createElement("canvas");
    let clouds: Cloud[] = [];
    let ripples: Ripple[] = [];
    let birds: Bird[] = [];
    let rain: Streak[] = [];
    let shooting: Streak | null = null;
    let nextBird = performance.now() + rand(8_000, 20_000);
    let nextShoot = performance.now() + rand(12_000, 30_000);
    let flashUntil = 0;
    let nextFlash = performance.now() + rand(15_000, 40_000);
    const pointer = { x: -9999, y: -9999, on: false };
    let raf = 0;
    let last = 0;

    const cloudTarget = () => {
      const k = weatherRef.current?.kind;
      return k === "clear" ? 2 : k === "partly" ? 3 : k === "fog" ? 6 : k === "rain" || k === "storm" ? 5 : k === "cloudy" ? 5 : 3;
    };

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cvs.clientWidth;
      H = cvs.clientHeight;
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
      cols = Math.ceil(W / PITCH) + 1;
      rows = Math.ceil(H / PITCH) + 1;

      // Base grid, drawn once.
      base.width = cvs.width;
      base.height = cvs.height;
      const b = base.getContext("2d")!;
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.fillStyle = `rgba(255,255,255,${BASE_A})`;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          b.beginPath();
          b.arc(c * PITCH + PITCH / 2, r * PITCH + PITCH / 2, BASE_R, 0, Math.PI * 2);
          b.fill();
        }

      // Logo mask: rasterise the mark, then sample it at each dot.
      logoMask = new Float32Array(cols * rows);
      if (logo && logo.size > 40) {
        const off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        const o = off.getContext("2d")!;
        const s = logo.size / Math.max(KROS_MARK_BOX.w, KROS_MARK_BOX.h);
        o.translate(logo.cx - (KROS_MARK_BOX.w * s) / 2 - KROS_MARK_BOX.x * s, logo.cy - (KROS_MARK_BOX.h * s) / 2 - KROS_MARK_BOX.y * s);
        o.scale(s, s);
        o.fillStyle = "#fff";
        o.fill(new Path2D(KROS_MARK_PATH));
        const data = o.getImageData(0, 0, W, H).data;
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const x = Math.min(W - 1, c * PITCH + PITCH / 2) | 0;
            const y = Math.min(H - 1, r * PITCH + PITCH / 2) | 0;
            logoMask[r * cols + c] = data[(y * W + x) * 4 + 3] > 120 ? 1 : 0;
          }
      }

      // Night stars: ~2.5% of dots in the upper two thirds.
      stars = new Float32Array(cols * rows);
      for (let r = 0; r < rows * 0.66; r++)
        for (let c = 0; c < cols; c++) if (Math.random() < 0.025) stars[r * cols + c] = rand(0.5, 6.2);

      clouds = Array.from({ length: cloudTarget() }, () => makeCloud(W, H, rand(-100, W)));
    };

    /* Intensity 0..1 for every dot this frame. */
    let I = new Float32Array(0);

    const frame = (now: number, still = false) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.033;
      last = now;
      const t = now / 1000;
      const quiet = 1 - Math.min(1, dimRef.current) * 0.75;
      const wx = weatherRef.current;
      const day = wx ? wx.isDay : kolkataIsDay();
      const kind = wx?.kind ?? "partly";
      const wet = kind === "rain" || kind === "storm";

      if (I.length !== cols * rows) I = new Float32Array(cols * rows);
      else I.fill(0);
      const add = (c: number, r: number, v: number) => {
        if (c < 0 || r < 0 || c >= cols || r >= rows) return;
        const i = r * cols + c;
        I[i] = Math.min(1, I[i] + v);
      };
      /* Light the dots under a point (bilinear spread so motion looks smooth). */
      const splat = (x: number, y: number, v: number) => {
        const gx = (x - PITCH / 2) / PITCH, gy = (y - PITCH / 2) / PITCH;
        const c0 = Math.floor(gx), r0 = Math.floor(gy), fx = gx - c0, fy = gy - r0;
        add(c0, r0, v * (1 - fx) * (1 - fy));
        add(c0 + 1, r0, v * fx * (1 - fy));
        add(c0, r0 + 1, v * (1 - fx) * fy);
        add(c0 + 1, r0 + 1, v * fx * fy);
      };

      // Logo, breathing gently.
      const logoV = 0.42 + (still ? 0 : Math.sin(t * 0.8) * 0.06);
      for (let i = 0; i < logoMask.length; i++) if (logoMask[i]) I[i] += logoV;

      // Sun / moon, upper right of the open area.
      const skyX = logo ? Math.min(W - 260, logo.cx + logo.size * 0.75) : W - Math.min(120, W * 0.18);
      const skyY = 110;
      if (day && (kind === "clear" || kind === "partly")) {
        const R = 56;
        for (let r = Math.floor((skyY - R - 40) / PITCH); r <= (skyY + R + 40) / PITCH; r++)
          for (let c = Math.floor((skyX - R - 40) / PITCH); c <= (skyX + R + 40) / PITCH; c++) {
            const d = Math.hypot(c * PITCH + PITCH / 2 - skyX, r * PITCH + PITCH / 2 - skyY);
            if (d < R) add(c, r, 0.62);
            else if (d < R + 36) add(c, r, 0.16 * (1 - (d - R) / 36) * (0.7 + 0.3 * Math.sin(t * 1.5 - d * 0.08)));
          }
      } else if (!day) {
        // Crescent: a disc with an offset disc taken out, plus a faint halo.
        const R = 64;
        for (let r = Math.floor((skyY - R - 30) / PITCH); r <= (skyY + R + 30) / PITCH; r++)
          for (let c = Math.floor((skyX - R - 30) / PITCH); c <= (skyX + R + 30) / PITCH; c++) {
            const x = c * PITCH + PITCH / 2, y = r * PITCH + PITCH / 2;
            const d = Math.hypot(x - skyX, y - skyY);
            const inBite = Math.hypot(x - skyX - R * 0.62, y - skyY + R * 0.22) < R * 0.78;
            if (d < R && !inBite) add(c, r, 0.62);
            else if (d >= R && d < R + 30) add(c, r, 0.07 * (1 - (d - R) / 30));
          }
        // Stars twinkle (fewer behind cloud cover).
        const starGain = kind === "clear" || kind === "partly" ? 1 : 0.35;
        for (let i = 0; i < stars.length; i++)
          if (stars[i]) {
            const tw = still ? 0.5 : Math.sin(t * (0.6 + stars[i] * 0.35) + stars[i] * 7) * 0.5 + 0.5;
            I[i] += tw * tw * 0.45 * starGain;
          }
      }

      // Slow breathing across the field.
      if (!still) {
        for (let r = 0; r < rows; r += 1)
          for (let c = 0; c < cols; c += 1) {
            const x = c * PITCH, y = r * PITCH;
            const n = Math.sin(x * 0.011 + t * 0.22) * Math.sin(y * 0.014 - t * 0.17) + Math.sin((x + y) * 0.006 + t * 0.1) * 0.5;
            if (n > 0.55) I[r * cols + c] += (n - 0.55) * 0.12 * quiet;
          }
      }

      // Clouds.
      for (const cl of clouds) {
        if (!still) cl.x += cl.vx * dt * (0.5 + 0.5 * quiet);
        const a = cl.a * (day ? 1 : 0.55) * (kind === "fog" ? 0.7 : 1);
        for (const b of cl.blobs) {
          const bx = cl.x + b.dx, by = cl.y + b.dy, R = b.r;
          for (let r = Math.floor((by - R) / PITCH); r <= (by + R) / PITCH; r++)
            for (let c = Math.floor((bx - R) / PITCH); c <= (bx + R) / PITCH; c++) {
              const d = Math.hypot(c * PITCH + PITCH / 2 - bx, r * PITCH + PITCH / 2 - by);
              if (d < R) add(c, r, a * (1 - (d / R) ** 3) * 0.8);
            }
        }
      }
      if (!still) {
        clouds = clouds.filter((c) => c.x < W + 260);
        while (clouds.length < cloudTarget()) clouds.push(makeCloud(W, H, undefined, wet || kind === "cloudy"));
      }

      if (!still) {
        // Rain streaks.
        if (wet) {
          const want = Math.round((kind === "storm" ? 70 : 45) * quiet);
          // When rain starts, scatter it over the whole sky; after that, new drops enter from the top.
          const seeding = rain.length === 0;
          while (rain.length < want) rain.push({ x: rand(-100, W + 100), y: seeding ? rand(-H * 0.3, H) : rand(-H * 0.3, 0), vx: -70, vy: rand(380, 460), len: rand(40, 70) });
          for (const s of rain) {
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            const sp = Math.hypot(s.vx, s.vy);
            for (let k = 0; k <= s.len; k += PITCH / 2) splat(s.x - (s.vx / sp) * k, s.y - (s.vy / sp) * k, 0.75 * (1 - k / s.len));
          }
          rain = rain.filter((s) => s.y - s.len < H);
          if (kind === "storm" && now > nextFlash) {
            flashUntil = now + 110;
            nextFlash = now + rand(15_000, 40_000);
          }
        } else rain = [];

        // Birds — daytime, dry, every so often; a two-frame flap.
        if (day && !wet && now > nextBird && quiet > 0.4) {
          const n = Math.random() < 0.4 ? 2 : 1;
          const fromLeft = Math.random() < 0.6;
          const y = rand(70, H * 0.4);
          for (let k = 0; k < n; k++)
            birds.push({ x: fromLeft ? -60 - k * 70 : W + 60 + k * 70, y: y + k * rand(18, 36), vx: (fromLeft ? 1 : -1) * rand(70, 95), phase: rand(0, 6), scale: rand(0.8, 1.1) });
          nextBird = now + rand(45_000, 90_000);
        }
        for (const b of birds) {
          b.x += b.vx * dt;
          const by = b.y + Math.sin(t * 1.4 + b.phase) * 6;
          const up = Math.sin(t * 7 + b.phase) > 0;
          const span = 30 * b.scale, lift = (up ? -14 : 6) * b.scale;
          for (let k = 0; k <= 1.0001; k += 0.25) {
            splat(b.x - span * k, by + lift * k, 0.85);
            splat(b.x + span * k, by + lift * k, 0.85);
          }
        }
        birds = birds.filter((b) => b.x > -200 && b.x < W + 200);

        // Shooting star — clear nights.
        if (!day && (kind === "clear" || kind === "partly") && !shooting && now > nextShoot) {
          shooting = { x: rand(W * 0.3, W), y: rand(20, H * 0.25), vx: -rand(520, 680), vy: rand(160, 220), len: 120 };
          nextShoot = now + rand(25_000, 60_000);
        }
        if (shooting) {
          shooting.x += shooting.vx * dt;
          shooting.y += shooting.vy * dt;
          const sp = Math.hypot(shooting.vx, shooting.vy);
          for (let k = 0; k <= shooting.len; k += PITCH / 3)
            splat(shooting.x - (shooting.vx / sp) * k, shooting.y - (shooting.vy / sp) * k, 0.9 * (1 - k / shooting.len));
          if (shooting.x < -200 || shooting.y > H) shooting = null;
        }

        // Ripples from clicks and window opens.
        ripples = ripples.filter((rp) => now - rp.t0 < 1300);
        for (const rp of ripples) {
          const age = (now - rp.t0) / 1000;
          const rad = age * 430;
          const fade = 1 - age / 1.3;
          const r0 = Math.floor((rp.y - rad - 30) / PITCH), r1 = Math.ceil((rp.y + rad + 30) / PITCH);
          const c0 = Math.floor((rp.x - rad - 30) / PITCH), c1 = Math.ceil((rp.x + rad + 30) / PITCH);
          for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++)
            for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) {
              const d = Math.hypot(c * PITCH + PITCH / 2 - rp.x, r * PITCH + PITCH / 2 - rp.y);
              const band = Math.exp(-(((d - rad) / 16) ** 2));
              if (band > 0.02) I[r * cols + c] += band * 0.55 * fade;
            }
        }

        // Cursor lens.
        if (pointer.on) {
          const R = 110;
          for (let r = Math.floor((pointer.y - R) / PITCH); r <= (pointer.y + R) / PITCH; r++)
            for (let c = Math.floor((pointer.x - R) / PITCH); c <= (pointer.x + R) / PITCH; c++) {
              const d = Math.hypot(c * PITCH + PITCH / 2 - pointer.x, r * PITCH + PITCH / 2 - pointer.y);
              if (d < R) add(c, r, (1 - d / R) ** 2 * 0.45);
            }
        }
      }

      // Paint: cached base grid, then every lit dot on top.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const flash = now < flashUntil ? 0.22 : 0;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const v = Math.min(1, I[r * cols + c] + flash);
          if (v < 0.015) continue;
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, BASE_A + v * 0.85)})`;
          ctx.beginPath();
          ctx.arc(c * PITCH + PITCH / 2, r * PITCH + PITCH / 2, BASE_R + v * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const interval = dimRef.current > 0.9 ? 1000 / 12 : 1000 / 30;
      if (now - last < interval) return;
      frame(now);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
    };
    const onLeave = () => {
      pointer.on = false;
    };
    const onDown = (e: PointerEvent) => ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    const onRipple = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (d) ripples.push({ x: d.x, y: d.y, t0: performance.now() });
    };
    const onResize = () => {
      layout();
      if (motionReduced) frame(performance.now(), true);
    };

    layout();
    window.addEventListener("resize", onResize);
    if (motionReduced) {
      frame(performance.now(), true);
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onDown);
      document.addEventListener("pointerleave", onLeave);
      window.addEventListener("ink:ripple", onRipple);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("ink:ripple", onRipple);
    };
    // logo geometry and motion preference rebuild the scene; weather/dim are read live via refs
  }, [logo?.cx, logo?.cy, logo?.size, motionReduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reduced motion: repaint the static frame once the weather arrives (sun vs moon).
  useEffect(() => {
    if (motionReduced) window.dispatchEvent(new Event("resize"));
  }, [weather, motionReduced]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0" style={{ width: "100%", height: "100%", display: "block" }} />;
}
