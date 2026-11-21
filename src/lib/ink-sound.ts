"use client";

/* ──────────────────────────────────────────────────────────
   InkOS sound — "mixed": a calm musical ambience under dry,
   mechanical UI sounds. Pure Web Audio, no files (like the rest
   of KR//OS), and original — no imitation of any device's sounds.

   Ambience (gated by the `ambience` pref):
     · bed   — quiet brown-noise room tone + a slow two-note pad,
               brighter by day, lower and darker at night
     · rain  — band-filtered patter + droplets when Kolkata is wet
     · events from the wallpaper: star twinkles (glassy blips),
       birds (two tiny chirps), lightning (a low thump)
   UI (callers check the `soundEffects` pref):
     · open / close / minimise blips, dry relay ticks for toggles,
       a soft "thock" for desktop clicks, a chord when boot is ready

   One AudioContext, created on the first user gesture.
   ────────────────────────────────────────────────────────── */

import type { WeatherKind } from "@/app/api/weather/route";

type Graph = {
  ctx: AudioContext;
  amb: GainNode; // ambience bus
  sfx: GainNode; // UI bus
  space: GainNode; // input to a short feedback delay, for air around blips
  padFilter: BiquadFilterNode;
  rainGain: GainNode;
  noise: AudioBuffer;
  mutes: Record<"room" | "pad" | "rain" | "echo", GainNode>;
  thunderBus: GainNode; // its own, louder channel — thunder should be felt
};

/* ── Sound lab: per-layer switches, for finding what's making a noise ── */
export type SoundLayer = "room" | "pad" | "rain" | "echo" | "droplets" | "stars" | "birds" | "thunder" | "ui";
export const SOUND_LAYERS: { id: SoundLayer; label: string; hint: string }[] = [
  { id: "room", label: "Room tone", hint: "Constant brown-noise bed" },
  { id: "pad", label: "Pad", hint: "Constant two-note chord" },
  { id: "rain", label: "Rain wash", hint: "Constant noise, only when raining" },
  { id: "droplets", label: "Rain droplets", hint: "Tiny clicks, only when raining" },
  { id: "echo", label: "Echo", hint: "Short delay behind blips and chirps" },
  { id: "stars", label: "Star blips", hint: "Night, every few seconds" },
  { id: "birds", label: "Bird chirps", hint: "Day, while a bird crosses" },
  { id: "thunder", label: "Thunder", hint: "Storms, after a flash" },
  { id: "ui", label: "UI sounds", hint: "Blips, ticks and thocks" },
];
const layerOn: Record<SoundLayer, boolean> = { room: true, pad: true, rain: true, echo: true, droplets: true, stars: true, birds: true, thunder: true, ui: true };
const MUTE_LEVEL = { room: 1, pad: 1, rain: 1, echo: 1 };

export function getLayers() {
  return { ...layerOn };
}

export function setLayer(id: SoundLayer, on: boolean) {
  layerOn[id] = on;
  if (g && id in g.mutes) {
    const m = g.mutes[id as keyof Graph["mutes"]];
    m.gain.setTargetAtTime(on ? MUTE_LEVEL[id as keyof typeof MUTE_LEVEL] : 0, g.ctx.currentTime, 0.05);
  }
}

/* Every AudioContext the site opens registers here (on window, so it
   survives hot reloads). The lab lists them and can close strays. */
type Engine = { label: string; ctx: AudioContext };
export function registerAudio(label: string, ctx: AudioContext) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __krosAudio?: Engine[] };
  (w.__krosAudio ??= []).push({ label, ctx });
}
export function audioEngines(): { label: string; state: AudioContextState; current: boolean }[] {
  if (typeof window === "undefined") return [];
  const list = (window as unknown as { __krosAudio?: Engine[] }).__krosAudio ?? [];
  return list.map((e) => ({ label: e.label, state: e.ctx.state, current: e.ctx === g?.ctx }));
}
/* Panic button: silence every engine on the page (Ink's rebuilds on the next sound). */
export function stopAllAudio() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __krosAudio?: Engine[] };
  for (const e of w.__krosAudio ?? []) if (e.ctx.state !== "closed") e.ctx.close().catch(() => {});
  if (dropTimer) clearInterval(dropTimer);
  dropTimer = null;
  g = null;
}

export function closeStrayAudio() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __krosAudio?: Engine[] };
  for (const e of w.__krosAudio ?? []) if (e.ctx !== g?.ctx && e.label.startsWith("InkOS") && e.ctx.state !== "closed") e.ctx.close().catch(() => {});
  w.__krosAudio = (w.__krosAudio ?? []).filter((e) => e.ctx.state !== "closed" || e.ctx === g?.ctx);
}

const AMB_LEVEL = 0.06; // ambience, "very slight"
const SFX_LEVEL = 0.9; // UI sounds are already quiet at the source
const THUNDER_LEVEL = 0.5; // well above the bed: a real event, not texture

let g: Graph | null = null;
let ambienceOn = false;
let weather: { kind: WeatherKind; isDay: boolean } = { kind: "partly", isDay: true };
let dropTimer: ReturnType<typeof setInterval> | null = null;

function noiseBuffer(ctx: AudioContext, seconds: number, brown = false) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

function build(): Graph | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    registerAudio("InkOS ambience + UI", ctx);
    const mute = (id: keyof typeof MUTE_LEVEL) => {
      const m = ctx.createGain();
      m.gain.value = layerOn[id] ? MUTE_LEVEL[id] : 0;
      return m;
    };
    const mutes = { room: mute("room"), pad: mute("pad"), rain: mute("rain"), echo: mute("echo") };

    const amb = ctx.createGain();
    amb.gain.value = 0;
    amb.connect(ctx.destination);
    const sfx = ctx.createGain();
    sfx.gain.value = SFX_LEVEL;
    sfx.connect(ctx.destination);

    // A short, dark feedback delay — gives blips and chirps a little room.
    const space = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.27;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const dark = ctx.createBiquadFilter();
    dark.type = "lowpass";
    dark.frequency.value = 2400;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    space.connect(delay);
    delay.connect(dark).connect(fb).connect(delay);
    dark.connect(wet).connect(mutes.echo).connect(ctx.destination);

    // Room tone: brown noise, low-passed.
    const brown = ctx.createBufferSource();
    brown.buffer = noiseBuffer(ctx, 4, true);
    brown.loop = true;
    const roomLp = ctx.createBiquadFilter();
    roomLp.type = "lowpass";
    roomLp.frequency.value = 300;
    const roomG = ctx.createGain();
    // Kept ~6 dB (perceived) below the pad — air in the room, never hiss.
    roomG.gain.value = 0.1;
    brown.connect(roomLp).connect(roomG).connect(mutes.room).connect(amb);
    brown.start();

    // Pad: A2 + E3 (+ a soft A3), through a slowly breathing low-pass.
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 900;
    padFilter.Q.value = 0.4;
    const padG = ctx.createGain();
    padG.gain.value = 0.3;
    padFilter.connect(padG).connect(mutes.pad).connect(amb);
    for (const [f, type, lvl, det] of [
      [110, "sine", 0.6, -3],
      [164.81, "sine", 0.45, 3],
      [220, "triangle", 0.14, 0],
    ] as [number, OscillatorType, number, number][]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = det;
      const og = ctx.createGain();
      og.gain.value = lvl;
      o.connect(og).connect(padFilter);
      o.start();
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.035;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 260;
    lfo.connect(lfoG).connect(padFilter.frequency);
    lfo.start();

    // Rain: a soft 300 Hz–1.1 kHz wash, silent unless it's raining. Kept out
    // of the 2–4 kHz range where the ear hears noise as harsh hiss; the
    // droplets carry the "rain" texture instead.
    const noise = noiseBuffer(ctx, 2);
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = noise;
    rainSrc.loop = true;
    const rainHp = ctx.createBiquadFilter();
    rainHp.type = "highpass";
    rainHp.frequency.value = 300;
    const rainLp = ctx.createBiquadFilter();
    rainLp.type = "lowpass";
    rainLp.frequency.value = 1100;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainSrc.connect(rainHp).connect(rainLp).connect(rainGain).connect(mutes.rain).connect(amb);
    rainSrc.start();

    const thunderBus = ctx.createGain();
    thunderBus.gain.value = THUNDER_LEVEL;
    thunderBus.connect(ctx.destination);

    return { ctx, amb, sfx, space, padFilter, rainGain, noise, mutes, thunderBus };
  } catch {
    return null;
  }
}

function graph(): Graph | null {
  g ??= build();
  if (g && g.ctx.state === "suspended") g.ctx.resume().catch(() => {});
  return g;
}

function applyWeather() {
  if (!g) return;
  const { ctx, padFilter, rainGain } = g;
  const now = ctx.currentTime;
  padFilter.frequency.setTargetAtTime(weather.isDay ? 1150 : 620, now, 3);
  const wet = weather.kind === "rain" ? 0.07 : weather.kind === "storm" ? 0.12 : 0;
  rainGain.gain.setTargetAtTime(wet, now, 2);
  if (wet && !dropTimer) {
    dropTimer = setInterval(() => {
      if (ambienceOn && layerOn.droplets && Math.random() < (weather.kind === "storm" ? 0.7 : 0.45)) droplet();
    }, 70);
  } else if (!wet && dropTimer) {
    clearInterval(dropTimer);
    dropTimer = null;
  }
}

/* ── Lifecycle (InkAmbientAudio) ── */

export function startInk() {
  graph();
  applyWeather();
  setAmbience(ambienceOn);
}

export function setAmbience(on: boolean) {
  ambienceOn = on;
  if (!g) return;
  g.amb.gain.setTargetAtTime(on ? AMB_LEVEL : 0, g.ctx.currentTime, 0.8);
}

export function setInkWeather(kind: WeatherKind, isDay: boolean) {
  weather = { kind, isDay };
  applyWeather();
}

export function stopInk() {
  if (dropTimer) clearInterval(dropTimer);
  dropTimer = null;
  if (g && g.ctx.state !== "closed") g.ctx.close().catch(() => {});
  g = null;
}

/* ── Building blocks ── */

function blip(freq: number, opts: { at?: number; dur?: number; peak?: number; type?: OscillatorType; to?: number; bus?: "amb" | "sfx"; space?: number } = {}) {
  const gr = g;
  if (!gr) return;
  const { ctx } = gr;
  const t = ctx.currentTime + (opts.at ?? 0);
  const dur = opts.dur ?? 0.08;
  const o = ctx.createOscillator();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(opts.peak ?? 0.05, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(env).connect(opts.bus === "amb" ? gr.amb : gr.sfx);
  if (opts.space) {
    // Echo send at the bus's own level, so ambient blips stay as quiet as the bed.
    const s = ctx.createGain();
    s.gain.value = opts.space * (opts.bus === "amb" ? (ambienceOn ? AMB_LEVEL : 0) : SFX_LEVEL);
    env.connect(s).connect(gr.space);
  }
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noiseHit(opts: { at?: number; dur: number; peak: number; type: BiquadFilterType; freq: number; q?: number; bus?: "amb" | "sfx" | "thunder"; attack?: number }) {
  const gr = g;
  if (!gr) return;
  const { ctx } = gr;
  const t = ctx.currentTime + (opts.at ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = gr.noise;
  const f = ctx.createBiquadFilter();
  f.type = opts.type;
  f.frequency.value = opts.freq;
  f.Q.value = opts.q ?? 1;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(opts.peak, t + (opts.attack ?? 0.003));
  env.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
  src.connect(f).connect(env).connect(opts.bus === "amb" ? gr.amb : opts.bus === "thunder" ? gr.thunderBus : gr.sfx);
  src.start(t, Math.random() * 1.5);
  src.stop(t + opts.dur + 0.05);
}

/* ── Ambient events (from the wallpaper) ── */

// A major pentatonic, two octaves up — never a wrong note.
const STAR_NOTES = [880, 987.77, 1108.73, 1318.51, 1479.98, 1760];

export function starTwinkle(force = false) {
  if (!g || (!force && (!ambienceOn || !layerOn.stars))) return;
  const f = STAR_NOTES[Math.floor(Math.random() * STAR_NOTES.length)];
  blip(f, { dur: 1.6, peak: 0.32, bus: "amb", space: 0.8 });
  blip(f * 2, { dur: 0.6, peak: 0.06, bus: "amb" });
}

export function birdChirp(force = false) {
  if (!g || (!force && (!ambienceOn || !layerOn.birds))) return;
  const base = 2500 + Math.random() * 600;
  blip(base, { dur: 0.05, peak: 0.22, to: base * 1.35, bus: "amb", space: 0.4 });
  blip(base * 1.05, { at: 0.09, dur: 0.06, peak: 0.18, to: base * 1.45, bus: "amb", space: 0.4 });
}

export function thunder(force = false) {
  if (!g || (!force && (!ambienceOn || !layerOn.thunder))) return;
  // Light travels faster: the sound lands a beat after the flash.
  const d = 0.25 + Math.random() * 0.6;
  // Crack — a bright tearing snap.
  noiseHit({ at: d, dur: 0.35, peak: 0.45, type: "bandpass", freq: 1400, q: 0.7, bus: "thunder" });
  noiseHit({ at: d + 0.02, dur: 0.6, peak: 0.35, type: "bandpass", freq: 600, q: 0.6, bus: "thunder" });
  // Rumble — rolls for a few seconds in a few uneven waves, low enough to
  // feel but up to ~400 Hz so laptop and phone speakers can play it.
  const waves = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < waves; i++) {
    const at = d + 0.08 + i * (0.35 + Math.random() * 0.45);
    noiseHit({ at, dur: 1.6 + Math.random() * 1.4, peak: 0.9 - i * 0.12, type: "lowpass", freq: 260 + Math.random() * 160, q: 0.9, bus: "thunder", attack: 0.12 });
  }
}

function droplet() {
  const f = 2200 + Math.random() * 2400;
  blip(f, { dur: 0.018, peak: 0.05, to: f * 0.7, bus: "amb" });
}

/* ── UI sounds (callers check the soundEffects pref) ── */

export function uiOpen() {
  if (!layerOn.ui || !graph()) return;
  blip(660, { dur: 0.05, peak: 0.045, space: 0.3 });
  blip(990, { at: 0.06, dur: 0.07, peak: 0.04, space: 0.3 });
}

export function uiClose() {
  if (!layerOn.ui || !graph()) return;
  blip(560, { dur: 0.08, peak: 0.04, to: 380 });
}

/* Dry relay tick — toggles, tabs, dock chips, minimise. */
export function uiTick() {
  if (!layerOn.ui || !graph()) return;
  noiseHit({ dur: 0.012, peak: 0.07, type: "bandpass", freq: 3200, q: 2 });
  blip(140, { dur: 0.018, peak: 0.05 });
}

/* Soft glass "thock" — a click on the empty desktop. */
export function uiThock() {
  if (!layerOn.ui || !graph()) return;
  blip(240, { dur: 0.12, peak: 0.05, to: 150, space: 0.25 });
  noiseHit({ dur: 0.01, peak: 0.04, type: "highpass", freq: 4000 });
}

/* Boot is ready — a soft A-major chord. */
export function uiReady() {
  if (!layerOn.ui || !graph()) return;
  [440, 554.37, 659.25, 880].forEach((f, i) => blip(f, { at: i * 0.035, dur: 1.8, peak: 0.03, space: 0.5 }));
}
