"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useA11y } from "@/lib/a11y";
import { useInkScheme } from "@/lib/theme";
import { useReaderMode } from "@/lib/reader-mode";
import { petBoop, petHowl } from "@/lib/ink-sound";
import { HUSKY_FRAMES, PET_H, PET_W, type HuskyFrame } from "./husky-frames";
import { desiredPerch, getPerch, type Perch } from "./perches";

/* ──────────────────────────────────────────────────────────
   Dock pet — a pixel wolf-husky that lives on top of the InkOS dock
   (desktop) and on top of the Ask bar (phone home screen).

   Desktop ("roam"): the husky follows focus. When a window has been
   focused for a moment it crouches, leaps onto that window's top edge
   and lands; it hops back to the dock when the window closes or
   minimises. It rides along (braced) while the window is dragged and
   shakes itself off afterwards. On a maximised window, whose top edge
   is the top of the screen, it sits inside the title bar instead.

   It trots along the dock, sits down, idles (blinks, ear twitches,
   tail flicks, yawns), turns to face the cursor while sitting, and
   curls up to sleep.

   Interactions:
     hover        stops, sits, faces you and wags (wakes up if asleep)
     click / tap  escalates with quick repeat clicks —
                  1–2: happy squint + hearts · 3: play bow → zoomies ·
                  5: howl ("awoo", with sound if Sound effects is on)
     long-press   rolls over for a belly rub (touch)

   Purely decorative: aria-hidden, never focusable. Off switch is the
   "Dock pet" pref; Reduce motion keeps it sitting still (blinks only).
   Sprites come from scripts/generate-pet.mjs.
   ────────────────────────────────────────────────────────── */

const TICK_MS = 110;
const EDGE = 26; // keep clear of the dock's rounded ends

type Palette = Record<string, string>;
const PALETTES: Record<"light" | "dark", Palette> = {
  dark: {
    o: "#000000",
    a: "#a3abb4", b: "#7a838d", c: "#59616a", d: "#3f454c",
    w: "#ffffff", x: "#eceff2", y: "#cdd3d9",
    p: "#e2c9c4", i: "#7ab2ff", q: "#0d0f12", e: "#ffffff",
  },
  light: {
    o: "#111111",
    a: "#96a0ab", b: "#6c757f", c: "#4b525a", d: "#33383e",
    w: "#ffffff", x: "#eceff2", y: "#cdd3d9",
    p: "#d9c0bb", i: "#4a9bf0", q: "#0d0f12", e: "#ffffff",
  },
};

/* One 1:1 bitmap per frame + scheme, drawn scaled up with smoothing off. */
const spriteCache = new Map<string, HTMLCanvasElement>();
function sprite(frame: HuskyFrame, scheme: "light" | "dark") {
  const key = `${scheme}:${frame}`;
  let c = spriteCache.get(key);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = PET_W;
  c.height = PET_H;
  const ctx = c.getContext("2d")!;
  const pal = PALETTES[scheme];
  HUSKY_FRAMES[frame].forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      ctx.fillStyle = pal[ch] ?? pal.o;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  spriteCache.set(key, c);
  return c;
}

type Mode = "walk" | "sit" | "sleep" | "attend" | "act" | "zoom" | "hop";
type Step = [HuskyFrame, number]; // frame, ticks to hold it
const TROT: HuskyFrame[] = ["trot0", "trot1", "trot2", "trot3", "trot4", "trot5"];
const SIT_DOWN: Step[] = [["stand", 3], ["sitDown1", 2], ["sitDown2", 2], ["sit", 4]];
const STAND_UP: Step[] = [["sitDown2", 2], ["sitDown1", 2], ["stand", 2]];
const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));

type Brain = {
  mode: Mode;
  queue: Step[];
  frame: HuskyFrame;
  hold: number;
  timer: number; // ticks left in the current mode
  tick: number;
  x: number; // left edge, px from the dock's left
  dir: 1 | -1;
  hovered: boolean;
  then?: "zoom"; // what follows the current scripted interaction
  // roaming between perches (desktop only)
  perch: string;
  want?: { id: string; since: number };
  hop?: { phase: "crouch" | "fly" | "land"; target: string; from: [number, number]; to: [number, number]; t0: number; dur: number };
  ride: { riding: boolean; movedAt: number; last?: [number, number] };
};

const SHAKE: Step[] = [["shakeL", 2], ["shakeR", 2], ["shakeL", 2], ["shakeR", 2], ["stand", 2]];
const FOCUS_DELAY_MS = 1500; // a window must stay focused this long before the husky moves to it
const LEAP_HEIGHT = 46;

/* The strip of a perch the husky can stand on, in viewport px.
   bottom = the y its paws rest on; min/max = range for its left edge, relative to left. */
function standArea(p: Perch, w: number) {
  const r = p.el.getBoundingClientRect();
  if (p.kind === "dock") return { left: r.left, bottom: r.top + 3, width: r.width, min: EDGE, max: Math.max(EDGE, r.width - EDGE - w) };
  if (p.maximized) {
    // top edge is the top of the screen: sit inside the title bar, clear of the title and controls
    const min = Math.round(r.width * 0.45);
    return { left: r.left, bottom: r.top + 51, width: r.width, min, max: Math.max(min, r.width - 150 - w) };
  }
  return { left: r.left, bottom: r.top + 2, width: r.width, min: 14, max: Math.max(14, r.width - 14 - w) };
}

const WAG: Step[] = [["wagL", 1], ["wagR", 1]];
const PET: Step[] = [["happy", 2], ["happy2", 2], ["happy", 2], ["happy2", 2], ["happy", 2], ["sit", 1]];
const BOW: Step[] = [["bow0", 2], ["bow1", 2], ["bow0", 2], ["bow1", 2], ["bow0", 2], ["stand", 1]];
const HOWL: Step[] = [["sit", 1], ["howl0", 3], ["howl1", 12], ["howl0", 2], ["sitBlink", 2], ["sit", 2]];
const ROLL: Step[] = [
  ["sitDown2", 2], ["sitDown1", 2],
  ...Array.from({ length: 9 }, (_, i): Step => [i % 2 ? "roll1" : "roll0", 2]),
  ["sitDown1", 2], ["sitDown2", 2], ["sit", 2],
];
const ZOOM_TICKS = 34;

/* Back to idling once a scripted interaction has played out. */
function settle(b: Brain) {
  b.hop = undefined;
  if (b.then === "zoom") {
    b.then = undefined;
    b.mode = "zoom";
    b.timer = ZOOM_TICKS;
    return;
  }
  b.mode = b.hovered ? "attend" : "sit";
  b.timer = rand(55, 95);
}

/* Pick the next few frames. Mirrors the behaviour signed off in the preview. */
function plan(b: Brain, reduced: boolean) {
  if (b.mode === "act") settle(b);
  if (reduced) {
    if (b.mode !== "attend") b.mode = "sit";
    b.queue = Math.random() < 0.06 ? [["sitBlink", 1], ["sit", 1]] : [["sit", 1]];
    return;
  }
  if (b.mode === "attend") {
    b.queue = Math.random() < 0.08 ? [["sitBlink", 1], ...WAG] : [...WAG];
    return;
  }
  if (b.mode === "zoom") {
    if (--b.timer <= 0) {
      b.mode = "sit";
      b.timer = rand(55, 95);
      b.queue = [...SIT_DOWN];
      return;
    }
    b.queue = [[TROT[b.tick % TROT.length], 1]];
    return;
  }
  if (b.mode === "walk") {
    if (--b.timer <= 0) {
      b.mode = "sit";
      b.timer = rand(55, 95);
      b.queue = [...SIT_DOWN];
      return;
    }
    b.queue = [[TROT[b.tick % TROT.length], 1]];
    return;
  }
  if (b.mode === "sit") {
    if (--b.timer <= 0) {
      if (Math.random() < 0.4) {
        b.mode = "sleep";
        b.timer = rand(90, 160);
        b.queue = [["sitDown2", 3], ["sitDown1", 3], ["sleep0", 6]];
      } else {
        b.mode = "walk";
        b.timer = rand(50, 110);
        if (Math.random() < 0.5) b.dir = b.dir === 1 ? -1 : 1;
        b.queue = [...STAND_UP];
      }
      return;
    }
    const r = Math.random();
    if (r < 0.06) b.queue = [["sitBlink", 1], ["sit", 1]];
    else if (r < 0.09) b.queue = [["sitEar", 2], ["sit", 1], ["sitEar", 1]];
    else if (r < 0.13) b.queue = [["sitTailL", 2], ["sit", 1], ["sitTailR", 2], ["sit", 1]];
    else if (r < 0.145) b.queue = [["yawn1", 2], ["yawn2", 6], ["yawn1", 2], ["sitBlink", 1]];
    else b.queue = [["sit", 1]];
    return;
  }
  // asleep
  if (--b.timer <= 0) wake(b);
  else b.queue = [[b.tick % 14 < 7 ? "sleep0" : "sleep1", 1]];
}

function wake(b: Brain) {
  b.mode = b.hovered ? "attend" : "sit";
  b.timer = rand(30, 60);
  b.queue = [["sitDown1", 3], ["sitDown2", 2], ["sitBlink", 2], ["sit", 2]];
}

/* scale: CSS px per sprite pixel (rounded so each sprite pixel lands on whole device pixels). */
/* roam: float above the desktop and move between perches (dock + focused window).
   Without it, the husky stays on its parent element (the phone's Ask bar). */
export default function InkPet({ scale = 2, roam = false }: { scale?: number; roam?: boolean }) {
  const { dockPet, motionReduced, soundEffects } = useA11y();
  const { open: readerOpen } = useReaderMode();
  if (!dockPet || readerOpen) return null;
  return <Husky reduced={motionReduced} sound={soundEffects} scale={scale} roam={roam} />;
}

function Husky({ reduced, sound, scale, roam }: { reduced: boolean; sound: boolean; scale: number; roam: boolean }) {
  const scheme = useInkScheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zRef = useRef<HTMLSpanElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const brain = useRef<Brain>({ mode: "sit", queue: [], frame: "sit", hold: 0, timer: 40, tick: 0, x: -1, dir: 1, hovered: false, perch: "dock", ride: { riding: false, movedAt: 0 } });
  const clicks = useRef({ n: 0, last: 0 });
  const press = useRef<{ timer?: number; fired: boolean }>({ fired: false });
  const mouseX = useRef<number | null>(null);
  const live = useRef({ reduced, scheme, sound });
  // Client-only component (the Ink shell never server-renders), so window is safe here
  const [dpr] = useState(() => window.devicePixelRatio || 1);
  const px = Math.max(1, Math.round(scale * dpr)); // device px per sprite pixel — always whole
  const css = px / dpr;
  const [w, h] = [PET_W * css, PET_H * css];

  useEffect(() => {
    live.current = { reduced, scheme, sound };
  }, [reduced, scheme, sound]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => (mouseX.current = e.clientX);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let id: number | undefined, raf = 0;
    let area = { left: 0, bottom: 0, width: 0, min: EDGE, max: EDGE };
    let lastSprite = "";
    let lastPlaced = 0;

    /* Paint the current frame (only when it changes) and the "z z". */
    const paint = () => {
      const b = brain.current, cv = canvasRef.current;
      if (!cv) return;
      const key = `${b.frame}:${b.dir}:${live.current.scheme}`;
      if (key !== lastSprite) {
        lastSprite = key;
        const ctx = cv.getContext("2d")!;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.imageSmoothingEnabled = false;
        if (b.dir === -1) ctx.setTransform(-1, 0, 0, 1, cv.width, 0);
        ctx.drawImage(sprite(b.frame, live.current.scheme), 0, 0, cv.width, cv.height);
      }
      cv.style.transform = `translateX(${b.x}px)`;
      const z = zRef.current;
      if (z) {
        const asleep = b.mode === "sleep" && b.frame.startsWith("sleep");
        z.textContent = asleep ? (b.tick % 14 < 7 ? "z" : "z z") : "";
        z.style.transform = `translate(${b.x + (b.dir === 1 ? w * 0.72 : w * 0.08)}px, ${8 * css - (b.tick % 14 < 7 ? 0 : 4)}px)`;
      }
    };

    /* Roam mode: pin the wrapper to the current perch (or the leap arc) every frame. */
    const loop = () => {
      raf = requestAnimationFrame(loop);
      place();
    };
    const place = () => {
      const b = brain.current, wrap = wrapRef.current;
      if (!wrap) return;
      const now = performance.now();
      lastPlaced = now;

      if (b.hop?.phase === "fly") {
        const t = Math.min(1, (now - b.hop.t0) / b.hop.dur);
        const target = getPerch(b.hop.target) ?? getPerch("dock");
        if (target) {
          // follow a target that moved mid-leap
          const a = standArea(target, w);
          b.hop.to = [a.left + Math.min(a.max, Math.max(a.min, b.hop.to[0] - a.left)), a.bottom];
          b.hop.target = target.id;
        }
        if (t >= 1) {
          land(target);
          return place(); // snap straight onto the perch this frame
        }
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // ease in-out
        const x = b.hop.from[0] + (b.hop.to[0] - b.hop.from[0]) * e;
        const y = b.hop.from[1] + (b.hop.to[1] - b.hop.from[1]) * e - Math.sin(Math.PI * t) * LEAP_HEIGHT;
        b.x = 0;
        wrap.style.transform = `translate(${x}px, ${y - h}px)`;
        wrap.style.visibility = "visible";
        paint();
        return;
      }

      const p = getPerch(b.perch);
      if (!p) {
        if (!b.hop) wrap.style.visibility = "hidden";
        return;
      }
      area = standArea(p, w);
      wrap.style.visibility = "visible";
      wrap.style.width = `${area.width}px`;
      wrap.style.transform = `translate(${area.left}px, ${area.bottom - h}px)`;

      // Riding a dragged window: brace, then shake it off once it stops
      if (p.kind === "window" && !b.hop) {
        const last = b.ride.last;
        if (last && Math.abs(last[0] - area.left) + Math.abs(last[1] - area.bottom) > 0.5) {
          b.ride.movedAt = now;
          if (!b.ride.riding && !live.current.reduced) {
            b.ride.riding = true;
            b.mode = "act";
            b.queue = [];
            b.hold = 0;
            b.frame = "hold";
            paint();
          }
        } else if (b.ride.riding && now - b.ride.movedAt > 220) {
          b.ride.riding = false;
          b.queue = [...SHAKE];
          b.hold = 0;
        }
        b.ride.last = [area.left, area.bottom];
      } else b.ride.last = undefined;
    };

    const land = (target: Perch | undefined) => {
      const b = brain.current;
      if (!b.hop) return;
      b.perch = target?.id ?? "dock";
      b.x = b.hop.to[0] - (target ? standArea(target, w).left : 0);
      b.hop = { ...b.hop, phase: "land" };
      b.ride = { riding: false, movedAt: 0 };
      b.queue = [["crouch", 2], ["stand", 2], ["sitDown1", 2], ["sitDown2", 2], ["sit", 2]];
      b.hold = 0;
    };

    /* Begin moving to another perch. */
    const leave = (target: Perch) => {
      const b = brain.current;
      b.want = undefined;
      if (live.current.reduced) {
        b.perch = target.id;
        b.x = -1;
        b.mode = "sit";
        b.queue = [["sit", 1]];
        return;
      }
      b.mode = "hop";
      b.then = undefined;
      b.hop = { phase: "crouch", target: target.id, from: [0, 0], to: [0, 0], t0: 0, dur: 0 };
      b.queue = [["stand", 1], ["crouch", 3]];
      b.hold = 0;
    };

    /* Crouch finished: work out the arc and launch. */
    const launch = () => {
      const b = brain.current, hop = b.hop!;
      const target = getPerch(hop.target) ?? getPerch("dock");
      const wrapLeft = area.left;
      const from: [number, number] = [wrapLeft + b.x, area.bottom];
      if (!target) return settle(b);
      const a = standArea(target, w);
      // land on the nearest spot along the target's edge
      const to: [number, number] = [a.left + Math.min(a.max, Math.max(a.min, from[0] - a.left)), a.bottom];
      b.dir = to[0] >= from[0] ? 1 : -1;
      const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
      b.hop = { phase: "fly", target: target.id, from, to, t0: performance.now(), dur: Math.min(720, Math.max(380, dist * 0.9)) };
      b.frame = "leap";
      b.queue = [["leap", 1000]];
      b.hold = 0;
    };

    /* Roam mode: decide whether to move to another perch. */
    const roamStep = () => {
      const b = brain.current, now = performance.now();
      if (b.hop) return;
      const want = desiredPerch();
      if (!want) return;
      const cur = getPerch(b.perch);
      if (!cur) return leave(want); // our window closed or minimised under us
      if (want.id === b.perch) {
        b.want = undefined;
        return;
      }
      if (b.want?.id !== want.id) b.want = { id: want.id, since: now };
      else if (now - b.want.since > FOCUS_DELAY_MS && (b.mode === "sit" || b.mode === "walk") && !b.hovered) leave(want);
    };

    const step = () => {
      const b = brain.current;
      b.tick++;
      // animation frames can be throttled (background iframes, power saving): keep placing anyway
      if (roam && performance.now() - lastPlaced > 250) place();
      if (roam) roamStep();
      if (b.ride.riding) {
        b.frame = "hold";
        paint();
        return;
      }
      if (b.hold > 0) b.hold--;
      else {
        if (!b.queue.length) {
          if (b.mode === "hop" && b.hop?.phase === "crouch") launch();
          else if (b.mode === "hop") settle(b);
          if (!b.queue.length) plan(b, live.current.reduced);
        }
        const [frame, ticks] = b.queue.shift()!;
        b.frame = frame;
        b.hold = ticks - 1;
      }

      // walking along the current perch
      const wrap = wrapRef.current;
      if (!roam && wrap) area = { left: 0, bottom: 0, width: wrap.clientWidth, min: EDGE, max: Math.max(EDGE, wrap.clientWidth - EDGE - w) };
      if (b.hop?.phase !== "fly") {
        if (b.x < 0) b.x = Math.round(area.min + (area.max - area.min) * 0.7);
        if (b.frame.startsWith("trot")) {
          b.x += b.dir * (b.mode === "zoom" ? 4.4 : 1.6) * css;
          if (b.x >= area.max || b.x <= area.min) b.dir = b.dir === 1 ? -1 : 1;
        }
        b.x = Math.min(area.max, Math.max(area.min, b.x)); // the perch may have shrunk
      }

      // While sitting (or being hovered), turn to face the cursor
      const cv = canvasRef.current;
      if (cv && (b.mode === "sit" || b.mode === "attend") && mouseX.current != null) {
        const r = cv.getBoundingClientRect(), cx = r.left + r.width / 2;
        if (Math.abs(mouseX.current - cx) > w * 0.6) b.dir = mouseX.current > cx ? 1 : -1;
      }
      paint();
    };

    const start = () => {
      if (id === undefined && document.visibilityState === "visible") {
        id = window.setInterval(step, TICK_MS);
        if (roam) raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      cancelAnimationFrame(raf);
      id = undefined;
    };
    const onVis = () => (document.visibilityState === "visible" ? start() : stop());

    if (roam) place();
    step();
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [w, h, css, roam]);

  // Reduce motion switched on mid-walk: settle straight into a sit
  useEffect(() => {
    if (!reduced) return;
    const b = brain.current;
    b.mode = "sit";
    b.queue = [["sit", 1]];
  }, [reduced]);

  /* Hearts / "awoo" float up from the husky's head and remove themselves. */
  const burst = (kind: "heart" | "awoo", count = 1) => {
    const fx = fxRef.current, b = brain.current;
    if (!fx) return;
    const headX = b.x + (b.dir === 1 ? w * 0.66 : w * 0.34);
    for (let k = 0; k < count; k++) {
      const el = document.createElement("span");
      el.className = kind === "heart" ? "ink-pet-heart" : "ink-pet-awoo ink-dot";
      if (kind === "awoo") el.textContent = "awoo~";
      el.style.left = `${headX + (kind === "heart" ? (k - (count - 1) / 2) * 9 * css : 0)}px`;
      el.style.animationDelay = `${k * 120}ms`;
      el.addEventListener("animationend", () => el.remove());
      fx.appendChild(el);
    }
  };

  const interrupt = (b: Brain, steps: Step[]) => {
    b.mode = "act";
    b.then = undefined;
    b.queue = [...steps];
    b.hold = 0;
  };

  const onClick = () => {
    if (press.current.fired) {
      press.current.fired = false; // the long-press already handled this tap
      return;
    }
    const b = brain.current, now = performance.now(), c = clicks.current;
    c.n = now - c.last < 1400 ? c.n + 1 : 1;
    c.last = now;
    if (b.mode === "hop" || b.ride.riding) return; // mid-leap or hanging on
    if (b.mode === "sleep") {
      c.n = 0;
      wake(b);
      return;
    }
    if (live.current.reduced) {
      interrupt(b, [["happy", 10], ["sit", 1]]);
      return;
    }
    if (c.n >= 5) {
      c.n = 0;
      interrupt(b, HOWL);
      window.setTimeout(() => burst("awoo"), 3 * TICK_MS);
      if (live.current.sound) petHowl();
    } else if (c.n === 3) {
      // play bow, then zoomies along the dock
      interrupt(b, BOW);
      b.then = "zoom";
    } else {
      interrupt(b, PET);
      burst("heart", c.n === 1 ? 1 : 2);
      if (live.current.sound) petBoop();
    }
  };

  const onPointerEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const b = brain.current;
    b.hovered = true;
    if (b.mode === "hop" || b.ride.riding) return;
    if (b.mode === "sleep") wake(b);
    else if (b.mode === "walk" || b.mode === "zoom") {
      b.mode = "attend";
      b.queue = [...SIT_DOWN];
    } else if (b.mode === "sit") {
      b.mode = "attend";
      b.queue = [["sitEar", 2]];
    }
  };
  const onPointerLeave = (e: ReactPointerEvent) => {
    clearTimeout(press.current.timer);
    if (e.pointerType !== "mouse") return;
    const b = brain.current;
    b.hovered = false;
    if (b.mode === "attend") {
      b.mode = "sit";
      b.timer = rand(40, 80);
    }
  };
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") return;
    press.current.fired = false;
    clearTimeout(press.current.timer);
    press.current.timer = window.setTimeout(() => {
      const b = brain.current;
      if (b.mode === "hop" || b.ride.riding) return;
      press.current.fired = true;
      if (b.mode === "sleep") wake(b);
      interrupt(b, live.current.reduced ? [["roll0", 20], ["sit", 1]] : ROLL);
      burst("heart", 3);
      if (live.current.sound) petBoop();
    }, 550);
  };
  const endPress = () => clearTimeout(press.current.timer);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={
        roam
          ? // above every window (the perched-on window is always the focused, topmost one), below the dock
            { position: "fixed", left: 0, top: 0, height: h, zIndex: 8990, pointerEvents: "none", visibility: "hidden" }
          : { position: "absolute", left: 0, right: 0, bottom: "calc(100% - 3px)", height: h, pointerEvents: "none" }
      }
    >
      <canvas
        ref={canvasRef}
        width={PET_W * px}
        height={PET_H * px}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onContextMenu={(e) => e.preventDefault()}
        style={{ position: "absolute", left: 0, bottom: 0, width: w, height: h, imageRendering: "pixelated", pointerEvents: "auto", cursor: "pointer", touchAction: "manipulation", WebkitTouchCallout: "none", userSelect: "none" }}
      />
      <div ref={fxRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", "--pet-px": `${css}px` } as CSSProperties} />
      <span ref={zRef} className="ink-meta" style={{ position: "absolute", left: 0, top: 0, fontSize: 11, pointerEvents: "none" }} />
    </div>
  );
}
