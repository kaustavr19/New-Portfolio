# Changelog

This file records meaningful visitor-facing and platform changes to KR//OS. The interface still identifies as `v2.077`; entries below describe the evolution within that release line.

## Unreleased — Audience-aware journeys and deeper OS interactions

### Added

- Three remembered visitor routes:
  - recruiter / hiring team
  - founder / collaborator
  - curious explorer
- Route-aware first-run onboarding with a tailored recommended destination for each audience.
- A searchable Command Center opened with `Ctrl/Cmd + K`.
- Audience-aware recommended commands for recruiter, collaborator, and explorer routes.
- Direct desktop app shortcuts with `Alt + 1–7`.
- Minimize-all and close-all workspace actions.
- Active visitor-route controls in the Start menu and mobile home screen.
- Command Center keyboard focus trapping, Escape handling, and focus restoration.

### Changed

- The first-run personnel brief now asks why someone is visiting before choosing the next experience.
- The Start menu now combines the visitor route, recent app, pinned apps, system actions, and reboot in a scroll-safe layout.
- Desktop context actions now include Command Center access and workspace management.

## 2026-07-26 — Contact conversion and accessibility

### Added

- Inquiry routing for product roles, portfolio reviews, project collaboration, and speaking or writing.
- Context-specific message prompts and inquiry intent in submitted email subjects and bodies.
- Shared end-of-journey contact prompts in Projects, Experience, Skills, and Reader Mode.
- Inline invalid-email guidance and explicit submission status announcements.

### Changed

- Increased Contact typography, field sizing, labels, buttons, and contrast.
- Expanded the desktop Contact window for more comfortable reading.
- Reworked both desktop and mobile Contact layouts around semantic forms, persistent labels, autocomplete metadata, required states, and visible keyboard focus.
- Reduced waveform motion when Reduce Motion is active and removed scanlines in High Contrast mode.

## 2026-07-26 — Evidence-linked capabilities

### Changed

- Reframed `Skills.tree` from a list of proficiency claims into evidence-linked capabilities.
- Connected capabilities to relevant projects, roles, outcomes, and credentials.
- Improved capability summaries so recruiters can move from a skill claim to supporting evidence without hunting through the portfolio.

## 2026-07-26 — Personnel brief and recruiter access

### Added

- A first-run personnel dossier with identity, positioning, and concise proof signals.
- A recruiter-oriented readable portfolio view.
- A persistent `RECRUITER BRIEF` entry inside About.
- A standalone desktop `RESUME.PDF` icon.

### Changed

- Simplified the taskbar and Start-menu information hierarchy.
- Returned ambient system telemetry to the taskbar.
- Made the personnel brief reopenable after the first visit.

## 2026-07-26 — Reader, sound, status, and performance

### Added

- Site-wide Reader Mode spanning About, capabilities, Experience, Projects, and contact paths.
- Printable recruiter-friendly output.
- Gesture-gated synthesized ambience and UI sound controls.
- Live system-status telemetry.

### Changed

- Lazy-loaded optional WebGL experiments.
- Paused or reduced unnecessary motion and background work when accessibility settings or window focus require it.
- Improved deep-link handling across desktop and mobile shells.

## Earlier foundations

- Desktop and mobile OS shells with themed portfolio applications.
- Shareable app and project deep links.
- Responsive app-specific mobile layouts.
- Deviant Mode, accessibility preferences, experimental WebGL layers, synthesized audio, and animated canvas wallpaper.
- Real Contact delivery through a Next.js route handler and Resend.
