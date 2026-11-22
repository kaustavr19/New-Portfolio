/* ──────────────────────────────────────────────────────────
   KR//OS Terminal engine — Minecraft-flavoured.

   Pure logic (no React): takes a raw input string and returns
   lines to print + an optional side-effect `action` the component
   runs (open an app window, open a link, toggle OS state, clear,
   fire an advancement toast).

   Two layers:
     1. Commands — slash-or-plain verbs (/help, open, resume, …).
     2. Ask KR-19 — anything else is a question, answered by the
        no-AI engine in ./ask (templates over content.ts, the FAQ,
        and search), with follow-up chips.

   Text supports Minecraft §-colour codes (parsed in the component):
     §7 gray  §a green  §6 gold  §e yellow  §b aqua  §c red  §f white
   ────────────────────────────────────────────────────────── */

import {
  profile, experience, projects, skills,
  education, certifications, awardsFractal, awardsExternal, publications,
} from "@/data/content";
import { askKR, resetAsk, type Chip } from "./ask/ask";

export type { Chip, ChipAct } from "./ask/ask";

/* Free text → the answer engine. */
function ask(input: string): TermResult {
  const r = askKR(input);
  return { lines: r.lines.map(out), chips: r.chips };
}

export type TermLineType = "input" | "output" | "error" | "system";
export type TermLine = { type: TermLineType; text: string };

export type TermAction =
  | { kind: "clear" }
  | { kind: "open"; app: string; projectId?: string }
  | { kind: "link"; url: string }
  | { kind: "toggleDeviant" }
  | { kind: "setTheme"; theme: "ink" | "classic" }
  | { kind: "toggleWallpaper" }
  | { kind: "advancement"; title: string; desc: string };

/* `chips` are follow-up buttons from the answer engine (Ask KR-19); shells that
   don't render them can ignore them. */
export type TermResult = { lines: TermLine[]; action?: TermAction; chips?: Chip[] };

const out = (text: string): TermLine => ({ type: "output", text });
const err = (text: string): TermLine => ({ type: "error", text });

/* 10-segment Minecraft XP-style bar. */
function bar(level: number): string {
  const filled = Math.round(level / 10);
  return `§a${"█".repeat(filled)}§8${"░".repeat(10 - filled)}`;
}

const FLAT_SKILLS = Object.values(skills).flat();


/* App aliases for `open <app>` / `/tp <app>`. */
const APP_ALIASES: Record<string, string> = {
  about: "about", me: "about", bio: "about", who: "about",
  projects: "projects", builds: "projects", work: "projects",
  skills: "skills", abilities: "skills", perks: "skills",
  experience: "experience", career: "experience", history: "experience", log: "experience",
  contact: "contact", hire: "contact", email: "contact",
  settings: "settings", config: "settings", prefs: "settings",
  terminal: "terminal",
};

/* `open <project-id-or-name>` — lets the terminal deep-link straight into
   a specific mission dossier, not just the Projects app in general. */
function findProject(query: string) {
  const q = query.toLowerCase().trim();
  return projects.find((p) => p.id === q || p.name.toLowerCase() === q);
}

/* ── Canned command responders ── */
function cmdHelp(): TermLine[] {
  return [
    "§6═══ KR//OS COMMAND BOOK ═══",
    "§e/help§7 ......... this list",
    "§e/about§7 ........ who is Kaustav",
    "§e/skills§7 ....... abilities & enchantments",
    "§e/projects§7 ..... personal builds",
    "§e/experience§7 ... work history",
    "§e/education§7 .... where he leveled up",
    "§e/awards§7 ....... advancements earned",
    "§e/writing§7 ...... articles & talks",
    "§e/contact§7 ...... reach the player",
    "§e/resume§7 ....... download the CV",
    "§eopen <app>§7 .... launch an app window §8(about|projects|skills|…)",
    "§e/clear§7 ........ wipe the chat",
    "§eink§7 / §eclassic§7 .. switch the OS theme",
    "§7—",
    "§bOr just ask me anything§7, e.g. §f\"does he know Figma?\"§7 or §f\"where does he work?\"",
  ].map(out);
}

function cmdAbout(): TermLine[] {
  return [
    "§6┌─ PLAYER PROFILE ──────────────",
    `§7 NAME    §f${profile.name} §8(${profile.unit})`,
    `§7 CLASS   §f${profile.designation}`,
    `§7 GUILD   §fFractal §8· ${profile.tenure}`,
    `§7 FOCUS   §f${profile.tagline}`,
    `§7 SPAWN   §f${profile.location}`,
    "§6└───────────────────────────────",
    `§7${profile.bioShort}`,
    "§8Try §e/skills§8, §e/experience§8, or just ask a question.",
  ].map(out);
}

function cmdSkills(arg?: string): TermLine[] {
  if (arg) {
    const hit = FLAT_SKILLS.find((s) => s.name.toLowerCase().includes(arg.toLowerCase()));
    if (hit) return [`§7${hit.name.padEnd(22)} ${bar(hit.level)} §f${hit.level}§8/100`].map(out);
  }
  const top = [...FLAT_SKILLS].sort((a, b) => b.level - a.level).slice(0, 8);
  return [
    "§6═══ ENCHANTMENTS (top 8) ═══",
    ...top.map((s) => `§7${s.name.padEnd(22)} ${bar(s.level)} §f${s.level}`),
    "§8Ask §e\"do you know <tool>?\"§8 to check any specific skill.",
  ].map(out);
}

function cmdProjects(): TermLine[] {
  const statusColor: Record<string, string> = {
    "IN PROGRESS": "§e", "LIVE": "§a", "SHIPPED": "§b",
  };
  return [
    "§6═══ PERSONAL BUILDS ═══",
    ...projects.flatMap((p) => [
      `§a▸ ${p.name} §8— §7${p.tagline} ${statusColor[p.status] ?? "§7"}[${p.status}]`,
      `§8   ${p.description}`,
    ]),
  ].map(out);
}

function cmdExperience(): TermLine[] {
  return [
    "§6═══ WORLD HISTORY ═══",
    ...experience.flatMap((e) => [
      `§e${e.period}`,
      `§f ${e.role}`,
      `§7 ${e.company} §8· ${e.location}`,
    ]),
  ].map(out);
}

function cmdEducation(): TermLine[] {
  return [
    "§6═══ TRAINING GROUNDS ═══",
    `§f${education.degree}`,
    `§7${education.institution}`,
    `§8${education.period} · CGPA ${education.cgpa}`,
    "§7Certifications: §f" + certifications.map((c) => c.title).join("§8, §f"),
  ].map(out);
}

function cmdAwards(): TermLine[] {
  return [
    "§6═══ ADVANCEMENTS ═══",
    "§e[Fractal]",
    ...awardsFractal.map((a) => `§a ✦ §f${a.title} §8(${a.year})`),
    "§e[External]",
    ...awardsExternal.map((a) => `§b ✦ §f${a.title} §8(${a.year})`),
  ].map(out);
}

function cmdWriting(): TermLine[] {
  return [
    "§6═══ SCROLLS & TALKS ═══",
    ...publications.map((p) => `§a▸ §f${p.title} §8— ${p.venue}`),
  ].map(out);
}

function cmdContact(): TermResult {
  return {
    lines: [
      "§6═══ /msg KAUSTAV ═══",
      `§7 EMAIL    §b${profile.social.email}`,
      `§7 LINKEDIN §b${profile.social.linkedin.replace("https://www.", "")}`,
      `§7 MEDIUM   §b${profile.social.medium.replace("https://", "")}`,
      "§a ◆ Status: open to interesting problems.",
      "§8Use §e/resume§8 for the CV, or §eemail§8 to open your mail client.",
    ].map(out),
  };
}

/* ── Top-level dispatch ── */
export function runTerminal(raw: string): TermResult {
  const input = raw.trim();
  if (!input) return { lines: [] };

  // Allow a leading slash; split verb + args.
  const cleaned = input.replace(/^\//, "");
  const [verb, ...rest] = cleaned.split(/\s+/);
  const v = verb.toLowerCase();
  const arg = rest.join(" ");

  switch (v) {
    case "help": case "?": case "commands": return { lines: cmdHelp() };
    case "about": case "whoami": return { lines: cmdAbout() };
    case "skills": case "abilities": return { lines: cmdSkills(arg) };
    case "projects": case "builds": return { lines: cmdProjects() };
    case "experience": case "exp": case "career": return { lines: cmdExperience() };
    case "education": case "edu": return { lines: cmdEducation() };
    case "awards": case "advancements": return { lines: cmdAwards() };
    case "writing": case "blog": case "articles": case "publications": return { lines: cmdWriting() };
    case "contact": return cmdContact();
    case "resume": case "cv":
      return { lines: ["§aOpening résumé… §8(/Kaustav_Roy_CV.pdf)"].map(out), action: { kind: "link", url: "/Kaustav_Roy_CV.pdf" } };
    case "email":
      return { lines: [`§aOpening mail to §b${profile.social.email}§a…`].map(out), action: { kind: "link", url: `mailto:${profile.social.email}` } };
    case "linkedin":
      return { lines: ["§aOpening LinkedIn…"].map(out), action: { kind: "link", url: profile.social.linkedin } };
    case "medium":
      return { lines: ["§aOpening Medium…"].map(out), action: { kind: "link", url: profile.social.medium } };
    case "clear": case "cls":
      resetAsk();
      return { lines: [], action: { kind: "clear" } };
    case "ls": case "dir": case "apps": {
      const target = arg.trim().replace(/\/+$/, "").toLowerCase();
      if (target === "projects" || target === "builds" || target === "missions") {
        const mains = projects.filter((p) => p.type === "main");
        const contracts = projects.filter((p) => p.type === "consulting");
        const sides = projects.filter((p) => p.type === "side");
        return {
          lines: [
            "§6Main missions:",
            ...mains.map((p) => `§f  ${p.id}§8 — ${p.name}`),
            "§6Contracts:",
            ...contracts.map((p) => `§f  ${p.id}§8 — ${p.name}`),
            "§6Side missions:",
            ...sides.map((p) => `§f  ${p.id}§8 — ${p.name}`),
            "§8open one with §eopen <id>§8, e.g. §eopen underwriting",
          ].map(out),
        };
      }
      return {
        lines: [
          "§6Apps: §fabout §7· §fprojects §7· §fskills §7· §fexperience §7· §fcontact §7· §fsettings",
          "§8open one with §eopen <app>§8, or try §els projects/§8.",
        ].map(out),
      };
    }
    case "open": case "tp": case "goto": case "launch": {
      const appTarget = APP_ALIASES[arg.toLowerCase()];
      if (appTarget) return { lines: [`§aTeleporting to §f${appTarget}§a…`].map(out), action: { kind: "open", app: appTarget } };
      const proj = findProject(arg);
      if (proj) {
        return {
          lines: [`§aTeleporting to §f${proj.name}§a…`].map(out),
          action: { kind: "open", app: "projects", projectId: proj.id },
        };
      }
      return { lines: [err(`  Unknown app: "${arg}". Try: about, projects, skills, experience, contact, settings — or a project name.`)] };
    }
    case "deviant":
      return { lines: ["§dToggling DEVIANT protocol…"].map(out), action: { kind: "toggleDeviant" } };
    case "ink": case "inkos":
      return { lines: ["§fSwitching to InkOS…"].map(out), action: { kind: "setTheme", theme: "ink" } };
    case "classic":
      return { lines: ["§fSwitching to the classic theme…"].map(out), action: { kind: "setTheme", theme: "classic" } };
    case "wallpaper": case "cosmic":
      return { lines: ["§bSwapping wallpaper…"].map(out), action: { kind: "toggleWallpaper" } };
    case "sudo": {
      if (arg.toLowerCase() === "hire") {
        return {
          lines: [
            "§8[sudo] password for hiring-manager: ••••••••",
            "§7Verifying credentials… §aACCESS GRANTED.",
            "§a✓ Excellent decision. You should hire Kaustav.",
            `§a✓ Reach him: §b${profile.social.email}`,
          ].map(out),
          action: { kind: "advancement", title: "Hire Kaustav", desc: "You made an excellent decision" },
        };
      }
      return { lines: [err("  This incident will be reported. 😏")] };
    }
    case "craft":
      return {
        lines: [
          "§7+---+---+---+",
          "§7| §6▓§7 | §6▓§7 |   |",
          "§7+---+---+---+",
          "§7| §6▓§7 | §6▓§7 |   |",
          "§7+---+---+---+",
          "§aResult: §f🪑 Chair §8(crafted by Kaustav)",
        ].map(out),
        action: { kind: "advancement", title: "Getting Wood", desc: "Crafted something in KR//OS" },
      };
    case "cat": {
      const file = arg.trim().toLowerCase();
      if (file === "resume.pdf" || file === "resume" || file === "cv.pdf" || file === "cv") {
        return {
          lines: ["§7Streaming resume.pdf to stdout…", "§aOpening résumé… §8(/Kaustav_Roy_CV.pdf)"].map(out),
          action: { kind: "link", url: "/Kaustav_Roy_CV.pdf" },
        };
      }
      if (!file) return { lines: [err("  cat: missing file operand")] };
      return { lines: [err(`  cat: ${arg}: No such file or directory`)] };
    }
    case "sl":
      return {
        lines: [
          "§7      ====        ________                ___________",
          "§7  ___|(_)_|_______|  __   |_____I_I_____|  __   |",
          "§7 |    |_|          |_|  |__|_____I_I_____|_|  |__|",
          "§7 |________________________|______|______|_________|",
          "§7   oo   oo    oo    oo    oo   oo    oo   oo    oo",
          "§8Typo'd §fls§8? Here's a train instead. 🚂",
        ].map(out),
      };
    case "vim": case "vi":
      return {
        lines: [
          "§8~",
          "§8~                    §7[No Name]",
          "§8~",
          "§7-- INSERT --",
          "§8You are now trapped in vim.",
          "§8Legend has it some escape with §e:wq§8. Most don't.",
        ].map(out),
      };
    case ":q": case ":wq": case ":q!": case ":x":
      return {
        lines: [
          "§aCongratulations. §7You escaped Vim.",
          "§8Not everyone makes it out.",
        ].map(out),
        action: { kind: "advancement", title: "How Did We Get Here?", desc: "Escaped Vim" },
      };
    case "rm":
      if (arg.toLowerCase().includes("-rf")) {
        return { lines: [err("  Nice try. 😏 This isn't that kind of terminal.")] };
      }
      return { lines: [err(`  rm: ${arg || "missing operand"}: Permission denied`)] };
    case "42":
      return { lines: ["§6The Answer to the Ultimate Question of Life, the Universe, and Everything."].map(out) };
    default:
      // Not a command → answer engine.
      return ask(input);
  }
}

/* Completable command verbs for Tab. */
export const TERM_VERBS = [
  "help", "about", "skills", "projects", "experience", "education",
  "awards", "writing", "contact", "resume", "email", "linkedin", "medium",
  "open", "clear", "ink", "classic", "deviant", "wallpaper", "sudo hire", "craft",
  "cat", "sl", "vim", "rm",
];
