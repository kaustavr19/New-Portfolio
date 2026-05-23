# KR//OS — Portfolio OS v2.077

A game-themed browser OS portfolio built by **Kaustav Roy**, Design Consultant at Fractal. Every section of the portfolio runs as its own "app" inside a simulated desktop environment, each styled after a different video game universe.

---

## Preview

> Click the dirt block on the boot screen to start. Double-click any desktop icon to open an app. The green traffic light toggles between fullscreen and windowed mode.

![KR//OS Desktop](public/preview.png)

---

## App Themes

| App | Game Theme | Description |
|-----|-----------|-------------|
| `About.exe` | Detroit: Become Human | Android profile card with scan animation & deviant mode toggle |
| `Projects/` | GTA V | Mission dossier with star rating and active mission list |
| `Skills.tree` | Cyberpunk 2077 | Attribute tree with colour-coded perk categories |
| `Experience.log` | Red Dead Redemption 2 | Arthur's journal — handwritten paper aesthetic |
| `Contact.wav` | Metal Gear Solid Delta | Codec radio screen with animated waveform |
| `Terminal` | Minecraft | Block-style terminal with easter egg commands |

---

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Animation** — Framer Motion (window open/close, boot phases), CSS transitions (maximize/restore)
- **Canvas** — Custom multi-layer pixel animation (`DesktopBg`)
- **Audio** — Web Audio API synthesis (no audio files — square/sine oscillators for boot chimes and pop sounds)
- **Icons** — [@hackernoon/pixel-icon-library](https://github.com/hackernoon/pixel-icon-library) (pixel-art icon font, CC 4.0)
- **Fonts** — Press Start 2P, Share Tech Mono, Orbitron, Rajdhani, Bebas Neue, Cinzel, Special Elite (Google Fonts)
- **Deployment** — Vercel

---

## Features

### Boot sequence
- **Tap-to-enter splash** — dirt-tiled background, pulsing `CLICK TO BOOT` CTA. Required to unlock the browser AudioContext (per the autoplay policy).
- **Minecraft chunk loader** — 24×14 grid of pixel "chunks" revealing from centre outward over ~2.2 s with light noise/jitter for organic feel. Cells are coloured from a curated mix of terrain tones and app theme accents.
- **Per-chunk audio** — Web Audio synth pops climb in pitch as chunks load (220 Hz → 660 Hz), throttled every 8th chunk. A C-E-G-C arpeggio chime plays on completion.
- **Skip** with `Space`, `Enter`, or `Escape`.
- **Skip-on-refresh** — `sessionStorage` flag skips boot for the rest of the tab session; new tabs / incognito replay it.

### Desktop wallpaper (canvas-based, single 14 fps RAF loop)
The background is a living sky with several layers running on one canvas:

- **Pixel-grid starfield** — 5×5 cells flicker through a palette of colours; brightest cells get a soft inner highlight
- **Cursor-influenced pulses** — ripple-style brightness pulses spawn frequently (40% biased toward the cursor) and propagate outward through the grid
- **Bubble pops** — bright cells within 28 px of the cursor scale up, burst into 4-6 particles, and emit a synthesised pop sound (pitch varies with cell brightness, throttled to 80 ms between sounds)
- **Real constellations** — after 6 s of cursor stillness, 1-2 named constellations (Ursa Major, Orion, Cassiopeia, Cygnus, Crux, Lyra) fade in at random non-overlapping positions. Stars are sized by visual magnitude, twinkle subtly, and a named label briefly appears below each
- **Solar system planets** — every 60-120 s, a real, stationary planet fades in (Saturn with rings, Jupiter with banding and a red spot, Mars with polar caps, Earth with continents and clouds, Neptune, Venus, Moon with mare). Holds ~18-26 s, then fades out
- **Deep-sky objects** — every 30-55 s, a named DSO appears (Orion Nebula, Pleiades, Andromeda, Pinwheel Galaxy, Carina Nebula, Helix Nebula) with distinct pixel-art renderers
- **Meteors** — bright pixel with a fading 8-segment trail streaks diagonally every 30-60 s
- **Palette drift** — full palette lerps across deep navy → midnight purple → dawn cyan on a 90 s loop, so the sky feels temporal rather than static

### Desktop OS shell
- Draggable, resizable windows with macOS-style traffic-light controls (close / minimise / maximise)
- Pixelated mouse trail follows the cursor across the desktop
- Taskbar with live clock, open-app indicators, and a `RESUME.PDF` download button
- KR//OS SVG logo as desktop wallpaper (Detroit-style corner brackets, glow filter)

### About.exe — Detroit: Become Human
- Scanning progress bar on first open → reveals stats
- **Deviant Mode toggle** — sliding pill switch that flips the entire left panel to a `#ff0090` pink colour scheme (background, avatar glow, borders, scan line, text — 0.5 s transitions)

### Contact.wav — MGS Codec
- `◄ CODEC ► FREQ: 140.85 MHz` header with signal strength bars
- Caller portrait updates its label live as you type your callsign
- Animated sine-wave waveform driven by a `useEffect` tick (80 ms interval)
- CRT scanline overlay across the whole window

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
public/
├── Kaustav_Roy_CV.pdf       # Resume served from /Kaustav_Roy_CV.pdf
└── preview.png
src/
├── app/
│   ├── layout.tsx           # Root layout + font imports + pixel-icon CSS
│   └── page.tsx             # Boot gate (sessionStorage) → Desktop
├── components/
│   ├── os/
│   │   ├── Desktop.tsx      # Desktop shell, window manager, icon grid
│   │   ├── DesktopBg.tsx    # Multi-layer canvas (cells / pops / constellations / planets / DSOs / meteors / palette drift)
│   │   ├── MouseTrail.tsx   # Pixelated cursor trail
│   │   ├── BootScreen.tsx   # Tap-to-enter splash + Minecraft chunk loader (Web Audio)
│   │   ├── Window.tsx       # Draggable window with maximize/restore
│   │   ├── Taskbar.tsx      # Bottom bar with clock + resume download
│   │   └── KROSLogo.tsx     # SVG logo component
│   └── apps/
│       ├── AboutApp.tsx
│       ├── ProjectsApp.tsx
│       ├── SkillsApp.tsx
│       ├── ExperienceApp.tsx
│       ├── ContactApp.tsx
│       └── TerminalApp.tsx
└── data/
    ├── content.ts           # Profile, projects, skills, experience, desktop icons
    ├── constellations.ts    # Canonical constellation patterns (stars + edges)
    └── celestial.ts         # Planet + deep-sky object definitions
```

---

## Audio note

All sound is synthesised on the fly via Web Audio API oscillators — no audio assets in the repo. The browser autoplay policy means audio only works after a user gesture, which is why the boot starts with a tap-to-enter splash. If a returning user skips boot via the `sessionStorage` flag, the first click anywhere on the desktop unlocks audio for the pop sounds.

---

## Deployment

Deployed on **Vercel** via the GitHub integration. Push to `master` triggers an automatic production deploy.

---

## Author

**Kaustav Roy** — Design Consultant, Fractal
[linkedin.com/in/kaustavr19](https://linkedin.com/in/kaustavr19) · kaustavkr@gmail.com
