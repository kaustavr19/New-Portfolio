# KR//OS — Portfolio OS v2.077

This isn't a portfolio template with my name swapped in. It's my own little OS — a desktop that boots, a wallpaper that looks out of a window in Kolkata, a terminal that talks back, and a handful of apps that hold the actual work. Some of it is organized and deliberate (the case studies, the accessibility settings, the deep links). Some of it is just... whimsical, because I wanted a portfolio that felt like *mine*, not a résumé with rounded corners.

It ships in three looks:

- **InkOS** (default) — monochrome, dot-matrix, two signal colours. Black or paper, following your device.
- **Classic** — the original: every app borrows the visual language of a game I love (GTA V, Red Dead, Cyberpunk, Detroit, MGS, Minecraft).
- **Deviant** — Classic with the barrier broken. Same portfolio, a different version of the truth.

Built by **Kaustav Roy**, Design Consultant at Fractal.

---

## Start here

**[Launch KR//OS](https://kr-os-folio.vercel.app/)** · or read it straight: **[/work](https://kr-os-folio.vercel.app/work)** · **[/about](https://kr-os-folio.vercel.app/about)**

The first-run personnel brief asks what brought you here and adapts the next step:

- **Recruiter / hiring team** — opens a fast, readable evidence brief covering impact, experience, capabilities, projects, and contact paths.
- **Founder / collaborator** — starts with the flagship case study and the decisions behind the work.
- **Curious visitor** — enters the OS freely, with the Terminal and hidden system layers left to discover.

> **Desktop (≥768px):** watch the KR//OS monogram build itself dot by dot, then press **Enter KR//OS**. Click an icon to open an app; drag windows by the title bar, double-click to maximise. `Alt + 1–7` launches apps directly. The **KR//OS** button in the dock holds the theme, light/dark, reading view and sound.
>
> **Mobile (<768px):** the windowing shell becomes a phone OS — lock screen → home → full-screen apps. Tap or swipe up to unlock.

---

## What's here

| App | InkOS | Classic theme | What it is |
|-----|-------|---------------|------------|
| About | Profile, capability bars, commendations | Detroit: Become Human | Profile, recruiter brief, proof points, and the human behind the work |
| Projects | Mission list + dossier, halftone figures, redaction for NDA work | GTA V | Case studies (main missions), consulting (contracts) and side projects, each with a full write-up |
| Skills | Evidence cards | Cyberpunk 2077 | Every capability points to projects, roles, outcomes, or credentials |
| Experience | Dot timeline | Red Dead Redemption 2 | Career history |
| Contact | Form + direct channels | Metal Gear Solid | Intent-aware contact form (roles, reviews, collaborations, speaking), sent via Resend |
| Terminal | Mono, two signal colours | Minecraft | A command line that answers real questions about my work — and hides a few things that aren't questions |
| Settings | Theme, appearance, a11y, Sound lab | KR//OS | Preferences, plus the theme switch back |

Every case study is directly addressable — `#projects/<id>` opens the right dossier inside the OS, and `/work/<id>` is the same case study as a plain, indexable page (with a Markdown twin at `/work/<id>.md` and a site-wide `llms.txt`).

See [CHANGELOG.md](CHANGELOG.md) for the full history.

---

## InkOS

The default look. Monochrome, dot-matrix type (Doto, Space Mono, Inter), and two colours with strict jobs: **red is state** (live, active, current, alerts, close) and **blue is action** (links, focus, selection, the leading edge of progress). Everything else is ink.

- **Light and dark** — *Auto* follows your device's setting: ink on black, or ink on paper. Override with **Auto / Light / Dark** in the dock menu, Settings → Appearance, or the reading-page header. Applied before first paint, so there's no flash.
- **Boot** — the monogram is rasterised into a dot grid and lit in a sweep while a segmented bar fills; at 100% it pulses red once and *Enter* appears.
- **Desktop** — widgets on the left: a Kolkata clock with live weather, status, years of experience (computed from career dates, so it never goes stale), a **work map** where every project is one dot, and the current mission's progress. Monochrome icons on the right; a floating dock at the bottom. Windows carry a light bar that pulses when they take focus.
- **Phone** — a lock screen with a giant dot clock and the current mission, a home screen with widgets and round icons, and full-screen apps.
- **Reading pages** — `/work`, `/work/<id>` and `/about` are server-rendered in Ink, for search engines, link previews, and anyone who'd rather just read.

### The living wallpaper

The dot grid is a canvas that behaves like an LED matrix: **the dots never move**. Everything is drawn by changing the size and brightness of dots that are already there.

- The KR//OS monogram, drawn in the grid on the dock's centre line, breathing slightly
- A cursor lens, ripples from clicks and from every window that opens, and a slow breathing drift across the field
- **The real Kolkata weather** (Open-Meteo via `/api/weather`, cached 30 min): drifting clouds, a sun by day; a crescent moon, twinkling stars and the odd shooting star at night; rain streaks; lightning in storms; birds crossing on dry days

~30 fps, slower while windows are open, paused in a hidden tab, a single still frame with Reduce Motion. Preview any sky with `?sky=day | night | cloudy | rain | storm | fog`.

### Sound

All synthesised with the Web Audio API — no audio files. A calm musical ambience under dry, mechanical UI sounds:

- **Ambience** — a near-silent room tone and a slow two-note pad, brighter by day and darker at night. The wallpaper drives the rest from the real weather: glassy star blips at night, bird chirps by day, rain wash and droplets when it's wet, and a crack-and-rumble thunder just after each lightning flash.
- **UI sounds** — rising blips when a window opens, a falling one on close, relay ticks on toggles and tabs, a soft thock on the bare desktop, and a chord when boot is ready.
- **Sound lab** (Settings) — switch each layer on or off, play any sound on demand, and see every running audio engine.

Ambience and Sound effects are separate settings, and nothing plays before your first click or tap (browser autoplay rules).

---

## The fun stuff

A few things worth going looking for, rather than reading about:

- **Switch the whole OS** — Settings, the dock menu, or type `classic`, `deviant` or `ink` in the Terminal. `?theme=classic` previews a theme from a link.
- **Look out of the window** — come back at night, or when it's raining in Kolkata.
- **The Terminal talks back** — it's not a fixed menu. Ask it things. It has real answers about my work, skills, and experience — and a sense of humour about classic terminal culture, if you poke at it the way you'd poke at a real one. Tab-completion exists. Use it.
- **Deviant Mode** — doesn't just change a colour. It reframes the Classic OS — copy, chrome labels, the wallpaper palette, the logo itself — into a different voice.
- **The personnel brief** — a first-run dossier that's useful to recruiters without forcing everyone else into recruiter mode. Reopen it from About or Settings.

I'm not going to spell out every hidden command here — that's half the point.

---

## Built to be usable by everyone

Accessibility isn't a checkbox bolted on afterward — preferences are respected by every theme, not just toggled on a class that half the components ignore.

- **Reduce Motion** — stops the boot sweep, wallpaper animation, light-bar pulses, blinking dots, particles and window animations (in Classic: the mouse trail, constellations and meteors too). Auto-detects `prefers-reduced-motion`.
- **Sound control** — Ambience and Sound effects toggle independently, and the Sound lab can silence any single layer, so nothing plays that you didn't ask for.
- **Light and dark** — InkOS follows `prefers-color-scheme`, with contrast-checked signal colours in both.
- **High Contrast** — brightens and bolds Classic's icon labels with a solid backing.
- **Readable everything** — a printable reading view inside the OS, plus the server-rendered `/work` and `/about` pages. The OS is fun until it stands between someone and the evidence, so there's always an escape hatch.
- **Accessible contact flow** — persistent labels, visible focus, inline validation, status announcements.
- Preferences persist in `localStorage`, so you only have to say what you need once.

---

## Under the hood

<details>
<summary><strong>Tech stack</strong></summary>

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4, plus `components/ink/ink.css` (InkOS tokens; light/dark via CSS variables)
- **Animation** — Framer Motion (window open/close, boot phases), CSS transitions
- **Canvas** — the InkOS dot-matrix wallpaper and boot (`InkWallpaper`, `InkBoot`); Classic's multi-layer pixel sky (`DesktopBg`)
- **WebGL / GLSL** — hand-written fragment shaders via a tiny dependency-free runner (`lib/webgl/shaderQuad.ts`, ~1.5kb) — Classic's CRT overlay, synthwave boot backdrop and cosmic wallpaper (no Three.js)
- **Audio** — Web Audio API synthesis, no audio files (`lib/ink-sound.ts`; Classic UI blips in `lib/sound.ts`)
- **Weather** — Open-Meteo for Kolkata through a cached route handler (`/api/weather`)
- **Email** — Resend, via a Next.js route handler — the Contact form sends mail with the visitor's selected inquiry intent
- **Icons** — InkOS line icons inline; Classic uses [@hackernoon/pixel-icon-library](https://github.com/hackernoon/pixel-icon-library) (CC 4.0)
- **State** — React Context for preferences and the theme, external-store subscriptions for audience routing and light/dark
- **Deep links** — hash-based routing (`#projects/<id>`), no router dependency
- **Indexable pages** — server-rendered `/work`, `/work/<id>`, `/about`, Markdown twins, `llms.txt` / `llms-full.txt`, JSON-LD, and generated Open Graph cards (`next/og`)
- **Fonts** — InkOS: Doto, Space Mono, Inter. Classic: Press Start 2P, VT323, Share Tech Mono, Orbitron, Rajdhani, Bebas Neue, Cinzel, EB Garamond, Special Elite (Google Fonts)
- **Deployment** — Vercel

</details>

<details>
<summary><strong>How themes work</strong></summary>

- `lib/theme.tsx` holds the theme (`ink` · `classic` · `deviant`), persisted per visitor and mirrored to `<html data-theme>`. `?theme=` previews one from a link.
- `OSRoot` mounts the matching shell: `components/ink/*` for InkOS, the original `components/os/*` for Classic and Deviant. Both read the same `content.ts`, contact API, terminal engine and accessibility settings.
- **Deviant is derived from the theme** — `useDeviant()` reports `theme === "deviant"`, so every existing deviant-aware component works unchanged.
- **Light/dark** (InkOS only) lives on `<html data-ink-mode="system|light|dark">`. CSS picks the colour set (`prefers-color-scheme` when `system`); the canvases read the resolved scheme through `useInkScheme()`. A tiny inline script in `app/layout.tsx` applies a saved override before first paint.
- InkOS turns off Classic's scanlines, CRT shader and WebGL layers.

</details>

<details>
<summary><strong>InkOS wallpaper, in detail</strong></summary>

- One canvas, 18px dot pitch. The base grid is drawn once to an offscreen canvas; each frame computes an intensity per dot and redraws only the lit ones on top.
- **Logo** — the monogram path is rasterised once at its on-screen size and sampled at each dot.
- **Clouds** — 2–6 clusters of overlapping soft discs drifting sideways; count and density follow cloud cover.
- **Sky** — a dot sun by day; a crescent moon (a disc minus an offset disc) and ~2.5% of dots as twinkling stars at night, with the odd shooting star.
- **Weather** — diagonal rain streaks (heavier in storms) with lightning flashes; birds (a two-frame V of dots) on dry days.
- **Interaction** — a cursor lens, and expanding ripple rings from clicks and window opens (`ink:ripple` events).
- **Budget** — ~30 fps, ~12 fps under open windows, paused when hidden, one static frame with Reduce Motion.

</details>

### Classic theme

The original game-themed OS, still one switch away.

<details>
<summary><strong>Classic — boot sequence</strong></summary>

- **Tap-to-enter splash** — dirt-tiled background, pulsing `CLICK TO BOOT` CTA. Required to unlock the browser AudioContext (per the autoplay policy).
- **Minecraft chunk loader** — 24×14 grid of pixel "chunks" revealing from centre outward over ~2.2 s with light noise/jitter for organic feel. Cells are coloured from a curated mix of terrain tones and app theme accents.
- **Per-chunk audio** — Web Audio synth pops climb in pitch as chunks load (220 Hz → 660 Hz), throttled every 8th chunk. A C-E-G-C arpeggio chime plays on completion.
- **Synthwave WebGL backdrop (default on)** — behind the loader, a GLSL shader renders a receding neon grid + horizon glow + drifting stars. Toggleable in Settings → LABS (`bootWebgl`); falls back to the dirt-tiled background when off or when WebGL is unavailable.
- **Skip** with `Space`, `Enter`, or `Escape`.
- **Returning visits** — desktop remembers a completed boot in `localStorage`; the mobile shell uses its session flag to avoid replaying the lock flow while switching layouts.
- **Deviant-aware copy** — when Deviant Mode is on, the boot title becomes `KR//DEVIANT`, the CTA becomes `BREAK PROTOCOL`, and the status arc shifts to a Detroit voice ("Initializing programming…" → "DEVIANT.").

</details>

<details>
<summary><strong>Classic — desktop wallpaper (canvas, single 14 fps RAF loop)</strong></summary>

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

</details>

<details>
<summary><strong>Classic — WebGL effects (LABS)</strong></summary>

An opt-in WebGL layer, built so every effect is **flag-gated and lazy-loaded** — an effect's shader code is only downloaded when its flag is on. All effects auto-degrade: no WebGL → the effect renders nothing (original behaviour stays); Reduce Motion → a single static frame (or skips entirely). Flags live in `lib/experiments.tsx` (Context + `localStorage`, sibling of the a11y/deviant providers).

- **CRT monitor (default on)** — a full-screen overlay shader: scanlines, vignette, edge chromatic fringe, grain, and an occasional sparse rolling sync-bar. Sells the "real old monitor" look the OS metaphor reaches for.
- **Synthwave boot backdrop (default on)** — see Boot sequence above.
- **Cosmic wallpaper (opt-in)** — an alternate desktop sky rendered entirely on the GPU: sparse parallax stars, restrained drifting nebulae, procedurally-textured solar-system planets (Earth with oceans/continents/clouds, Mars, Jupiter with the Great Red Spot, ringed Saturn), and an Interstellar "Gargantua"-style black hole with a Doppler-brightened accretion disc, photon ring, and **gravitational lensing** that warps the background stars/nebula around it.

**Toggle surfaces** (three views of one truth):
- **Wallpaper switcher** — right-click the desktop → `WALLPAPER` → Classic Sky (2D canvas) / Cosmic (WebGL). OS-style, persisted.
- **Settings → LABS** — pill toggles for every effect.
- **URL params** — `?fx=crt,starfield` to force effects on a link; `?fx=none` clears.

</details>

<details>
<summary><strong>Classic — desktop OS shell</strong></summary>

- Draggable windows with macOS-style traffic-light controls (close / minimise / maximise)
- **Pixel-card icons** — desktop icons sit on solid dark cards with accent-tinted 1px borders, accent-coloured drop-shadow glow, and 4-direction 1px black outlines on labels for readability against any background state
- **Single-click to open** any desktop app
- **Command Center** — `Ctrl/Cmd + K` searches apps, the active visitor route, reader mode, and system actions
- **Keyboard launching** — `Alt + 1–7` opens the seven portfolio apps directly
- **Workspace actions** — minimize or close every window from the Start menu and Command Center, with minimize-all also available from the desktop context menu
- Pixelated mouse trail follows the cursor across the desktop
- A deliberately compact taskbar with the Start menu, open-app indicators, controls, ambient system telemetry, and a live clock
- The Start menu carries recently opened state, the active visitor route, pinned apps, system actions, and reboot

</details>

<details>
<summary><strong>Deviant Mode</strong></summary>

What started as a Detroit-themed colour flip inside `About.exe` is now a **site-wide narrative state**:

- **Wallpaper palette** swaps to crimson/red/magenta
- **Global magenta wash** overlay fades in across the viewport
- **Logo (`KROSLogo`)** transforms: `//OS → //DEVIANT`, `v2.077 → BARRIER BROKEN`, thicker corner brackets, a pulsing ⚠ warning glyph, and an occasional glitch-slice flicker on the `KR` wordmark
- **OS chrome relabels** in Detroit voice: `About.exe → MEMORY_BANK.exe`, `Projects/ → MISSIONS/`, `Skills.tree → ABILITIES.tree`, `Experience.log → CHRONICLE.log`, `Contact.wav → TRANSMISSION.wav`, `Terminal → DEBUG.exe`. The start button reads `KR//DEVIANT`. The deviant toggle itself reads `MACHINE` (off) / `DEVIANT` (on)
- **Window titles** flip ("MEMORY_BANK.exe — KR-19 IDENTITY MATRIX", etc.)
- **About.exe content** swaps to first-person, raw/honest copy — the "real" Kaustav behind the polished resume. Section headings flip ("COMMENDATIONS" → "STUFF THAT HAPPENED", "PUBLICATIONS" → "STUFF I WROTE")
- **Several access points** — the switch inside About, the Control Center, Settings, and the `deviant` terminal command. All write the same global theme
- **Persists across sessions** as the `deviant` theme (`kros_theme`)

The actual content of Experience, Skills, Projects, and Contact stays unchanged — only OS-level chrome and About-side copy switch. The wallpaper and colour signals tell you the whole world has shifted; the apps tell you Kaustav has dropped the corporate filter.

</details>

<details>
<summary><strong>Classic — mobile experience (&lt;768px)</strong></summary>

Below the 768px viewport breakpoint, the desktop windowing shell is replaced by a dedicated **phone-OS metaphor**. Same brand, same providers, same wallpaper — different shell and per-app layouts.

- **Lock screen** — replaces the desktop boot. Live clock + date, KR//OS brand stack, pulsing `CLICK TO BOOT` CTA. One tap unlocks audio + reveals home.
- **Home screen** — iOS-style status bar, remembered visitor-route strip, 4×2 app icon grid with the same pixel-card treatment as desktop, frosted dock with `RESUME.PDF`, and a home indicator.
- **App view** — full-screen container with theme-accented top bar (back arrow + icon + title), tappable home indicator to return.
- **Touch wallpaper** — `touchstart` / `touchmove` translate finger position into the same `mouseX/Y` the desktop pop logic reads; drag a finger across bright cells to pop them. Touches are suppressed while inside a full-screen app so phantom pops don't fire during scroll.
- **Per-app mobile layouts** — every app gets a dedicated mobile branch via `useIsMobile()`:
  - **About** stacks the hero card + sections vertically (replaces the 2-column desktop layout)
  - **Skills** swaps the left sidebar for a horizontal attribute tab strip
  - **Projects** becomes a collapsible accordion list
  - **Experience** uses a horizontal job pill row + single journal page
  - **Contact** stacks the CODEC vertically with both portraits side-by-side above the form
  - **Terminal** keeps the same JSX with tuned padding, font size, and shorter `kr ~$` prompt
- **Settings app** — accessibility, theme and Deviant Mode prefs; works on both desktop and mobile.
- **Safe-area insets** — `viewport-fit: cover` plus `env(safe-area-inset-*)` on StatusBar / HomeIndicator / AppView top bar / LockScreen so notched phones get chrome pushed clear of the notch + home gesture area.
- **MouseTrail** short-circuits on touch devices to avoid awkward synthetic-mousemove blips at tap location.
- **Shared state across modes** — resize from desktop to mobile mid-session and Deviant mode, A11y prefs, and the "already booted" flag all persist.

</details>

<details>
<summary><strong>Project structure</strong></summary>

```
public/
├── Kaustav_Roy_CV.pdf        # Resume served from /Kaustav_Roy_CV.pdf
├── brand/                    # KR//OS monogram (white for Ink, original gold)
└── nexval/                   # Optimised case-study screenshots (AVIF/WebP/PNG)
src/
├── app/
│   ├── layout.tsx            # Root layout, fonts, metadata, no-flash light/dark script
│   ├── page.tsx              # Indexable shell + OSRoot
│   ├── icon.svg              # Favicon (the monogram)
│   ├── opengraph-image.tsx   # Generated social preview card
│   ├── (read)/               # Server-rendered /work, /work/[slug], /about (InkOS styled)
│   ├── llms.txt/ · llms-full.txt/ · md/   # Markdown for AI agents
│   └── api/
│       ├── contact/route.ts  # Contact form → Resend
│       ├── weather/route.ts  # Kolkata weather (Open-Meteo, cached 30 min)
│       └── last-commit/route.ts
├── components/
│   ├── ink/                  # InkOS — the default theme
│   │   ├── InkBoot.tsx           # Dot-matrix monogram boot
│   │   ├── InkDesktop.tsx        # Window manager, widgets, icon rail
│   │   ├── InkWallpaper.tsx      # LED-matrix canvas: logo, lens, ripples, weather scene
│   │   ├── InkWindow.tsx         # Draggable window with focus light bar
│   │   ├── InkDock.tsx           # Dock + system menu (theme, appearance, sound)
│   │   ├── InkMobile.tsx         # Phone shell: lock → home → app
│   │   ├── InkBrief.tsx          # First-run audience brief
│   │   ├── InkAmbientAudio.tsx   # Runs the sound engine; follows prefs and weather
│   │   ├── SoundLab.tsx          # Per-layer sound switches + engine list
│   │   ├── InkModePicker.tsx     # Auto / Light / Dark
│   │   ├── widgets.tsx           # Clock + weather, experience, work map, currently
│   │   ├── blocks.tsx            # Dossier blocks (figures, compare tables, credits…)
│   │   ├── ui.tsx · ink.css      # Primitives and tokens
│   │   └── apps/                 # About, Projects, Skills, Experience, Contact, Terminal, Settings
│   ├── os/                   # Classic / Deviant shell (Desktop, BootScreen, Taskbar, MobileOS, …)
│   ├── apps/                 # Classic game-themed apps
│   ├── reader/               # Plain-reader dossier blocks
│   └── experiments/          # Lazy WebGL effects (Classic)
├── data/
│   ├── content.ts            # Profile, experience, projects, skills… plus career dates
│   ├── nexval-figures.ts     # Generated image sizes for the Nexval case study
│   ├── constellations.ts · celestial.ts   # Classic sky data
└── lib/
    ├── theme.tsx             # Theme + InkOS light/dark
    ├── ink-sound.ts          # InkOS sound engine
    ├── sound.ts              # Classic UI blips
    ├── a11y.tsx · deviant.tsx · experiments.tsx · reader-mode.tsx
    ├── site.ts · markdown.ts # Indexable pages, JSON-LD, Markdown renderings
    ├── audience.ts · deep-link.ts · personnel-brief.ts
    ├── terminal/engine.ts    # Terminal parsing + answer engine (pure logic)
    ├── webgl/                # Shader runner + GLSL
    └── use-is-mobile.ts · use-is-touch.ts
```

</details>

<details>
<summary><strong>Local development</strong></summary>

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Contact form needs a `RESEND_API_KEY` in `.env.local` to actually send mail (sign up at [resend.com](https://resend.com)); without it the app still runs, the form just can't deliver. The weather needs no key.

**Useful URL parameters**

| Param | Does |
|---|---|
| `?theme=ink \| classic \| deviant` | Preview a theme |
| `?sky=day \| night \| cloudy \| rain \| storm \| fog` | Preview a weather scene on the InkOS wallpaper |
| `?fx=crt,boot,starfield` / `?fx=none` | Classic WebGL effects on or off |

**Useful localStorage keys** (clear in DevTools to test fresh state):

| Key | Purpose |
|---|---|
| `kros_theme` | `ink`, `classic` or `deviant` |
| `kros_ink_mode` | InkOS appearance: `system`, `light` or `dark` |
| `kros_booted` | Skip the boot on returning visits; mobile also uses a session copy |
| `kros_personnel_brief_v2` | Remember that the first-run brief was dismissed |
| `kros_audience` | Active visitor route: recruiter, collaborator, or explorer |
| `kros_last_opened` | Recently opened app (Classic Start menu) |
| `kros_a11y` | `{motionReduced, soundEffects, ambience, highContrast}` |
| `kros_experiments` | `{crtShader, bootWebgl, starfieldWebgl}` Classic WebGL flags |

</details>

---

## Deployment

Deployed on **Vercel** via the GitHub integration. Push to `master` triggers an automatic production deploy.

---

## Author

**Kaustav Roy** — Design Consultant, Fractal
[linkedin.com/in/kaustavr19](https://linkedin.com/in/kaustavr19) · kaustav.roy.design@outlook.com
