"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useA11y } from "@/lib/a11y";
import { useInkScheme } from "@/lib/theme";
import { useReaderMode } from "@/lib/reader-mode";
import { petBoop, petHowl } from "@/lib/ink-sound";
import { HUSKY_FRAMES, PET_H, PET_W, type HuskyFrame } from "./husky-frames";

/* ──────────────────────────────────────────────────────────
   Dock pet — a pixel wolf-husky that lives on top of the InkOS dock
   (desktop) and on top of the Ask bar (phone home screen).

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

type Mode = "walk" | "sit" | "sleep" | "attend" | "act" | "zoom";
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
};

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
export default function InkPet({ scale = 2 }: { scale?: number }) {
  const { dockPet, motionReduced, soundEffects } = useA11y();
  const { open: readerOpen } = useReaderMode();
  if (!dockPet || readerOpen) return null;
  return <Husky reduced={motionReduced} sound={soundEffects} scale={scale} />;
}

function Husky({ reduced, sound, scale }: { reduced: boolean; sound: boolean; scale: number }) {
  const scheme = useInkScheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zRef = useRef<HTMLSpanElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const brain = useRef<Brain>({ mode: "sit", queue: [], frame: "sit", hold: 0, timer: 40, tick: 0, x: -1, dir: 1, hovered: false });
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
    let id: number | undefined;

    const draw = () => {
      const b = brain.current, cv = canvasRef.current, wrap = wrapRef.current;
      if (!cv || !wrap) return;
      const span = wrap.clientWidth;
      const min = EDGE, max = Math.max(min, span - EDGE - w);
      if (b.x < 0) b.x = Math.round(min + (max - min) * 0.7);

      if (b.frame.startsWith("trot")) {
        b.x += b.dir * (b.mode === "zoom" ? 4.4 : 1.6) * css;
        if (b.x >= max || b.x <= min) {
          b.x = Math.min(max, Math.max(min, b.x));
          b.dir = b.dir === 1 ? -1 : 1;
        }
      }
      b.x = Math.min(max, Math.max(min, b.x)); // dock may have shrunk

      // While sitting (or being hovered), turn to face the cursor
      if ((b.mode === "sit" || b.mode === "attend") && mouseX.current != null) {
        const r = cv.getBoundingClientRect(), cx = r.left + r.width / 2;
        if (Math.abs(mouseX.current - cx) > w * 0.6) b.dir = mouseX.current > cx ? 1 : -1;
      }

      const ctx = cv.getContext("2d")!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.imageSmoothingEnabled = false;
      if (b.dir === -1) ctx.setTransform(-1, 0, 0, 1, cv.width, 0);
      ctx.drawImage(sprite(b.frame, live.current.scheme), 0, 0, cv.width, cv.height);
      cv.style.transform = `translateX(${b.x}px)`;

      const z = zRef.current;
      if (z) {
        const asleep = b.mode === "sleep" && b.frame.startsWith("sleep");
        z.textContent = asleep ? (b.tick % 14 < 7 ? "z" : "z z") : "";
        z.style.transform = `translate(${b.x + (b.dir === 1 ? w * 0.72 : w * 0.08)}px, ${8 * css - (b.tick % 14 < 7 ? 0 : 4)}px)`;
      }
    };

    const step = () => {
      const b = brain.current;
      b.tick++;
      if (b.hold > 0) b.hold--;
      else {
        if (!b.queue.length) plan(b, live.current.reduced);
        const [frame, ticks] = b.queue.shift()!;
        b.frame = frame;
        b.hold = ticks - 1;
      }
      draw();
    };

    const start = () => {
      if (id === undefined && document.visibilityState === "visible") id = window.setInterval(step, TICK_MS);
    };
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const onVis = () => (document.visibilityState === "visible" ? start() : stop());

    draw();
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [w, css]);

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
      style={{ position: "absolute", left: 0, right: 0, bottom: "calc(100% - 3px)", height: h, pointerEvents: "none" }}
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
