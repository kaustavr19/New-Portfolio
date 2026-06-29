/* ──────────────────────────────────────────────────────────
   KR//OS Terminal engine — Minecraft-flavoured.

   Pure logic (no React): takes a raw input string and returns
   lines to print + an optional side-effect `action` the component
   runs (open an app window, open a link, toggle OS state, clear,
   fire an advancement toast).

   Two layers:
     1. Commands — slash-or-plain verbs (/help, open, resume, …).
     2. Answer engine — free text is matched against intents +
        the site content (content.ts) so the terminal can answer
        questions about Kaustav, not just a fixed menu.

   Text supports Minecraft §-colour codes (parsed in the component):
     §7 gray  §a green  §6 gold  §e yellow  §b aqua  §c red  §f white
   ────────────────────────────────────────────────────────── */

import {
  profile, experience, projects, skills,
  education, certifications, awardsFractal, awardsExternal, publications,
} from "@/data/content";

export type TermLineType = "input" | "output" | "error" | "system";
export type TermLine = { type: TermLineType; text: string };

export type TermAction =
  | { kind: "clear" }
  | { kind: "open"; app: string }
  | { kind: "link"; url: string }
  | { kind: "toggleDeviant" }
  | { kind: "toggleWallpaper" }
  | { kind: "advancement"; title: string; desc: string };

export type TermResult = { lines: TermLine[]; action?: TermAction };

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

/* ── The free-text answer engine ── */
type Intent = { keys: string[]; weight?: number; run: (q: string) => TermResult };

const INTENTS: Intent[] = [
  {
    keys: ["hi", "hello", "hey", "yo", "sup", "greetings"],
    run: () => ({ lines: ["§aHey there! §7I'm KR//OS, Kaustav's terminal.", "§8Ask me about his work, skills, or projects — or type §e/help§8."].map(out) }),
  },
  {
    keys: ["who", "about", "yourself", "introduce", "kaustav"],
    run: () => ({ lines: cmdAbout() }),
  },
  {
    keys: ["where", "work", "job", "company", "fractal", "currently", "now", "based", "location", "live"],
    run: (q) => {
      if (/where.*(live|based|from)|location|city/.test(q)) {
        return { lines: [`§7Kaustav is based in §f${profile.location}§7.`].map(out) };
      }
      const cur = experience[0];
      return {
        lines: [
          `§7Right now he's a §f${cur.role}§7`,
          `§7at §f${cur.company}§7 §8(${cur.period})§7.`,
          `§8${cur.description}`,
        ].map(out),
      };
    },
  },
  {
    keys: ["experience", "history", "career", "past", "before", "previous", "roles"],
    run: () => ({ lines: cmdExperience() }),
  },
  {
    keys: ["skill", "skills", "good", "strength", "strengths", "expert", "best"],
    run: () => ({ lines: cmdSkills() }),
  },
  {
    keys: ["project", "projects", "built", "build", "side", "made"],
    run: () => ({ lines: cmdProjects() }),
  },
  {
    keys: ["study", "studied", "education", "degree", "college", "university", "cgpa", "uem"],
    run: () => ({ lines: cmdEducation() }),
  },
  {
    keys: ["award", "awards", "recognition", "honour", "honor", "google", "io"],
    run: () => ({ lines: cmdAwards() }),
  },
  {
    keys: ["write", "writing", "article", "articles", "blog", "medium", "publication", "talks"],
    run: () => ({ lines: cmdWriting() }),
  },
  {
    keys: ["contact", "hire", "hiring", "available", "reach", "email", "connect", "opportunity"],
    run: () => cmdContact(),
  },
  {
    keys: ["ai", "ml", "xai", "explainable", "underwriting", "enterprise", "human-in-the-loop", "hitl"],
    run: () => ({
      lines: [
        "§7Kaustav specializes in §fAI-powered enterprise UX§7 —",
        "§7human-in-the-loop decisioning, explainable AI, and",
        "§7workflows complex domains can actually trust.",
        `§8Currently: ${experience[0].role} @ ${experience[0].company}.`,
      ].map(out),
    }),
  },
  {
    keys: ["resume", "cv", "download"],
    run: () => ({ lines: ["§aOpening résumé… §8(/Kaustav_Roy_CV.pdf)"].map(out), action: { kind: "link", url: "/Kaustav_Roy_CV.pdf" } }),
  },
  {
    keys: ["thanks", "thank", "cool", "nice", "awesome", "great"],
    run: () => ({ lines: ["§aGG. §7Anything else? Try §e/projects§7 or §e/contact§7."].map(out) }),
  },
];

/* Score = keyword hits, lightly normalised. */
function answer(query: string): TermResult {
  const q = query.toLowerCase();
  const tokens = q.split(/[^a-z0-9+]+/).filter(Boolean);
  const tokenSet = new Set(tokens);

  // 1) Specific skill lookup — "do you know X" / "<tool>?"
  const skillHit = FLAT_SKILLS.find((s) => {
    const name = s.name.toLowerCase();
    return tokens.some((t) => t.length > 2 && (name.includes(t)));
  });

  // 2) Specific project lookup by name
  const projHit = projects.find((p) => q.includes(p.name.toLowerCase().replace("project ", "")));

  // 3) Best intent by keyword overlap
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    let score = 0;
    for (const k of intent.keys) if (tokenSet.has(k) || q.includes(k)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }

  // Decide: a confident intent wins; otherwise prefer a specific entity hit.
  if (best && best.score >= 2) return best.intent.run(q);
  if (projHit) {
    return {
      lines: [
        `§a▸ ${projHit.name} §8— §7${projHit.tagline} §8[${projHit.status}]`,
        `§7${projHit.description}`,
        `§8Stack: ${projHit.tags.join(", ")} · ${projHit.year}`,
      ].map(out),
    };
  }
  if (skillHit && (/know|can|able|good|familiar|use|experience|skill|\?/.test(q))) {
    const verdict = skillHit.level >= 85 ? "§aVery much so." : skillHit.level >= 70 ? "§aYes." : "§eSomewhat.";
    return { lines: [`${verdict} §f${skillHit.name} §7${bar(skillHit.level)} §f${skillHit.level}§8/100`].map(out) };
  }
  if (best) return best.intent.run(q);

  // 4) Fallback — light content search across experience descriptions
  const docHit = experience.find((e) =>
    tokens.some((t) => t.length > 3 && (e.description.toLowerCase().includes(t) || e.tags.join(" ").toLowerCase().includes(t)))
  );
  if (docHit) {
    return { lines: [`§e${docHit.period} §8· §f${docHit.role}`, `§8${docHit.description}`].map(out) };
  }

  return {
    lines: [
      `§7Hmm, I don't have a clean answer for §f"${query}"§7.`,
      "§8Try §e/help§8, or ask about his §eskills§8, §eprojects§8, §eexperience§8, or how to §ehire§8 him.",
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
      return { lines: [], action: { kind: "clear" } };
    case "ls": case "dir": case "apps":
      return { lines: ["§6Apps: §fabout §7· §fprojects §7· §fskills §7· §fexperience §7· §fcontact §7· §fsettings", "§8open one with §eopen <app>§8."].map(out) };
    case "open": case "tp": case "goto": case "launch": {
      const target = APP_ALIASES[arg.toLowerCase()];
      if (!target) return { lines: [err(`  Unknown app: "${arg}". Try: about, projects, skills, experience, contact, settings.`)] };
      return { lines: [`§aTeleporting to §f${target}§a…`].map(out), action: { kind: "open", app: target } };
    }
    case "deviant":
      return { lines: ["§dToggling DEVIANT protocol…"].map(out), action: { kind: "toggleDeviant" } };
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
    default:
      // Not a command → answer engine.
      return answer(input);
  }
}

/* Completable command verbs for Tab. */
export const TERM_VERBS = [
  "help", "about", "skills", "projects", "experience", "education",
  "awards", "writing", "contact", "resume", "email", "linkedin", "medium",
  "open", "clear", "deviant", "wallpaper", "sudo hire", "craft",
];
