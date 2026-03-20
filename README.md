# KR//OS — Portfolio OS v2.077

A game-themed browser OS portfolio built by **Kaustav Roy**, Design Consultant at Fractal. Every section of the portfolio runs as its own "app" inside a simulated desktop environment, each styled after a different video game universe.

---

## Preview

> Double-click any desktop icon to open an app. The green traffic light toggles between fullscreen and windowed mode.

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

- **Framework** — Next.js 15 (App Router, Turbopack)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Animation** — Framer Motion (window open/close), CSS transitions (maximize/restore)
- **Canvas** — Custom pixel animation desktop background (`DesktopBg`)
- **Fonts** — Orbitron, Share Tech Mono, Rajdhani, Bebas Neue, Cinzel, Special Elite (Google Fonts)
- **Deployment** — Vercel

---

## Features

### Desktop OS shell
- Draggable, resizable windows with minimize / close
- Green traffic light toggles fullscreen ↔ windowed (with smooth CSS transition)
- `Contact.wav` opens in compact windowed mode by default
- Animated pixel canvas background — 5×5 cells flicker through a navy→cyan palette with randomised pulse clusters
- KR//OS SVG logo as desktop wallpaper (Detroit-style corner brackets, glow filter)
- Taskbar with live clock and open-app indicators

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
src/
├── app/
│   ├── layout.tsx          # Root layout + font imports
│   └── page.tsx            # Mounts Desktop (dynamic, SSR off)
├── components/
│   ├── os/
│   │   ├── Desktop.tsx     # Desktop shell, window manager, icon grid
│   │   ├── DesktopBg.tsx   # Canvas pixel animation background
│   │   ├── Window.tsx      # Draggable window with maximize/restore
│   │   ├── Taskbar.tsx     # Bottom bar with clock
│   │   └── KROSLogo.tsx    # SVG logo component
│   └── apps/
│       ├── AboutApp.tsx
│       ├── ProjectsApp.tsx
│       ├── SkillsApp.tsx
│       ├── ExperienceApp.tsx
│       ├── ContactApp.tsx
│       └── TerminalApp.tsx
└── data/
    └── content.ts          # All portfolio content (profile, projects, skills, experience)
```

---

## Deployment

Deployed on **Vercel** via the GitHub integration. Push to `master` triggers an automatic production deploy.

---

## Author

**Kaustav Roy** — Design Consultant, Fractal
[linkedin.com/in/kaustavr19](https://linkedin.com/in/kaustavr19) · kaustavkr@gmail.com
