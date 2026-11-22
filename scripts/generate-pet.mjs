/* ──────────────────────────────────────────────────────────
   KR//OS dock pet — wolf-husky sprite generator.

   Builds every animation frame from simple shapes (body, head,
   legs, tail), then shades and outlines them automatically so all
   frames share one consistent look. The site only ships the output:

     node scripts/generate-pet.mjs
       → src/components/ink/pet/husky-frames.ts

   Each frame is 24 rows of 34 chars. Palette keys (see InkPet.tsx):
     fur  a b c d  (highlight → deep)     white w x y
     ear  p        eye  i (iris) e (glint) q (pupil / nose / lids)
     o    outline   .  transparent
   ────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const W = 34, H = 24;
const RAMP = { fur: "abcd", white: "wxxy", pink: "pppp" };

/* ── geometry helpers ── */
function inEllipse(px, py, e) {
  const dx = px - e.cx, dy = py - e.cy, r = e.rot || 0, c = Math.cos(r), s = Math.sin(r);
  const u = (dx * c + dy * s) / e.rx, v = (-dx * s + dy * c) / e.ry;
  return u * u + v * v <= 1;
}
function segDist(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1, vy = y2 - y1, l = vx * vx + vy * vy || 1;
  let t = ((px - x1) * vx + (py - y1) * vy) / l;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (x1 + t * vx), dy = py - (y1 + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}
function inPoly(px, py, pts) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
const lerp = (a, b, t) => a + (b - a) * t;
function lerpObj(a, b, t) {
  if (typeof a === "number") return lerp(a, b, t);
  if (Array.isArray(a)) return a.map((v, i) => lerpObj(v, b[i], t));
  if (a && typeof a === "object") {
    const o = {};
    for (const k in a) o[k] = k in b ? lerpObj(a[k], b[k], t) : a[k];
    return o;
  }
  return t < 0.5 ? a : b;
}

/* ── layers: a W×H grid of material names; bias darkens far-side parts ── */
function layer(bias = 0) {
  return { m: new Array(W * H).fill(null), bias };
}
function fillRaw(L, test, mat) {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (test(x + 0.5, y + 0.5)) L.m[y * W + x] = typeof mat === "function" ? mat(x + 0.5, y + 0.5) : mat;
}
function recolorRaw(L, test, mat) {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (L.m[i] && test(x + 0.5, y + 0.5)) L.m[i] = mat;
    }
}

const fill = fillRaw, recolor = recolorRaw;

/* ── parts ── */
function legLayer(leg, bias) {
  const L = layer(bias);
  const { hip, knee, paw } = leg;
  fill(L, (x, y) => segDist(x, y, hip[0], hip[1], knee[0], knee[1]) <= 1.15 || segDist(x, y, knee[0], knee[1], paw[0], paw[1]) <= 0.85, "fur");
  fill(L, (x, y) => inEllipse(x, y, { cx: paw[0] + 0.5, cy: paw[1], rx: 1.35, ry: 0.75 }), "white");
  // husky legs: grey up top, white from the knee down (all white when belly-up)
  recolor(L, (x, y) => leg.white || y > Math.min(knee[1], paw[1] - 3) - 0.5, "white");
  return L;
}

function tailLayer(t) {
  const L = layer(0);
  const N = 44;
  for (let i = 0; i <= N; i++) {
    const s = i / N, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s;
    const cx = a * t.p0[0] + b * t.p1[0] + c * t.p2[0], cy = a * t.p0[1] + b * t.p1[1] + c * t.p2[1];
    const r = 0.8 + t.r * Math.sin(Math.PI * Math.min(0.95, 0.1 + s * 0.85));
    fill(L, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, (x, y) => {
      if (s > 0.88) return "white";
      // pale underside: the side of the tail facing away from its curl
      const side = t.under === "down" ? y - cy : t.under === "up" ? cy - y : 0;
      return side > r * 0.35 && s > 0.15 ? "white" : "fur";
    });
  }
  return L;
}

function headLayers(h) {
  const { x: ox, y: oy } = h, back = layer(1), L = layer(0), f = h.flipEar || 0;
  const P = (pts) => pts.map(([x, y]) => [x + ox, y + oy]);
  // tilt the whole head about its centre: sample each pixel in un-tilted head space
  const t = -(h.tilt || 0), ct = Math.cos(t), st = Math.sin(t);
  const R = (x, y) => [ox + (x - ox) * ct - (y - oy) * st, oy + (x - ox) * st + (y - oy) * ct];
  const fill = (Lr, test, mat) => fillRaw(Lr, (x, y) => test(...R(x, y)), typeof mat === "function" ? (x, y) => mat(...R(x, y)) : mat);
  const recolor = (Lr, test, mat) => recolorRaw(Lr, (x, y) => test(...R(x, y)), mat);
  // far ear
  fill(back, (x, y) => inPoly(x, y, P([[-3.3, -1.4], [0.1, -2.7], [-1.9 + f * 0.3, -6.3]])), "fur");
  // cranium, blunt wolfish muzzle, jaw, cheek ruff
  const open = h.mouth ? 1 : 0;
  const snout = P([[0.9, -1.7 - open * 0.5], [7.1, 0.1 - open * 0.9], [7.2, 1.6 - open * 0.9], [1.4, 2.4]]);
  const jaw = P([[1.4, 1.7], [6.4, 1.9 + open * 1.3], [6.0, 2.8 + open * 1.3], [1.0, 3.2]]);
  fill(L, (x, y) => inEllipse(x, y, { cx: ox, cy: oy, rx: 4.1, ry: 3.5 }), "fur");
  fill(L, (x, y) => inPoly(x, y, snout), "fur");
  fill(L, (x, y) => inPoly(x, y, jaw), "white");
  fill(L, (x, y) => inEllipse(x, y, { cx: ox - 1.3, cy: oy + 2.6, rx: 2.7, ry: 1.5 }), "white");
  // the husky mask: white face below the brow, grey cap and a grey bridge down the muzzle
  recolor(L, (x, y) => y > oy - 0.2 && x > ox - 2.6, "white");
  recolor(L, (x, y) => inPoly(x, y, snout) && y < oy - 1.2 + (x - ox) * 0.27 + 0.9, "fur");
  if (h.mouth) fill(L, (x, y) => inPoly(x, y, P([[1.8, 0.8], [6.3, 0.2], [5.9, 3.0], [1.6, 2.0]])), "pink");
  // near ear: shorter and broader than a fox's, pale inside
  fill(L, (x, y) => inPoly(x, y, P([[-0.6 + f, -2.4], [3.3, -2.2], [1.4 + f * 1.2, -6.9]])), "fur");
  fill(L, (x, y) => inPoly(x, y, P([[0.4 + f, -2.7], [2.4, -2.5], [1.4 + f * 1.1, -5.2]])), "pink");
  return { back, L };
}

function headDetails(grid, h) {
  const put = (x, y, ch) => {
    x = Math.floor(x); y = Math.floor(y);
    if (x >= 0 && x < W && y >= 0 && y < H) grid[y * W + x] = ch;
  };
  const t = h.tilt || 0, ct = Math.cos(t), st = Math.sin(t);
  const at = (dx, dy, ch) => put(h.x + dx * ct - dy * st, h.y + dx * st + dy * ct, ch); // head-local → canvas
  const ex = 2.3, ey = -0.6;
  at(ex - 0.4, ey - 1.4, "w"); // brow spot
  if (h.eyes === "closed") {
    at(ex - 1, ey + 0.4, "q"); at(ex, ey + 0.4, "q");
  } else if (h.eyes === "happy") {
    at(ex - 1, ey + 1, "q"); at(ex, ey, "q"); at(ex + 1, ey + 1, "q"); // ^ squint
  } else {
    at(ex - 1, ey, "q"); at(ex, ey, "i"); at(ex, ey + 1, "q"); at(ex - 1, ey + 1, "i");
  }
  at(7.3, h.mouth ? -0.4 : 0.6, "q"); // nose
  at(6.6, h.mouth ? -0.4 : 0.6, "q");
}

/* Shade each layer per column run: top catches light, bottom falls to shadow. */
function shade(L, out) {
  for (let x = 0; x < W; x++) {
    let y = 0;
    while (y < H) {
      if (!L.m[y * W + x]) { y++; continue; }
      const t = y;
      while (y < H && L.m[y * W + x]) y++;
      const b = y - 1, h = b - t + 1;
      for (let yy = t; yy <= b; yy++) {
        const f = (yy - t + 0.5) / h, mat = L.m[yy * W + x];
        let k = h <= 2 ? (yy === t ? 1 : 2) : f < 0.22 ? 0 : f < 0.62 ? 1 : f < 0.86 ? 2 : 3;
        if (k > 0 && x + 1 < W && !L.m[yy * W + x + 1] && f < 0.5) k--; // lit from the front
        k = Math.min(3, k + L.bias);
        out[yy * W + x] = RAMP[mat][k];
        out.owner[yy * W + x] = L;
      }
    }
  }
}

function render(pose) {
  const layers = [];
  const legs = pose.legs.map((l) => ({ l, L: legLayer(l, l.near ? 0 : 1) }));
  const hd = headLayers(pose.head);
  legs.filter((g) => !g.l.near).forEach((g) => layers.push(g.L));
  if (!pose.tailFront) layers.push(tailLayer(pose.tail));
  layers.push(hd.back);
  const body = layer(0);
  fill(body, (x, y) => inEllipse(x, y, pose.body), "fur");
  if (pose.haunch.rx > 0.5) fill(body, (x, y) => inEllipse(x, y, pose.haunch), "fur");
  const n = pose.neck;
  fill(body, (x, y) => segDist(x, y, n[0], n[1], n[2], n[3]) <= n[4], "fur");
  recolor(body, (x, y) => inEllipse(x, y, pose.chest), "white");
  if (pose.belly) recolor(body, (x, y) => (pose.bellyUp ? y < pose.belly(x) : y > pose.belly(x)), "white");
  layers.push(body);
  legs.filter((g) => g.l.near).forEach((g) => layers.push(g.L));
  layers.push(hd.L);
  if (pose.tailFront) layers.push(tailLayer(pose.tail));

  const grid = new Array(W * H).fill(".");
  grid.owner = new Array(W * H).fill(null);
  layers.forEach((L) => shade(L, grid));

  // outer outline
  const out = grid.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (grid[y * W + x] !== ".") continue;
      const touches = [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
        const X = x + dx, Y = y + dy;
        return X >= 0 && Y >= 0 && X < W && Y < H && grid[Y * W + X] !== ".";
      });
      if (touches) out[y * W + x] = "o";
    }
  // soft separation where a nearer part overlaps a farther one
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, L = grid.owner[i];
      if (!L) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1]]) {
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const M = grid.owner[Y * W + X];
        if (M && M !== L && layers.indexOf(M) > layers.indexOf(L) && out[i] !== "o") {
          const ch = out[i], r = Object.values(RAMP).find((s) => s.includes(ch));
          if (r) out[i] = r[Math.min(3, r.indexOf(ch) + 1)];
        }
      }
    }
  headDetails(out, pose.head);
  const rows = [];
  for (let y = 0; y < H; y++) rows.push(out.slice(y * W, y * W + W).join(""));
  return rows;
}

/* ── poses (facing right; the component mirrors for left) ── */
const GROUND = 22.4;

function standPose(p, opts = {}) {
  const bob = opts.walk ? Math.round(Math.abs(Math.sin(p))) * -0.9 : 0;
  const leg = (hx, phase, near, front) => {
    const s = opts.walk ? Math.sin(p + phase) : 0, c = opts.walk ? Math.cos(p + phase) : 0;
    const lift = Math.max(0, s) * 1.8, px = hx + c * 2.4;
    const kx = (hx + px) / 2 + (front ? -lift * 0.9 : lift * 0.9), ky = lerp(14 + bob, GROUND - lift, 0.5);
    return { hip: [hx, 15 + bob], knee: [kx, ky], paw: [px, GROUND - lift], near, front };
  };
  const sway = opts.walk ? Math.sin(p) : 0;
  const cy = 13.4 + bob;
  return {
    body: { cx: 15.6, cy, rx: 7.6, ry: 3.9, rot: -0.04 },
    haunch: { cx: 10, cy: 13, rx: 0.1, ry: 0.1 },
    chest: { cx: 22.0, cy: 14.6 + bob, rx: 3.0, ry: 3.4 },
    belly: (x) => cy + 1.6 - (x - 15) * 0.04,
    neck: [20.4, 12.4 + bob, 22.6, 9.4 + bob, 3.2],
    head: { x: 24.4, y: 7.8 + bob * 0.6, eyes: "open", mouth: 0, flipEar: 0 },
    legs: [leg(9.4, Math.PI, false, false), leg(18.6, 0, false, true), leg(11.2, 0, true, false), leg(20.4, Math.PI, true, true)],
    // sickle tail curled up over the back
    tail: { p0: [9.2, 11.6 + bob], p1: [1.2 + sway * 0.6, 3.2 + bob], p2: [8.4 + sway * 0.8, 4.4 + bob - sway * 0.6], r: 2.3, under: "up" },
    tailFront: false,
  };
}

function sitPose(o = {}) {
  const sw = o.sway || 0;
  return {
    body: { cx: 16.6, cy: 14.2, rx: 3.8, ry: 6.2, rot: -0.42 },
    haunch: { cx: 13.2, cy: 18.2, rx: 5.6, ry: 4.4 },
    chest: { cx: 19.2, cy: 13.8, rx: 2.6, ry: 4.8 },
    belly: null,
    neck: [17.8, 12, 19.2, 9, 3.1],
    head: { x: 20.2 + (o.dx || 0), y: 7.2 + (o.dy || 0), eyes: o.eyes || "open", mouth: o.mouth || 0, flipEar: o.flipEar || 0, tilt: o.tilt || 0 },
    legs: [
      { hip: [18.2, 15], knee: [18.4, 18.5], paw: [18.6, GROUND], near: false, front: true },
      { hip: [19.6, 15], knee: [19.9, 18.5], paw: [20.1, GROUND], near: true, front: true },
      { hip: [13, 19], knee: [14.5, 21], paw: [15.2, GROUND], near: true, front: false },
      { hip: [12, 19], knee: [12.5, 21], paw: [12.2, GROUND], near: false, front: false },
    ],
    tail: { p0: [8.6, 19.0], p1: [8.0, 24.6], p2: [23.6 + sw, 21.6 - Math.abs(sw) * 0.8], r: 2.2, under: "down" },
    tailFront: true,
  };
}

function sleepPose(o = {}) {
  const br = o.breath || 0;
  return {
    body: { cx: 14.8, cy: 18.6 - br * 0.3, rx: 8.6, ry: 4.6 + br * 0.4, rot: 0 },
    haunch: { cx: 9.8, cy: 18.2, rx: 5.6, ry: 4.8 + br * 0.4 },
    chest: { cx: 40, cy: 40, rx: 0.1, ry: 0.1 },
    belly: null,
    neck: [21, 18.5, 22, 18.5, 0.1],
    head: { x: 21.0, y: 17.2 - br * 0.3, eyes: "closed", mouth: 0, flipEar: 0.4 },
    legs: [],
    tail: { p0: [6.6, 20.4], p1: [9, 25.8], p2: [27.4, 21.4], r: 2.5, under: "down" },
    tailFront: true,
  };
}

/* Play bow: chest down, front legs stretched out, rump and tail up. */
function bowPose(o = {}) {
  const wag = o.wag || 0;
  return {
    body: { cx: 15.4, cy: 14.6, rx: 7.6, ry: 3.8, rot: 0.32 },
    haunch: { cx: 10, cy: 13, rx: 0.1, ry: 0.1 },
    chest: { cx: 21.6, cy: 18.2, rx: 3.0, ry: 2.6 },
    belly: (x) => 15.6 + (x - 15) * 0.33,
    neck: [20.6, 16.6, 22.8, 15.2, 3.0],
    head: { x: 24.6, y: 14.4, eyes: "open", mouth: o.mouth || 0, flipEar: 0, tilt: -0.15 },
    legs: [
      { hip: [9.6, 13.2], knee: [9.2, 17.8], paw: [9.0, GROUND], near: false, front: false },
      { hip: [19.6, 18.4], knee: [22.6, 21], paw: [25.6, GROUND], near: false, front: true },
      { hip: [11.2, 13.2], knee: [11.6, 17.8], paw: [11.4, GROUND], near: true, front: false },
      { hip: [20.6, 18.6], knee: [23.8, 21.2], paw: [27.0, GROUND], near: true, front: true },
    ],
    tail: { p0: [8.6, 10.6], p1: [3.0 + wag, 2.0], p2: [9.0 + wag * 1.6, 1.4 - Math.abs(wag) * 0.4], r: 2.2, under: "up" },
    tailFront: false,
  };
}

/* On its back for a belly rub: white belly up, paws in the air. */
function rollPose(o = {}) {
  const k = o.kick || 0;
  return {
    body: { cx: 14.6, cy: 19.2, rx: 8.2, ry: 3.6, rot: 0 },
    haunch: { cx: 10, cy: 13, rx: 0.1, ry: 0.1 },
    chest: { cx: 40, cy: 40, rx: 0.1, ry: 0.1 },
    belly: () => 18.4, // everything above this line is the pale belly (it's upside down)
    bellyUp: true,
    neck: [20.6, 19.6, 22, 19.8, 2.6],
    head: { x: 24.4, y: 18.6, eyes: "happy", mouth: o.mouth || 0, flipEar: 0.6, tilt: 0.5 },
    legs: [
      { hip: [8.0, 17.0], knee: [6.6, 15.0 - k * 0.5], paw: [7.4, 13.6 - k], near: false, front: false, white: true },
      { hip: [19.4, 17.0], knee: [21.0, 15.2 + k * 0.5], paw: [21.6, 14.0 + k], near: false, front: true, white: true },
      { hip: [11.6, 17.2], knee: [11.0, 15.0 + k * 0.5], paw: [12.0, 13.8 + k], near: true, front: false, white: true },
      { hip: [16.4, 17.2], knee: [17.0, 15.0 - k * 0.5], paw: [16.4, 13.6 - k], near: true, front: true, white: true },
    ],
    tail: { p0: [6.8, 20.2], p1: [3.0, 22.6], p2: [0.8, 21.4 - k * 0.8], r: 1.9, under: "up" },
    tailFront: false,
  };
}

/* Moving between perches (dock ↔ windows). All are variations on the stand pose. */
const shift = (pt, dx, dy) => [pt[0] + dx, pt[1] + dy];

/* Crouched to spring, or absorbing a landing: everything low, knees bent. */
function crouchPose() {
  const p = standPose(0);
  p.body = { ...p.body, cy: p.body.cy + 2.2, rot: 0.06 };
  p.chest = { ...p.chest, cy: p.chest.cy + 2.4 };
  const cy = p.body.cy;
  p.belly = (x) => cy + 1.6 - (x - 15) * 0.04;
  p.neck = [20.4, 14.6, 22.6, 12.0, 3.2];
  p.head = { ...p.head, y: p.head.y + 2.8, flipEar: -0.5 };
  p.legs = p.legs.map((l) => ({ ...l, hip: shift(l.hip, 0, 2.2), knee: [l.knee[0] + (l.front ? -1.6 : 1.6), 20.4] }));
  p.tail = { ...p.tail, p0: shift(p.tail.p0, 0, 2.2), p1: shift(p.tail.p1, 1, 4.4), p2: shift(p.tail.p2, -1, 5.4) };
  return p;
}

/* Mid-air: stretched out, front paws reaching, back legs trailing, tail streaming. */
function leapPose() {
  const p = standPose(0);
  p.body = { cx: 15.8, cy: 11.6, rx: 8.2, ry: 3.5, rot: -0.16 };
  p.chest = { cx: 22.4, cy: 11.4, rx: 2.8, ry: 3.0 };
  p.belly = (x) => 12.8 - (x - 15) * 0.16;
  p.neck = [20.8, 10.0, 23.2, 7.2, 3.0];
  p.head = { ...p.head, x: 25.0, y: 6.0, tilt: -0.12, flipEar: -0.8 };
  p.legs = [
    { hip: [9.6, 13.0], knee: [6.4, 15.6], paw: [3.2, 17.4], near: false, front: false },
    { hip: [19.6, 13.0], knee: [23.0, 14.8], paw: [26.4, 15.2], near: false, front: true },
    { hip: [11.2, 13.4], knee: [8.0, 16.4], paw: [4.8, 18.4], near: true, front: false },
    { hip: [20.8, 13.4], knee: [24.2, 15.6], paw: [27.6, 16.2], near: true, front: true },
  ];
  p.tail = { p0: [8.8, 10.4], p1: [4.0, 8.6], p2: [0.6, 8.0], r: 2.2, under: "down" };
  return p;
}

/* Riding a window that's being dragged: low, legs braced wide, ears back. */
function holdPose() {
  const p = crouchPose();
  p.legs = p.legs.map((l) => ({ ...l, paw: [l.paw[0] + (l.front ? 2.2 : -2.2), l.paw[1]], knee: [l.knee[0] + (l.front ? 1.2 : -1.2), l.knee[1]] }));
  p.head = { ...p.head, flipEar: -1.1, eyes: "closed" };
  p.tail = { ...p.tail, p1: shift(p.tail.p1, 2, 2), p2: shift(p.tail.p2, 1, 4) };
  return p;
}

/* Shaking it off after the ride: head and tail whip side to side. */
function shakePose(side) {
  const p = standPose(0);
  p.body = { ...p.body, cx: p.body.cx + side * 0.5 };
  p.head = { ...p.head, tilt: side * 0.35, y: p.head.y + 0.4, eyes: "closed", flipEar: side * 0.8 };
  p.tail = { ...p.tail, p1: shift(p.tail.p1, side * 1.8, 0), p2: shift(p.tail.p2, side * 2.4, -side * 0.6) };
  return p;
}

/* Sit-down frames tween the stand and sit poses. The stand pose has a
   belly function and the sit pose doesn't, so tweens use the stand's. */
const tween = (t) => ({ ...lerpObj(standPose(0), { ...sitPose(), belly: null }, t), belly: null });

function buildFrames() {
  const f = {};
  for (let i = 0; i < 6; i++) f["trot" + i] = render(standPose((i / 6) * Math.PI * 2, { walk: true }));
  f.stand = render(standPose(0));
  f.sitDown1 = render(tween(0.4));
  f.sitDown2 = render(tween(0.75));
  f.sit = render(sitPose());
  f.sitBlink = render(sitPose({ eyes: "closed" }));
  f.sitEar = render(sitPose({ flipEar: -0.8 }));
  f.sitTailL = render(sitPose({ sway: -1.2 }));
  f.sitTailR = render(sitPose({ sway: 1.0 }));
  f.yawn1 = render(sitPose({ eyes: "closed", dy: -0.4, mouth: 0.5 }));
  f.yawn2 = render(sitPose({ eyes: "closed", dy: -0.8, mouth: 1 }));
  // interactions
  f.wagL = render(sitPose({ sway: -1.6, flipEar: 0.3 }));
  f.wagR = render(sitPose({ sway: 1.4, flipEar: 0.3 }));
  f.happy = render(sitPose({ eyes: "happy", sway: 0.8, dy: -0.3 }));
  f.happy2 = render(sitPose({ eyes: "happy", sway: -1.2, dy: -0.3 }));
  f.bow0 = render(bowPose({ wag: -1.2 }));
  f.bow1 = render(bowPose({ wag: 1.2 }));
  f.howl0 = render(sitPose({ eyes: "closed", tilt: -0.45, dy: -0.6, dx: -0.4, mouth: 0.5 }));
  f.howl1 = render(sitPose({ eyes: "closed", tilt: -0.6, dy: -1.0, dx: -0.6, mouth: 1 }));
  f.roll0 = render(rollPose({ kick: 0 }));
  f.roll1 = render(rollPose({ kick: 1, mouth: 1 }));
  // moving between perches
  f.crouch = render(crouchPose());
  f.leap = render(leapPose());
  f.hold = render(holdPose());
  f.shakeL = render(shakePose(-1));
  f.shakeR = render(shakePose(1));
  f.sleep0 = render(sleepPose({ breath: 0 }));
  f.sleep1 = render(sleepPose({ breath: 1 }));
  return f;
}

export const frames = buildFrames();

const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === here) {
  const body = Object.entries(frames)
    .map(([k, rows]) => `  ${k}: [\n${rows.map((r) => `    "${r}",`).join("\n")}\n  ],`)
    .join("\n");
  const ts =
    `/* Generated by scripts/generate-pet.mjs — edit the generator, not this file. */\n\n` +
    `export const PET_W = ${W};\nexport const PET_H = ${H};\n\n` +
    `export const HUSKY_FRAMES = {\n${body}\n} as const;\n\n` +
    `export type HuskyFrame = keyof typeof HUSKY_FRAMES;\n`;
  const out = path.join(path.dirname(here), "..", "src", "components", "ink", "pet", "husky-frames.ts");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, ts);
  console.log(`wrote ${Object.keys(frames).length} frames → ${path.relative(process.cwd(), out)}`);
}
