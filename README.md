# KR//OS — Portfolio OS v2.077

This isn't a portfolio template with my name swapped in. It's my own little OS — a desktop that boots, a wallpaper that breathes, a terminal that talks back, and a handful of apps that each borrow the visual language of a game I actually love. Some of it is organized and deliberate (the case studies, the accessibility menu, the deep links). Some of it is just... whimsical, because I wanted a portfolio that felt like *mine*, not a résumé with rounded corners.

Every section runs as its own "app" inside a simulated desktop environment. Open Projects and you're in a GTA V mission board. Open Contact and you're staring at an MGS Codec screen. Open the Terminal and — well, that one has opinions.

Built by **Kaustav Roy**, Design Consultant at Fractal.

---

## Start here

**[Launch KR//OS](https://kr-os-folio.vercel.app/)**

The first-run personnel brief asks what brought you here and adapts the next step:

- **Recruiter / hiring team** — opens a fast, readable evidence brief covering impact, experience, capabilities, projects, and contact paths.
- **Founder / collaborator** — starts with the flagship case study and the decisions behind the work.
- **Curious visitor** — enters the OS freely, with the Terminal and hidden system layers left to discover.

The chosen route persists across visits, appears in the desktop Start menu and mobile home screen, and can be changed at any time.

> **Desktop (≥768px):** click the dirt block on the boot screen to start. Single-click any desktop icon to open an app. The green traffic light toggles between fullscreen and windowed mode. Press `Ctrl/Cmd + K` for the Command Center, or `Alt + 1–7` to launch apps directly.
>
> **Mobile (<768px):** the desktop windowing shell is replaced by a phone OS — lock screen → home grid → full-screen apps. Drag a finger across the wallpaper to pop pixel cells.

---

## What's here right now

| App | Game Theme | What it is |
|-----|-----------|-------------|
| `About.exe` | Detroit: Become Human | Android profile card, recruiter brief, proof points, and the human behind the work |
| `Projects/` | GTA V | Mission dossier — case studies (work) and side projects, each with a full write-up |
| `Skills.tree` | Cyberpunk 2077 | Evidence-linked capabilities — every major skill points to projects, roles, outcomes, or credentials |
| `Experience.log` | Red Dead Redemption 2 | Arthur's journal — handwritten paper aesthetic, career history |
| `Contact.wav` | Metal Gear Solid | Accessible Codec radio with intent-aware prompts for roles, reviews, collaborations, and speaking |
| `Terminal` | Minecraft | A command line that answers real questions about my work, and hides a few things that aren't questions at all |
| `Settings.cfg` | KR//OS | Accessibility, Deviant Mode, audio, and experimental visual controls |

Every main-mission case study and side-project write-up in Projects is directly addressable — a hash link such as `#projects/whatever` opens the right dossier instead of dropping someone at the homepage. Shared links use the site-wide KR//OS social preview.

---

## Recent evolution

The latest pass focused on making the experience work for people who arrive with a purpose, without sanding away the strange little OS that makes it memorable:

- **Audience-aware onboarding** — hiring, building, and exploring routes with remembered recommendations.
- **Recruiter brief** — a readable, printable view available from About and the first-run brief.
- **Capabilities backed by evidence** — Skills now connects claims to concrete work and outcomes.
- **Stronger conversion paths** — Projects, Experience, Skills, and Reader Mode end with a contextual path into Contact.
- **A clearer Contact experience** — larger type, higher contrast, visible validation, semantic form controls, and inquiry intent carried into the email.
- **Deeper OS behavior** — Command Center search, keyboard launch shortcuts, recently opened apps, wallpaper actions, minimize-all, close-all, system telemetry, sound, and reader controls.

See [CHANGELOG.md](CHANGELOG.md) for the full record.

### What's cooking

- Ongoing case-study, experience, award, and publication upkeep as the work changes.
- An Articles app for longer-form writing currently linked externally.
- More OS-native interaction experiments, as long as they improve the journey rather than merely add chrome.

---

## The fun stuff

A few things worth going looking for, rather than reading about:

- **Command Center** — press `Ctrl/Cmd + K` and search apps, visitor routes, reader mode, or workspace actions. Recommendations change with the active visitor route.
- **The personnel brief** — a first-run dossier that is useful to recruiters without forcing everyone else into recruiter mode. Reopen it from the Start menu or mobile route strip.
- **Deviant Mode** — there's a toggle (About, and a mirror in the taskbar labeled `MACHINE` / `DEVIANT`) that doesn't just change a colour. It reframes the entire site — copy, chrome labels, the wallpaper palette, the logo itself — into a different voice. It's the same portfolio telling you a different version of the truth.
- **Wallpaper switching** — right-click the desktop. There's more than one sky.
- **The Terminal talks back** — it's not a fixed menu. Ask it things. It has real answers about my work, skills, and experience — and it also has a sense of humor about classic terminal culture, if you poke at it the way you'd poke at a real one. Tab-completion exists. Use it.
- **Palette drift** — the whole wallpaper slowly breathes through a colour cycle on its own. You don't have to do anything for this one, just wait.

I'm not going to spell out every hidden command here — that's half the point.

---

## Built to be usable by everyone

Accessibility isn't a checkbox I bolted on afterward — the a11y menu is a first-class taskbar feature, and it's built to actually be respected everywhere else in the app, not just toggle a class that half the components ignore.

- **Reduce Motion** — kills wallpaper effects, particles, constellations, meteors, the mouse trail, and window animations. Auto-detects `prefers-reduced-motion` on first visit — I don't make you find the switch if your OS already told me. The boot animation skips entirely.
- **Sound control** — every synthesized sound (boot chimes, pop sounds, UI blips, the ambient hum) is independently toggleable, so nothing plays that you didn't ask for.
- **High Contrast** — brightens and bolds icon labels with a solid backing, for anyone who needs the desktop to stop being subtle.
- **A site-wide reader mode** — About, capabilities, experience, projects, and contact paths become one printable, high-legibility document. The game-inspired UI is fun until it stands between someone and the evidence, so there is always an escape hatch.
- **Accessible contact flow** — persistent labels, larger controls, visible focus, inline validation, status announcements, reduced-motion behavior, and higher contrast are built into the final conversion point.
- Accessibility preferences persist in `localStorage`, so you only have to say what you need once.

---

## Under the hood

<details>
<summary><strong>Tech stack</strong></summary>

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Animation** — Framer Motion (window open/close, boot phases), CSS transitions (maximize/restore)
- **Canvas** — Custom multi-layer pixel animation (`DesktopBg`)
- **WebGL / GLSL** — Hand-written fragment shaders via a tiny dependency-free runner (`lib/webgl/shaderQuad.ts`, ~1.5kb) — powers the CRT overlay, synthwave boot backdrop, and the cosmic wallpaper (no Three.js)
- **Audio** — Web Audio API synthesis (no audio files — square/sine oscillators for boot chimes and pop sounds)
- **Email** — Resend, via a Next.js route handler — the Contact form sends mail with the visitor's selected inquiry intent
- **Icons** — [@hackernoon/pixel-icon-library](https://github.com/hackernoon/pixel-icon-library) (pixel-art icon font, CC 4.0)
- **State** — React Context for global preferences plus external-store subscriptions for persisted audience routing
- **Deep links** — hash-based routing (`#projects/<id>`), no router dependency — a small shared module reads/writes `location.hash` so any app window or specific case study is a shareable URL
- **Social previews** — a dynamically generated Open Graph card (`next/og`), so links actually look like something when shared
- **Fonts** — Press Start 2P, Share Tech Mono, Orbitron, Rajdhani, Bebas Neue, Cinzel, Special Elite (Google Fonts)
- **Deployment** — Vercel

</details>

<details>
<summary><strong>Boot sequence</strong></summary>

- **Tap-to-enter splash** — dirt-tiled background, pulsing `CLICK TO BOOT` CTA. Required to unlock the browser AudioContext (per the autoplay policy).
- **Minecraft chunk loader** — 24×14 grid of pixel "chunks" revealing from centre outward over ~2.2 s with light noise/jitter for organic feel. Cells are coloured from a curated mix of terrain tones and app theme accents.
- **Per-chunk audio** — Web Audio synth pops climb in pitch as chunks load (220 Hz → 660 Hz), throttled every 8th chunk. A C-E-G-C arpeggio chime plays on completion.
- **Synthwave WebGL backdrop (default on)** — behind the loader, a GLSL shader renders a receding neon grid + horizon glow + drifting stars. Toggleable in Settings → LABS (`bootWebgl`); falls back to the dirt-tiled background when off or when WebGL is unavailable.
- **Skip** with `Space`, `Enter`, or `Escape`.
- **Returning visits** — desktop remembers a completed boot in `localStorage`; the mobile shell uses its session flag to avoid replaying the lock flow while switching layouts.
- **Deviant-aware copy** — when Deviant Mode is on, the boot title becomes `KR//DEVIANT`, the CTA becomes `BREAK PROTOCOL`, and the status arc shifts to a Detroit voice ("Initializing programming…" → "DEVIANT.").

</details>

<details>
<summary><strong>Desktop wallpaper (canvas-based, single 14 fps RAF loop)</strong></summary>

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
<summary><strong>WebGL effects (LABS)</strong></summary>

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
<summary><strong>Desktop OS shell</strong></summary>

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
<summary><strong>Deviant Mode (holistic)</strong></summary>

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

</details>

<details>
<summary><strong>Mobile experience (&lt;768px)</strong></summary>

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
- **Settings app** — single source of truth for accessibility + Deviant Mode prefs; works on both desktop and mobile.
- **Safe-area insets** — `viewport-fit: cover` plus `env(safe-area-inset-*)` on StatusBar / HomeIndicator / AppView top bar / LockScreen so notched phones get chrome pushed clear of the notch + home gesture area.
- **MouseTrail** short-circuits on touch devices to avoid awkward synthetic-mousemove blips at tap location.
- **Shared state across modes** — resize from desktop to mobile mid-session and Deviant mode, A11y prefs, and the "already booted" flag all persist.

</details>

<details>
<summary><strong>Project structure</strong></summary>

```
public/
└── Kaustav_Roy_CV.pdf       # Resume served from /Kaustav_Roy_CV.pdf
src/
├── app/
│   ├── layout.tsx           # Root layout + font imports + pixel-icon CSS + metadata + viewport-fit:cover
│   ├── page.tsx             # useIsMobile branch → MobileOS (mobile) or BootScreen → Desktop
│   ├── opengraph-image.tsx  # Generated OG/Twitter social preview card
│   └── api/
│       └── contact/route.ts # Sends Contact form submissions via Resend
├── components/
│   ├── os/
│   │   ├── Desktop.tsx              # Desktop shell, window manager, icon grid (with pixel-card styling)
│   │   ├── DesktopBg.tsx            # Multi-layer canvas (cells / pops / constellations / planets / DSOs / meteors / palette drift) + touch handlers
│   │   ├── MouseTrail.tsx           # Pixelated cursor trail (motion-aware, disabled on touch)
│   │   ├── AmbientAudio.tsx         # Synthesized galactic hum (gesture-gated, follows the ambience pref)
│   │   ├── BootScreen.tsx           # Tap-to-enter splash + Minecraft chunk loader (Web Audio) — desktop only
│   │   ├── Window.tsx               # Draggable window (motion-aware framer-motion)
│   │   ├── PersonnelBrief.tsx       # First-run dossier + audience route selection
│   │   ├── CommandCenter.tsx        # Searchable app, route, reader, and workspace actions
│   │   ├── ReaderMode.tsx           # Printable, high-legibility portfolio document
│   │   ├── ContactCTA.tsx           # Shared end-of-journey conversion component
│   │   ├── Taskbar.tsx              # Compact bar + Start menu + open apps + controls + telemetry
│   │   ├── AccessibilityMenu.tsx    # Taskbar popover with a11y toggles
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
│   ├── experiments/             # Lazy WebGL effect components (mounted only when flagged)
│   │   ├── ExperimentLayer.tsx  # Top-level mount point — lazy-renders enabled overlays
│   │   ├── CrtOverlay.tsx       # Full-screen CRT shader overlay
│   │   ├── BootShaderBg.tsx     # Synthwave boot backdrop canvas
│   │   └── StarfieldWebgl.tsx   # Cosmic wallpaper canvas (covers DesktopBg when on)
│   └── apps/
│       ├── AboutApp.tsx       # Resume-aligned; desktop 2-col + mobile stacked branches
│       ├── ProjectsApp.tsx    # Desktop dossier + mobile accordion list; deep-link + NDA-gate aware
│       ├── SkillsApp.tsx      # Evidence-linked capabilities; desktop tree + mobile tab strip
│       ├── ExperienceApp.tsx  # Desktop journal + mobile pill-row selector
│       ├── ContactApp.tsx     # Accessible, intent-aware CODEC contact flow
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
    ├── experiments.tsx      # WebGL effect flags — context + localStorage + ?fx= URL params
    ├── audience.ts          # Visitor profiles, persistence, and route subscription
    ├── deep-link.ts         # Hash-based deep linking — read/write location.hash for shareable app/project URLs
    ├── personnel-brief.ts   # Global event for reopening audience onboarding
    ├── terminal/engine.ts   # Terminal command parsing + free-text answer engine (pure logic, no React)
    ├── webgl/
    │   ├── shaderQuad.ts    # Tiny dependency-free fullscreen fragment-shader runner
    │   └── shaders/         # GLSL fragment shaders (crt / boot / starfield)
    ├── use-is-mobile.ts     # Viewport-based mobile detection (768px breakpoint, matchMedia)
    └── use-is-touch.ts      # Touch device detection (pointer:fine + ontouchstart)
```

</details>

<details>
<summary><strong>Local development</strong></summary>

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Contact form needs a `RESEND_API_KEY` in `.env.local` to actually send mail (sign up at [resend.com](https://resend.com)); without it the app still runs, the form just can't deliver.

**Useful localStorage keys** (clear in DevTools to test fresh state):

| Key | Purpose |
|---|---|
| `kros_booted` | Skip the completed desktop boot on returning visits; mobile also uses a session copy |
| `kros_personnel_brief_v2` | Remember that the first-run personnel brief was dismissed |
| `kros_audience` | Active visitor route: recruiter, collaborator, or explorer |
| `kros_last_opened` | Recently opened app shown in the Start menu |
| `kros_a11y` | `{motionReduced, soundEffects, ambience, highContrast}` preferences |
| `kros_deviant` | `"1"` if Deviant Mode is on |
| `kros_experiments` | `{crtShader, bootWebgl, starfieldWebgl}` WebGL effect flags (also settable via `?fx=`) |

</details>

<details>
<summary><strong>Audio note</strong></summary>

All sound is synthesised on the fly via Web Audio API oscillators — no audio assets in the repo. This includes the **Galactic Ambience** drone (low detuned oscillators + filtered noise through a slow LFO). The browser autoplay policy means audio only works after a user gesture, which is why the boot starts with a tap-to-enter splash. If a returning visitor skips boot, the first click anywhere unlocks audio. **Sound Effects** and **Galactic Ambience** in the Accessibility menu (or Settings) toggle each independently.

</details>

---

## Deployment

Deployed on **Vercel** via the GitHub integration. Push to `master` triggers an automatic production deploy.

---

## Author

**Kaustav Roy** — Design Consultant, Fractal
[linkedin.com/in/kaustavr19](https://linkedin.com/in/kaustavr19) · kaustav.roy.design@outlook.com
