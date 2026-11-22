/* ──────────────────────────────────────────────────────────
   Ask KR-19 — the knowledge base.

   Built once, from content.ts, into two things:
     · ENTITIES — the nouns a question can be about (companies, roles,
       projects, skills/tools, awards, places…), each with the names a
       visitor might type for it and links to related entities.
     · DOCS — every passage of text on the site, indexed for BM25 so
       anything the templates can't answer can still be found.
   Nothing here is written by hand except a few alias hints; when the
   content changes, the answers change with it.
   ────────────────────────────────────────────────────────── */

import {
  profile, chapters, projects, skills, capabilityGroups, education, certifications,
  awardsFractal, awardsExternal, publications,
  type Chapter, type Mission, type Project, type ProjectBlock, type EvidenceLinkedCapability,
} from "@/data/content";
import { terms, words } from "./nlp";

export type OpenAct = { kind: "open"; app: string; projectId?: string } | { kind: "link"; url: string };

type Base = { id: string; name: string; aliases: string[][] };
export type Company = Base & { kind: "company"; chapter: Chapter };
export type Role = Base & { kind: "role"; mission: Mission; chapter: Chapter; company: string };
export type ProjectEnt = Base & { kind: "project"; project: Project };
export type Skill = Base & { kind: "skill"; level?: number; cap?: EvidenceLinkedCapability; projects: Project[]; roles: Role[] };
export type Award = Base & { kind: "award"; year: string; org: "Fractal" | "External" };
export type Cert = Base & { kind: "cert"; org: string };
export type Place = Base & { kind: "place"; roles: Role[]; home: boolean };
export type Edu = Base & { kind: "education" };
export type Entity = Company | Role | ProjectEnt | Skill | Award | Cert | Place | Edu;

export type Doc = {
  id: string;
  title: string; // shown as the source line
  text: string;
  tf: Map<string, number>;
  len: number;
  act?: OpenAct;
  ent?: Entity;
};

/* Single words too vague to stand alone as a name for something. */
export const GENERIC = new Set([
  "design", "designer", "research", "user", "thinking", "creative", "problem", "solving", "enterprise", "data",
  "product", "products", "system", "language", "ai", "ux", "collab", "cross", "functional", "b2b", "saas", "website",
  "intelligence", "operation", "project", "platform", "digital", "twin", "generator", "repo", "skill", "claude",
  "india", "wild", "basic", "interaction", "information", "human", "loop", "the", "stakeholder", "interview",
  "workflow", "agent", "compose", "realignment", "staff", "member", "consultant", "insurance", "cpg", "cogentiq",
  "for", "and", "of", "to", "in", "on", "with", "x", "art", "first", "local", "game", "track", "winner", "award",
  "google", "adobe", "eugenie", "fractal", "open", "source", "tool", "tooling", "reusable", "enablement", "evidence",
  "aware", "building", "live", "status", "impact", "result", "role", "code", "link", "work", "thinking", "visual",
]);

const COMPANY_NAME: Record<string, string> = { fractal: "Fractal Analytics", eugenie: "Eugenie.ai" };
const COMPANY_ALIASES: Record<string, string[]> = { fractal: ["fractal", "fractal analytics"], eugenie: ["eugenie", "eugenie ai"] };

/* Hand hints for roles — their titles are too generic to match alone. */
const ROLE_ALIASES: Record<string, string[]> = {
  intern: ["intern", "internship", "design intern", "first job"],
  "design-staff-2": ["design staff", "member of design staff", "staff ii"],
  "cogentiq-bi": ["cogentiq", "cogentiq ai", "ai for bi", "bi", "business intelligence"],
  cpg: ["cpg", "cpg products", "consumer goods"],
  insurance: ["insurance products", "insurance role", "insurance team"],
};
const ROLE_ID: Record<string, string> = {
  "DESIGN INTERN": "intern", "DESIGN STAFF II": "design-staff-2", "COGENTIQ AI / BI": "cogentiq-bi",
  "CPG PRODUCTS": "cpg", "INSURANCE PRODUCTS": "insurance",
};

const PROJECT_ALIASES: Record<string, string[]> = {
  underwriting: ["underwriting", "operation underwriting", "insurance project", "insurance platform", "ai underwriting"],
  "agent-compose": ["agent compose", "agentwin", "agent management"],
  "cogentiq-dls": ["dls", "cogentiq design language", "cogentiq dls", "design language system"],
  "eugenie-digital-twin": ["digital twin", "eugenie platform", "sustainability platform"],
  nexval: ["nexval", "nexval ai", "mortgage website"],
};

const SKILL_ALIASES: Record<string, string[]> = {
  "html5 css3": ["html", "css", "html css", "frontend", "front end"],
  "sql python basic": ["sql", "python", "coding", "code"],
  "explainable ai xai": ["explainable", "explainable ai", "xai"],
  "accessibility wcag": ["accessibility", "wcag", "a11y", "wcag aaa"],
  "cross functional collab": ["collaboration", "cross functional", "working with engineers", "working with developers"],
  "design system": ["design system", "design systems", "component library", "design tokens"],
  "design ai": ["design for ai", "ai design", "designing for ai", "ai ux"],
  "human loop": ["human in the loop", "hitl"],
  "user research": ["user research", "ux research", "usability testing", "interviews"],
  "information visualization": ["data visualization", "dataviz", "data viz", "visualization", "charts"],
  "figma": ["figma"],
  "claude code": ["claude code", "claude"],
};

const key = (s: string) => terms(s).join(" ");
const aliasList = (list: string[]) => list.map((a) => terms(a)).filter((t) => t.length);

/* Name → aliases: the whole name, its parts split on (), /, ·, —, and
   any distinctive single word in it. */
function nameAliases(name: string, extra: string[] = []): string[][] {
  const out = new Set<string>();
  const add = (s: string) => {
    const t = terms(s).join(" ");
    if (t) out.add(t);
  };
  add(name);
  for (const part of name.split(/[()/·—–,]|\s-\s/)) add(part);
  for (const w of words(name)) {
    const t = terms(w)[0];
    if (t && t.length >= 4 && !GENERIC.has(t) && !GENERIC.has(w)) out.add(t);
    const bare = w.replace(/\d+$/, "");
    if (bare !== w && bare.length >= 3) add(bare);
  }
  for (const e of extra) add(e);
  return [...out].map((s) => s.split(" "));
}

/* ── Build ── */

export const COMPANIES: Company[] = chapters.map((c) => ({
  kind: "company",
  id: c.id,
  name: COMPANY_NAME[c.id] ?? c.title,
  aliases: aliasList(COMPANY_ALIASES[c.id] ?? [c.title]),
  chapter: c,
}));

export const ROLES: Role[] = chapters.flatMap((c) =>
  c.missions.map((m) => {
    const id = ROLE_ID[m.title] ?? m.id;
    return {
      kind: "role" as const,
      id,
      name: m.role,
      aliases: aliasList(ROLE_ALIASES[id] ?? [m.title]),
      mission: m,
      chapter: c,
      company: COMPANY_NAME[c.id] ?? c.title,
    };
  }),
);

export const PROJECTS: ProjectEnt[] = projects.map((p) => {
  const short = p.name.replace(/^(Operation|Project)\s+/i, "").split(/\s[—–-]\s/)[0];
  return { kind: "project", id: p.id, name: p.name, aliases: nameAliases(short, [p.name, ...(PROJECT_ALIASES[p.id] ?? [])]), project: p };
});

/* Skills and tools: the rated skills, the evidence-linked capabilities, and
   every tag / "weapon" used on a project or role, merged by name. */
const skillMap = new Map<string, Skill>();
function skillFor(name: string): Skill {
  const k = key(name);
  let s = skillMap.get(k);
  if (!s) {
    // A tag that is just a generic word ("AI", "Design") can't be asked about by name.
    const generic = !k.includes(" ") && GENERIC.has(k);
    s = { kind: "skill", id: k, name, aliases: generic ? [] : nameAliases(name, SKILL_ALIASES[k] ?? []), projects: [], roles: [] };
    skillMap.set(k, s);
  }
  return s;
}
for (const s of Object.values(skills).flat()) skillFor(s.name).level = s.level;
for (const cap of Object.values(capabilityGroups).flat()) {
  const s = skillFor(cap.name);
  s.cap = cap;
  for (const ev of cap.evidence) {
    const p = projects.find((x) => x.id === ev.projectId);
    if (p && !s.projects.includes(p)) s.projects.push(p);
  }
}
for (const p of projects) for (const t of p.tags) { const s = skillFor(t); if (!s.projects.includes(p)) s.projects.push(p); }
for (const r of ROLES) for (const w of r.mission.weapons) { const s = skillFor(w); if (!s.roles.includes(r)) s.roles.push(r); }
export const SKILLS: Skill[] = [...skillMap.values()];

export const AWARDS: Award[] = [
  ...awardsFractal.map((a) => ({ ...a, org: "Fractal" as const })),
  ...awardsExternal.map((a) => ({ ...a, org: "External" as const })),
].map((a) => ({
  kind: "award",
  id: key(a.title),
  name: a.title,
  year: a.year,
  org: a.org,
  aliases: nameAliases(a.title, /google i\/o/i.test(a.title) ? ["google io", "io 2024", "google i o", "google"] : /eureka/i.test(a.title) ? ["eureka"] : []),
}));

export const CERTS: Cert[] = certifications.map((c) => ({ kind: "cert", id: key(c.title), name: c.title, org: c.org, aliases: nameAliases(c.title) }));

const placeRoles = (re: RegExp) => ROLES.filter((r) => re.test(r.mission.location));
export const PLACES: Place[] = [
  { kind: "place", id: "kolkata", name: "Kolkata", home: true, roles: [], aliases: aliasList(["kolkata", "calcutta", "west bengal"]) },
  { kind: "place", id: "bengaluru", name: "Bengaluru", home: false, roles: placeRoles(/bengaluru/i), aliases: aliasList(["bengaluru", "bangalore", "blr"]) },
  { kind: "place", id: "mumbai", name: "Mumbai", home: false, roles: placeRoles(/mumbai/i), aliases: aliasList(["mumbai", "bombay"]) },
];

export const EDU: Edu = { kind: "education", id: "uem", name: education.institution, aliases: aliasList(["uem", "university of engineering and management", "b tech", "btech", "cgpa", "gpa"]) };

export const ENTITIES: Entity[] = [...COMPANIES, ...ROLES, ...PROJECTS, ...SKILLS, ...AWARDS, ...CERTS, ...PLACES, EDU];

/* Every company, project and skill name the site knows, for closed-world
   answers ("did he work at X?" → "not that I know of"). */
export const KNOWN_WORDS = new Set(ENTITIES.flatMap((e) => e.aliases.flat()));

/* ── Documents for search ── */

function blockText(b: ProjectBlock): string {
  switch (b.kind) {
    case "para": case "subhead": return b.text;
    case "callout": return `${b.label}: ${b.text}`;
    case "stats": return b.items.map((i) => `${i.value} ${i.label}${i.sub ? ` (${i.sub})` : ""}.`).join(" ");
    case "pillars": return b.items.map((i) => `${i.title}: ${i.sub}.`).join(" ");
    case "list": return b.items.map((i) => (typeof i === "string" ? i : `${i.lead} ${i.text}`)).join(" ");
    case "findings": return b.items.map((i) => `${i.label}: ${i.text}`).join(" ");
    case "figures": return [b.caption, ...b.items.map((f) => f.caption ?? "")].filter(Boolean).join(" ");
    case "compare": return b.rows.map(([a, c]) => `${a} → ${c}.`).join(" ");
    case "credits": return b.items.map((i) => `${i.name} (${i.role})`).join(", ");
  }
}

const docs: Omit<Doc, "tf" | "len">[] = [];
const openProject = (p: Project): OpenAct => ({ kind: "open", app: "projects", projectId: p.id });

docs.push({ id: "about", title: "About", text: `${profile.bio} Based in ${profile.location}.`, act: { kind: "open", app: "about" } });
for (const r of ROLES) {
  docs.push({
    id: `role:${r.id}`,
    title: `${r.name} · ${r.company}`,
    text: `${r.name} at ${r.company}, ${r.mission.period}, ${r.mission.location}. ${r.mission.objectives.map((o) => o.text).join(". ")}. Skills: ${r.mission.weapons.join(", ")}.`,
    act: { kind: "open", app: "experience" },
    ent: r,
  });
}
for (const pe of PROJECTS) {
  const p = pe.project;
  docs.push({
    id: `project:${p.id}`,
    title: p.name,
    text: [p.tagline, p.description, p.summary, p.role, p.debrief, p.objectives?.map((o) => o.text).join(". "), p.intel?.map((i) => `${i.value} ${i.label}`).join(". "), `Tags: ${p.tags.join(", ")}.`]
      .filter(Boolean)
      .join(" "),
    act: openProject(p),
    ent: pe,
  });
  for (const sec of p.dossier ?? []) {
    docs.push({ id: `project:${p.id}:${sec.title}`, title: `${p.name} — ${sec.title.toLowerCase()}`, text: sec.blocks.map(blockText).join(" "), act: openProject(p), ent: pe });
  }
}
for (const cap of Object.values(capabilityGroups).flat()) {
  docs.push({
    id: `cap:${cap.name}`,
    title: `Skills — ${cap.name}`,
    text: `${cap.claim} Methods: ${cap.methods.join(", ")}. ${cap.evidence.map((e) => `${e.signal}: ${e.detail}`).join(" ")}`,
    act: { kind: "open", app: "skills" },
    ent: skillMap.get(key(cap.name)),
  });
}
docs.push({ id: "education", title: "Education", text: `${education.degree}, ${education.institution}, ${education.period}, CGPA ${education.cgpa}. Certifications: ${certifications.map((c) => `${c.title} (${c.org})`).join(", ")}.`, act: { kind: "open", app: "about" }, ent: EDU });
docs.push({ id: "awards", title: "Awards", text: AWARDS.map((a) => `${a.name} (${a.year})`).join(". ") + ".", act: { kind: "open", app: "about" } });
docs.push({ id: "writing", title: "Writing", text: publications.map((p) => `${p.title} — ${p.venue}`).join(". ") + ".", act: { kind: "link", url: profile.social.medium } });

export function indexDoc(d: Omit<Doc, "tf" | "len">): Doc {
  const t = terms(`${d.title} ${d.text}`);
  const tf = new Map<string, number>();
  for (const w of t) tf.set(w, (tf.get(w) ?? 0) + 1);
  return { ...d, tf, len: t.length };
}

export const DOCS: Doc[] = docs.map(indexDoc);
