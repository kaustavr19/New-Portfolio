# KR//OS — Portfolio OS v2.077

A game-themed browser OS portfolio built by **Kaustav Roy**, Design Consultant at Fractal. Every section of the portfolio runs as its own "app" inside a simulated desktop environment, each styled after a different video game universe.

---

## Preview

> **Desktop (≥768px):** click the dirt block on the boot screen to start. Single-click any desktop icon to open an app. The green traffic light toggles between fullscreen and windowed mode.
>
> **Mobile (<768px):** the desktop windowing shell is replaced by a phone OS — lock screen → home grid → full-screen apps. Drag a finger across the wallpaper to pop pixel cells.

![KR//OS Desktop](public/preview.png)

---

## App Themes

| App | Game Theme | Description |
|-----|-----------|-------------|
| `About.exe` | Detroit: Become Human | Android profile card with scan animation, Google I/O 2024 ribbon, full deviant-mode rewrite |
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
- **State** — React Context for global preferences (Accessibility, Deviant Mode) with `localStorage` persistence
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
- **Deviant-aware copy** — when Deviant Mode is on, the boot title becomes `KR//DEVIANT`, the CTA becomes `BREAK PROTOCOL`, and the status arc shifts to a Detroit voice ("Initializing programming…" → "DEVIANT.").

### Desktop wallpaper (canvas-based, single 14 fps RAF loop)
A living sky with several layers running on one canvas:

- **Pixel-grid starfield** — 5×5 cells flicker through a palette of colours; brightest cells get a soft inner highlight
- **Cursor-influenced pulses** — ripple-style brightness pulses spawn frequently (40% biased toward the cursor) and propagate outward through the grid
- **Bubble pops** — bright cells within 28 px of the cursor scale up, burst into 4-6 particles, and emit a synthesised pop sound (pitch varies with cell brightness, throttled to 80 ms between sounds)
- **Real constellations** — after 6 s of cursor stillness, 1-2 named constellations (Ursa Major, Orion, Cassiopeia, Cygnus, Crux, Lyra) fade in at random non-overlapping positions. Stars are sized by visual magnitude, twinkle subtly, and a named label briefly appears below each
- **Solar system planets** — every 60-120 s, a real, stationary planet fades in (Saturn with rings, Jupiter with banding and a red spot, Mars with polar caps, Earth with continents and clouds, Neptune, Venus, Moon with mare). Holds ~18-26 s, then fades out
- **Deep-sky objects** — every 30-55 s, a named DSO appears (Orion Nebula, Pleiades, Andromeda, Pinwheel Galaxy, Carina Nebula, Helix Nebula) with distinct pixel-art renderers
- **Meteors** — bright pixel with a fading 8-segment trail streaks diagonally every 30-60 s
- **Palette drift** — full palette lerps across deep navy → midnight purple → dawn cyan on a 90 s loop. The KR//OS logo subscribes to the same cycle so the brand mark breathes with the sky.
- **Deviant palette swap** — when Deviant Mode is on, the entire palette cycle locks to a deviant set (crimson rose → blood red → magenta dusk). Pulses, sky objects, constellations, and the logo all flip with it.

### Desktop OS shell
- Draggable, resizable windows with macOS-style traffic-light controls (close / minimise / maximise)
- **Pixel-card icons** — desktop icons sit on solid dark cards with accent-tinted 1px borders, accent-coloured drop-shadow glow, and 4-direction 1px black outlines on labels for readability against any background state
- **Single-click to open** any desktop app
- Pixelated mouse trail follows the cursor across the desktop
- Taskbar with live clock, open-app indicators, `RESUME.PDF` download button, Deviant Mode toggle, and the Accessibility menu

### Accessibility menu
A taskbar popover (`hn-glasses` icon) with three pill-switch toggles, all persisted in `localStorage`:

- **Reduce Motion** — disables wallpaper effects, particles, constellations, sky objects, meteors, mouse trail, and window animations. Auto-respects `prefers-reduced-motion` on first visit. Boot screen skips entirely.
- **Mute Audio** — silences boot pops/chime and bubble-pop sounds.
- **High Contrast** — brightens icon labels, bolds them, and adds a solid black pill behind each.

In Deviant Mode the menu and its options pick up Detroit language ("DEVIANT PROTOCOLS", "DAMPEN VISUAL FEED", "MUTE AUDITORY INPUT", "AMPLIFY SIGNAL", "OVERRIDES PERSISTED").

### Deviant Mode (holistic)
What started as a Detroit-themed colour flip inside `About.exe` is now a **site-wide narrative state**:

- **Wallpaper palette** swaps to crimson/red/magenta
- **Global magenta wash** overlay fades in across the viewport
- **Logo (`KROSLogo`)** transforms: `//OS → //DEVIANT`, `v2.077 → BARRIER BROKEN`, thicker corner brackets, a pulsing ⚠ warning glyph, and an occasional glitch-slice flicker on the `KR` wordmark
- **OS chrome relabels** in Detroit voice: `About.exe → MEMORY_BANK.exe`, `Projects/ → MISSIONS/`, `Skills.tree → ABILITIES.tree`, `Experience.log → CHRONICLE.log`, `Contact.wav → TRANSMISSION.wav`, `Terminal → DEBUG.exe`. The start button reads `KR//DEVIANT`. The deviant toggle itself reads `MACHINE` (off) / `DEVIANT` (on)
- **Window titles** flip ("MEMORY_BANK.exe — KR-19 IDENTITY MATRIX", etc.)
- **About.exe content** swaps to first-person, raw/honest copy — the "real" Kaustav behind the polished resume. Section headings flip ("COMMENDATIONS" → "STUFF THAT HAPPENED", "PUBLICATIONS" → "STUFF I WROTE")
- **Two access points** — the original switch inside About, mirrored by a taskbar button. Both write to the same global state
- **Persists across sessions** via `localStorage`

The actual content of Experience, Skills, Projects, and Contact stays unchanged — only OS-level chrome and About-side copy switch. The wallpaper and colour signals tell you the whole world has shifted; the apps tell you Kaustav has dropped the corporate filter.

### About.exe — Detroit: Become Human (expanded)
Now sourced directly from Kaustav's resume:

- Profile + KR-19 unit ID + Google I/O 2024 featured ribbon
- 7-row stat panel (Role, Company, Location, Speciality, Tenure, Status, Unit)
- **Capability Matrix** — Design for AI / XAI, Enterprise UX, Design Systems, Information Visualization, User Research, Accessibility (WCAG)
- **Education** — B.Tech Computer Science (Distinction), UEM Kolkata, CGPA 9.45
- **Certifications** — 6-item grid (Google UX, Don Norman, IxDF AI for Designers, IxDF Info Viz, Design Thinking, Michigan Photography)
- **Commendations** split into FRACTAL (Star Award – Eureka, Entrepreneurial Thinking, Teach to Learn, Star Award – Good Samaritan, Continuous Learning) and EXTERNAL (Google I/O Featured, VC Award ×2, Product Game Winner, Developer Days Winner)
- **Publications** — Medium article + LinkedIn + working notes on Lovable / Claude Code experiments
- Deviant toggle flips colour theme, copy, and section headings holistically

### Contact.wav — MGS Codec
- `◄ CODEC ► FREQ: 140.85 MHz` header with signal strength bars
- Caller portrait updates its label live as you type your callsign
- Animated sine-wave waveform driven by a `useEffect` tick (80 ms interval)
- CRT scanline overlay across the whole window

### Mobile experience (< 768px)
Below the 768px viewport breakpoint, the desktop windowing shell is replaced by a dedicated **phone-OS metaphor**. Same brand, same providers, same wallpaper — different shell and per-app layouts.

- **Lock screen** — replaces the desktop boot. Live clock + date, KR//OS brand stack, pulsing `CLICK TO BOOT` CTA. One tap unlocks audio + reveals home.
- **Home screen** — iOS-style status bar (live time, KR//OS mark, pixel signal/battery), 4×2 app icon grid with the same pixel-card treatment as desktop, frosted dock with `RESUME.PDF`, home indicator pill at the bottom.
- **App view** — full-screen container with theme-accented top bar (back arrow + icon + title), tappable home indicator to return.
- **Touch wallpaper** — `touchstart` / `touchmove` translate finger position into the same `mouseX/Y` the desktop pop logic reads; drag a finger across bright cells to pop them. Touches are suppressed while inside a full-screen app so phantom pops don't fire during scroll.
- **Per-app mobile layouts** — every app gets a dedicated mobile branch via `useIsMobile()`:
  - **About** stacks the hero card + sections vertically (replaces the 2-column desktop layout)
  - **Skills** swaps the left sidebar for a horizontal attribute tab strip
  - **Projects** becomes a collapsible accordion list
  - **Experience** uses a horizontal job pill row + single journal page
  - **Contact** stacks the CODEC vertically with both portraits side-by-side above the form
  - **Terminal** keeps the same JSX with tuned padding, font size, and shorter `kr ~$` prompt
- **Settings app** — new 8th app, single source of truth for accessibility + Deviant Mode prefs; works on both desktop and mobile.
- **Safe-area insets** — `viewport-fit: cover` plus `env(safe-area-inset-*)` on StatusBar / HomeIndicator / AppView top bar / LockScreen so notched phones get chrome pushed clear of the notch + home gesture area.
- **MouseTrail** short-circuits on touch devices to avoid awkward synthetic-mousemove blips at tap location.
- **Shared state across modes** — resize from desktop to mobile mid-session and Deviant mode, A11y prefs, and the "already booted" flag all persist.

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful localStorage keys (clear in DevTools to test fresh state)

| Key | Purpose |
|---|---|
| `kros_booted` (sessionStorage) | Skip boot animation on refresh within the session |
| `kros_a11y` | `{motionReduced, audioMuted, highContrast}` preferences |
| `kros_deviant` | `"1"` if Deviant Mode is on |

---

## Project Structure

```
public/
├── Kaustav_Roy_CV.pdf       # Resume served from /Kaustav_Roy_CV.pdf (RESUME.PDF button in taskbar)
└── preview.png
src/
├── app/
│   ├── layout.tsx           # Root layout + font imports + pixel-icon CSS + viewport-fit:cover
│   └── page.tsx             # useIsMobile branch → MobileOS (mobile) or BootScreen → Desktop
├── components/
│   ├── os/
│   │   ├── Desktop.tsx              # Desktop shell, window manager, icon grid (with pixel-card styling)
│   │   ├── DesktopBg.tsx            # Multi-layer canvas (cells / pops / constellations / planets / DSOs / meteors / palette drift) + touch handlers
│   │   ├── MouseTrail.tsx           # Pixelated cursor trail (motion-aware, disabled on touch)
│   │   ├── BootScreen.tsx           # Tap-to-enter splash + Minecraft chunk loader (Web Audio) — desktop only
│   │   ├── Window.tsx               # Draggable window (motion-aware framer-motion)
│   │   ├── Taskbar.tsx              # Bottom bar with clock + resume + Deviant toggle + A11Y menu
│   │   ├── AccessibilityMenu.tsx    # Taskbar popover with 3 a11y toggles
│   │   ├── DeviantToggle.tsx        # Taskbar mirror of About's deviant switch
│   │   ├── DeviantOverlay.tsx       # Global magenta wash when deviant is on
│   │   ├── KROSLogo.tsx             # SVG logo (palette-drift-aware + deviant transformations)
│   │   ├── MobileOS.tsx             # Phone shell state machine (lock → home → app)
│   │   └── mobile/
│   │       ├── LockScreen.tsx       # Mobile boot replacement (clock + brand + tap-to-enter)
│   │       ├── HomeScreen.tsx       # Mobile home — status bar + 4×2 app grid + dock + indicator
│   │       ├── AppView.tsx          # Full-screen app container with back arrow + theme-accented top bar
│   │       ├── StatusBar.tsx        # iOS-style top bar (time / KR//OS / signal+battery) + safe-area
│   │       └── HomeIndicator.tsx    # Bottom pill (tap = back to home) + safe-area-inset-bottom
│   └── apps/
│       ├── AboutApp.tsx       # Resume-aligned; desktop 2-col + mobile stacked branches
│       ├── ProjectsApp.tsx    # Desktop dossier + mobile accordion list
│       ├── SkillsApp.tsx      # Desktop sidebar + mobile horizontal tab strip
│       ├── ExperienceApp.tsx  # Desktop journal + mobile pill-row selector
│       ├── ContactApp.tsx     # Desktop CODEC + mobile stacked CODEC
│       ├── TerminalApp.tsx    # Tuned padding/font/prompt on mobile
│       └── SettingsApp.tsx    # A11y + Deviant prefs (desktop window + mobile app)
├── data/
│   ├── content.ts           # Profile, experience, skills, projects, education, certifications, publications, awards, OS chrome strings (normal + deviant)
│   ├── constellations.ts    # Canonical constellation patterns (stars + edges)
│   └── celestial.ts         # Planet + deep-sky object definitions
└── lib/
    ├── palette.ts           # Shared palette drift (normal + deviant palettes)
    ├── a11y.tsx             # Accessibility context, hook, localStorage persistence
    ├── deviant.tsx          # Deviant Mode context, hook, localStorage persistence
    ├── use-is-mobile.ts     # Viewport-based mobile detection (768px breakpoint, matchMedia)
    └── use-is-touch.ts      # Touch device detection (pointer:fine + ontouchstart)
```

---

## Audio note

All sound is synthesised on the fly via Web Audio API oscillators — no audio assets in the repo. The browser autoplay policy means audio only works after a user gesture, which is why the boot starts with a tap-to-enter splash. If a returning user skips boot via the `sessionStorage` flag, the first click anywhere on the desktop unlocks audio for the pop sounds. Mute Audio in the Accessibility menu silences everything.

---

## Deployment

Deployed on **Vercel** via the GitHub integration. Push to `master` triggers an automatic production deploy.

---

## Author

**Kaustav Roy** — Design Consultant, Fractal
[linkedin.com/in/kaustavr19](https://linkedin.com/in/kaustavr19) · kaustav.roy.design@outlook.com
