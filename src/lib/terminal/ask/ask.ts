/* ──────────────────────────────────────────────────────────
   Ask KR-19 — the answer engine. No AI, no network.

   How a question is answered, in order:
     1. Declines   — salary, notice, personal → polite redirect to Contact
     2. Small talk — hello / thanks / "are you an AI?"
     3. FAQ        — hand-written answers (src/data/faq.ts), by pattern
     4. Templates  — parse WHAT is asked (how long / when / where / yes-no /
                     list / role / tools / impact / link / NDA…) and WHICH
                     things it's about (company, role, project, skill…),
                     then compute the answer from content.ts
     5. Search     — BM25 over every passage on the site; best sentence wins
     6. Miss       — say so, and point to the contact form

   It remembers what the conversation is about, so "tell me about Nexval"
   then "what was his role?" or "is it live?" resolve to Nexval.
   ────────────────────────────────────────────────────────── */

import {
  profile, projects, skills, education, certifications, publications,
  CAREER_START, FRACTAL_START, monthsSince, type Project,
} from "@/data/content";
import { DECLINES, FAQ, type FaqEntry } from "@/data/faq";
import {
  AWARDS, COMPANIES, DOCS, ENTITIES, GENERIC, KNOWN_WORDS, PROJECTS, ROLES,
  type Company, type Doc, type Entity, type OpenAct, type ProjectEnt, type Role, type Skill,
} from "./kb";
import { allTerms, clip, fuzzyEq, norm, sentences, terms, words } from "./nlp";

export type ChipAct = OpenAct | { kind: "ask"; q: string };
export type Chip = { label: string; act: ChipAct };
export type AskVia = "decline" | "smalltalk" | "faq" | "template" | "search" | "miss";
export type AskResult = { lines: string[]; chips: Chip[]; via: AskVia };

/* ── Conversation memory ── */
let focus: Entity | null = null;
export function resetAsk() {
  focus = null;
}

/* ── Small helpers ── */
const CONTACT: Chip = { label: "Contact →", act: { kind: "open", app: "contact" } };
const ask = (label: string, q = label): Chip => ({ label, act: { kind: "ask", q } });
const openProject = (p: Project, label = `Open ${shortName(p)} →`): Chip => ({ label, act: { kind: "open", app: "projects", projectId: p.id } });
const shortName = (p: Project) => p.name.replace(/^(Operation|Project)\s+/i, "").split(/\s[—–-]\s/)[0];
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const res = (lines: string[], chips: Chip[] = [], via: AskVia = "template"): AskResult => ({ lines, chips: chips.slice(0, 4), via });

const MON: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function startOf(period: string) {
  const m = norm(period).match(/([a-z]{3})[a-z]*\s+(\d{4})/);
  return m && MON[m[1]] ? { year: Number(m[2]), month: MON[m[1]] } : null;
}
export function fmtMonths(n: number) {
  const y = Math.floor(n / 12), m = n % 12;
  const ys = y ? `${y} yr${y > 1 ? "s" : ""}` : "", ms = m ? `${m} mo${m > 1 ? "s" : ""}` : "";
  return [ys, ms].filter(Boolean).join(" ") || "under a month";
}
const isPresent = (period: string) => /present/i.test(period);
function durationOf(period: string, given?: string) {
  if (isPresent(period)) {
    const s = startOf(period);
    if (s) return `${fmtMonths(monthsSince(s))} and counting`;
  }
  return given ?? period;
}

const CURRENT_ROLE = ROLES[ROLES.length - 1];
const CURRENT_PROJECT = projects.find((p) => p.type === "main" && /progress/i.test(p.status)) ?? projects[0];
const RATED = Object.values(skills).flat();
const TOOLS = skills.technical.map((s) => s.name);

/* Projects tied to each role (the work was done in that role). */
const ROLE_PROJECTS: Record<string, string[]> = {
  insurance: ["underwriting"],
  "cogentiq-bi": ["cogentiq-dls", "agent-compose"],
  "design-staff-2": ["eugenie-digital-twin"],
  intern: ["eugenie-digital-twin"],
};
const projectsOfCompany = (c: Company) => projects.filter((p) => p.role && norm(p.role).includes(c.id));

/* ── Question parsing ── */
type Q = {
  raw: string;
  low: string;
  t: string[];
  has: (re: RegExp) => boolean;
  ents: Entity[];
  pronoun: boolean;
};

function parse(raw: string): Q {
  const low = norm(raw).replace(/^(so|ok(ay)?|hey|hi|um+|and|also|well)[, ]+/, "").trim();
  const t = terms(low);
  return { raw, low, t, has: (re) => re.test(low), ents: findEntities(low), pronoun: /\b(it|its|that|this|there|they|them|the (project|company|role|job|product|one)|that one|same)\b/.test(low) };
}

const T = {
  duration: /\bhow long\b|\bhow many (years|months)\b|\bsince when\b|\btenure\b|\byears? of (experience|exp)\b/,
  when: /\bwhen\b|\bwhat year\b|\bwhich year\b|\bwhat date\b/,
  where: /\bwhere\b|\bwhich city\b|\blocation\b|\bbased\b/,
  yesno: /^(does|did|has|have|is|was|can|could|do|are|were|would|will|has he|is he)\b/,
  list: /\b(which|list|all|show|name some|examples?|what (are|were) (his|the|some)|what (has|did) he (build|built|make|made|design|ship))\b/,
  count: /\bhow many\b/,
  role: /\b(role|title|position|designation|responsib|in charge|what (did|does|was|is) he (do|doing)|his part|his job)\b/,
  tools: /\b(tools?|stack|tech|technolog\w*|built (it )?(with|in|using)|made (it )?(with|in|using)|software|what did he use|framework)\b/,
  impact: /\b(impact|results?|outcomes?|metrics?|numbers|kpis?|achieve\w*|success|adoption|improv\w*|stats)\b/,
  status: /\b(status|finished|complete[d]?|shipped|launched|in progress|still (going|working|active)|is it (live|done|out))\b/,
  link: /\b(link|url|website|site|github|repo|source code|code|demo|see it|visit|try it)\b/,
  current: /\b(current(ly)?|right now|these days|at the moment|presently|nowadays|now)\b|\bworking on\b/,
  nda: /\b(nda|confidential|classified|screens?|screenshots?|client name|mockups?|visuals?|images?)\b/,
  best: /\b(best|strongest|top|favou?rite|proudest|biggest|main|key)\b/,
  first: /\bfirst\b/,
};

type Match = { e: Entity; start: number; len: number };

/* Words the site actually uses. A query word that is one of these is taken
   at face value — typo-matching only kicks in for words we don't know,
   so "aware" never turns into "award". */
let vocab: Set<string> | null = null;
const VOCAB = () => (vocab ??= new Set([...KNOWN_WORDS, ...DOCS.flatMap((d) => [...d.tf.keys()])]));

function findEntities(low: string): Entity[] {
  const t = allTerms(low);
  const known = t.map((w) => VOCAB().has(w));
  const hits: Match[] = [];
  for (const e of ENTITIES) {
    let best: Match | null = null;
    for (const a of e.aliases) {
      for (let i = 0; i + a.length <= t.length; i++) {
        let ok = true;
        for (let j = 0; j < a.length && ok; j++) ok = a[j].length <= 3 || known[i + j] ? a[j] === t[i + j] : fuzzyEq(a[j], t[i + j]);
        if (ok && (!best || a.length > best.len)) best = { e, start: i, len: a.length };
      }
    }
    if (best) hits.push(best);
  }
  // Drop matches that sit inside a longer one ("design" inside "design system").
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.len > h.len && o.start <= h.start && o.start + o.len >= h.start + h.len));
  const order: Entity["kind"][] = ["project", "role", "company", "award", "skill", "cert", "education", "place"];
  return kept.sort((a, b) => b.len - a.len || order.indexOf(a.e.kind) - order.indexOf(b.e.kind)).map((h) => h.e);
}

const pick = <K extends Entity["kind"]>(q: Q, ...kinds: K[]) => q.ents.find((e) => (kinds as string[]).includes(e.kind)) as Extract<Entity, { kind: K }> | undefined;

/* ── 1 · Declines ── */
function decline(q: Q): AskResult | null {
  const d = DECLINES.find((x) => x.re.test(q.low));
  if (!d) return null;
  return res([`§f${d.reply}`, "§7Leave him a note and he'll get back to you."], [CONTACT], "decline");
}

/* ── 2 · Small talk ── */
const EXAMPLES = [ask("What does he do?"), ask("How long at Fractal?"), ask("Does he know Figma?"), ask("Show side projects")];
function smalltalk(q: Q): AskResult | null {
  const n = words(q.low).length;
  if (n <= 3 && /^(hi|hello|hey|yo|sup|hola|namaste|howdy|good (morning|afternoon|evening))\b/.test(q.low))
    return res(["§fHey! §7I'm KR-19 — ask me anything about Kaustav's work.", "§8Try one of these:"], EXAMPLES, "smalltalk");
  if (n <= 4 && /\b(thanks|thank you|thx|ty|cheers|cool|nice|awesome|great|got it|perfect)\b/.test(q.low))
    return res(["§fAnytime. §7Anything else you'd like to know?"], [ask("Show his projects"), CONTACT], "smalltalk");
  if (/\b(who|what) are you\b|\bare you (a |an )?(ai|bot|robot|human|chat ?gpt|gpt|llm|real)\b|\bis this (ai|a bot|chat ?gpt)\b/.test(q.low))
    return res([
      "§fI'm KR-19, the terminal of Kaustav's portfolio.",
      "§7No AI here — I parse your question and match it against everything on this site, the pre-LLM way. If it isn't written down, I'll say so.",
    ], EXAMPLES.slice(0, 3), "smalltalk");
  // About the site itself — the colophon lives in Settings.
  if (/\b(this|the|your) (site|website|portfolio|os|terminal)\b/.test(q.low) && /\b(built|build|made|make|tech|stack|works?|code[d]?|framework|how)\b/.test(q.low))
    return res([
      "§fKR//OS is built as an operating system — designed and coded by Kaustav, in Next.js, React and TypeScript.",
      "§7The wallpaper is one canvas of fixed dots that follows the real Kolkata weather; the sound is synthesised live with Web Audio; and I answer you without AI, from this site's own content.",
    ], [{ label: "About this OS →", act: { kind: "open", app: "settings" } }], "smalltalk");
  if (/\bwhat can (i|you) (ask|do|answer)\b|\bwhat (should|do) i ask\b|\bexamples?\b/.test(q.low))
    return res(["§fAsk about his roles, projects, skills, tools, dates, awards or availability.", "§8For example:"], EXAMPLES, "smalltalk");
  return null;
}

/* ── 3 · FAQ ── */
function faqAnswer(f: FaqEntry): AskResult {
  if (f.answer) return res([`§f${f.answer}`, `§8— ${f.topic}`], [CONTACT], "faq");
  const lines = f.fromSite ? [`§7${f.fromSite}`] : [];
  lines.push(f.fromSite ? "§fFor a direct answer, ask him — he'll reply." : "§fHe hasn't written an answer to that here yet — best asked directly.");
  return res(lines, [CONTACT], "faq");
}
function faqByPattern(q: Q) {
  return FAQ.find((f) => f.re.some((re) => re.test(q.low))) ?? null;
}
function faqByOverlap(q: Q) {
  let best: { f: FaqEntry; s: number } | null = null;
  const qs = new Set(q.t);
  for (const f of FAQ)
    for (const p of f.ask) {
      const pt = terms(p);
      if (!pt.length) continue;
      const hit = pt.filter((w) => qs.has(w)).length;
      const s = hit / pt.length;
      if (pt.length >= 2 && hit >= 2 && s >= 0.67 && (!best || s > best.s)) best = { f, s };
    }
  return best?.f ?? null;
}

/* ── 4 · Templates ── */

function companyAnswer(q: Q, c: Company): AskResult {
  const ch = c.chapter;
  const roles = ROLES.filter((r) => r.chapter.id === c.id);
  const dur = durationOf(ch.period, ch.duration);
  const chips = [...projectsOfCompany(c).filter((p) => p.type === "main").slice(0, 2).map((p) => openProject(p)), { label: "Experience →", act: { kind: "open", app: "experience" } } as Chip];
  if (q.has(T.duration)) return res([`§f${dur} at ${c.name}.`, `§7${ch.period}, across ${roles.length} role${roles.length > 1 ? "s" : ""}.`], chips);
  if (q.has(T.when)) return res([`§f${ch.period}.`, `§7${c.name} — ${dur}.`], chips);
  if (q.has(T.where)) return res([`§f${c.name}: ${list([...new Set(roles.map((r) => r.mission.location))])}.`], chips);
  if (q.has(T.tools)) return res([`§f${list([...new Set(roles.flatMap((r) => r.mission.weapons))])}.`, `§8— skills used across his roles at ${c.name}`], chips);
  const lead = q.has(T.yesno) ? `§fYes — ${c.name}, ${ch.period}.` : `§f${c.name} §8· ${ch.period} · ${dur}`;
  return res([lead, ...roles.map((r) => `§7▸ ${r.name} §8· ${r.mission.period} · ${r.mission.location}`)], chips);
}

function roleAnswer(q: Q, r: Role): AskResult {
  const m = r.mission;
  const proj = (ROLE_PROJECTS[r.id] ?? []).map((id) => projects.find((p) => p.id === id)).filter(Boolean) as Project[];
  const chips: Chip[] = [...proj.slice(0, 2).map((p) => openProject(p)), { label: "Experience →", act: { kind: "open", app: "experience" } }];
  if (q.has(T.duration)) return res([`§f${durationOf(m.period, m.duration)}.`, `§7${r.name} at ${r.company}, ${m.period}.`], chips);
  if (q.has(T.when)) return res([`§f${m.period}.`, `§7${r.name} at ${r.company}.`], chips);
  if (q.has(T.where)) return res([`§f${m.location}.`, `§7${r.name} at ${r.company}.`], chips);
  if (q.has(T.tools)) return res([`§f${list(m.weapons)}.`, `§8— ${r.name}`], chips);
  const done = m.objectives.filter((o) => o.done).slice(0, 3);
  return res([`§f${r.name} §8· ${r.company}`, `§7${m.period} · ${m.location}`, ...done.map((o) => `§7▸ ${o.text}`)], chips);
}

function projectAnswer(q: Q, pe: ProjectEnt): AskResult {
  const p = pe.project;
  const open = openProject(p, p.type === "side" ? `Open ${shortName(p)} →` : "Read the case study →");
  const linkChip: Chip | null = p.live ? { label: `${p.live.label} ↗`, act: { kind: "link", url: p.live.href } } : p.github ? { label: "GitHub ↗", act: { kind: "link", url: p.github } } : null;
  const more = [ask("Impact?", `what was the impact of ${shortName(p)}`), ask("Tools?", `what tools for ${shortName(p)}`)];
  const base = [open, ...(linkChip ? [linkChip] : [])];

  if (q.has(T.nda) || (q.has(T.link) && p.classified && !linkChip)) {
    if (p.classified) return res([`§fParts of ${shortName(p)} are under NDA.`, `§7${p.classified}`], [CONTACT, open]);
    if (linkChip) return res([`§f${shortName(p)} is public — no NDA.`], base);
  }
  if (q.has(T.link)) {
    if (linkChip) return res([`§f${shortName(p)}: ${p.live?.href ?? p.github}`], base);
    return res([`§fThere's no public link for ${shortName(p)}.`, "§7The case study on this site is the walkthrough."], [open]);
  }
  if (q.has(T.tools)) return res([`§f${list(p.tags)}.`, `§8— ${p.name}`], [open, ...more.slice(0, 1)]);
  if (q.has(T.impact)) {
    if (p.intel?.length) return res([`§f${p.name} in numbers:`, ...p.intel.map((i) => `§7▸ §f${i.value} §7${i.label}`)], base);
    const done = p.objectives?.filter((o) => o.done) ?? [];
    if (done.length) return res([`§fWhat ${shortName(p)} delivered:`, ...done.slice(0, 4).map((o) => `§7▸ ${o.text}`)], base);
    return res([`§7${p.description}`], base);
  }
  if (q.has(/\blive\b/) && linkChip) return res([`§fYes — it's live: ${p.live?.href ?? p.github}`], base);
  if (q.has(T.status) || q.has(/\blive\b/)) return res([`§f${shortName(p)} is ${p.status.toLowerCase()}${p.completion < 100 ? ` — about ${p.completion}% there` : ""}.`], base);
  if (q.has(T.duration) || q.has(T.when)) return res([`§f${p.year}.`, ...(p.role ? [`§7${p.role}`] : [])], base);
  if (q.has(T.role)) return res([`§f${p.role ?? "Personal project — designed and built by him."}`], [...base, more[0]]);
  // A specific question about this project ("what problem did it solve?",
  // "how many operators adopted it?") → the best sentence from its case study.
  const own = new Set(pe.aliases.flat());
  const rest = q.t.filter((w) => !own.has(w));
  if (rest.length && !q.has(/^(tell me about|what is|what's|who is)\b/)) {
    const hit = search(q, (d) => d.ent === pe, rest);
    if (hit) return res(hit.lines, base);
  }
  const lead = q.has(T.yesno) ? `§fYes — ${p.name}.` : `§f${p.name} §8· ${p.status}`;
  return res([lead, `§7${p.tagline}`, `§7${clip(p.description, 240)}`, ...(p.role ? [`§8${p.role}`] : [])], [...base, ...more].slice(0, 4));
}

function skillAnswer(q: Q, s: Skill): AskResult {
  const used = [...s.projects.map((p) => shortName(p)), ...s.roles.map((r) => `${r.name.replace(/ — .*/, "")} (${r.company})`)];
  const chips: Chip[] = [...s.projects.slice(0, 2).map((p) => openProject(p)), { label: "Skills →", act: { kind: "open", app: "skills" } }];
  if (q.has(T.list) || q.has(T.count)) {
    if (!s.projects.length) return res([`§fNo project on the site is tagged ${s.name} — it shows up in his roles: ${list(used) || "—"}.`], chips);
    return res([`§fProjects with ${s.name}:`, ...s.projects.slice(0, 6).map((p) => `§7▸ §f${p.name} §8· ${p.status}`)], chips);
  }
  if (q.has(T.duration)) {
    const first = s.roles.map((r) => ({ r, st: startOf(r.mission.period) })).filter((x) => x.st).sort((a, b) => a.st!.year * 12 + a.st!.month - (b.st!.year * 12 + b.st!.month))[0];
    if (first) return res([`§fSince ${first.r.mission.period.split(/\s[–-]\s/)[0]} — about ${fmtMonths(monthsSince(first.st!))}.`, `§7First used in his ${first.r.name} role at ${first.r.company}.`], chips);
    return res([`§fThe site doesn't say exactly how long.`, ...(s.level ? [`§7He rates himself ${s.level}/100 in ${s.name}.`] : [])], [CONTACT, ...chips].slice(0, 3));
  }
  const strength = s.level === undefined ? "" : s.level >= 88 ? "one of his strongest" : s.level >= 75 ? "strong" : s.level >= 60 ? "working level" : "basics";
  const rating = s.level !== undefined ? ` §8(${s.level}/100, self-rated)` : "";
  const lines = q.has(T.yesno)
    ? [`§f${s.level === undefined || s.level >= 60 ? "Yes" : "A little"}${strength ? ` — ${strength}` : ""}: ${s.name}${rating}.`]
    : [`§f${s.name}${strength ? `: ${strength}` : ""}${rating}.`];
  if (s.cap) lines.push(`§7${s.cap.claim}`);
  if (used.length) lines.push(`§7Shows up in: ${list(used.slice(0, 4))}.`);
  return res(lines, chips);
}

function otherEntityAnswer(q: Q, e: Entity): AskResult | null {
  switch (e.kind) {
    case "award": {
      const role = ROLES.find((r) => r.mission.weapons.some((w) => norm(w) === norm(e.name)));
      return res([`§f${e.name} §8· ${e.year}`, `§7${e.org === "Fractal" ? "An internal award at Fractal" : "External recognition"}${role ? `, during his ${role.name} role at ${role.company}` : ""}.`], [{ label: "About →", act: { kind: "open", app: "about" } }]);
    }
    case "cert":
      return res([`§f${q.has(T.yesno) ? "Yes — " : ""}${e.name} §8· ${e.org}`], [ask("Education?", "where did he study")]);
    case "education":
      return eduAnswer();
    case "place":
      if (e.home) return res([`§fHe's based in ${e.name}, India.`], [ask("Remote or relocation?", "is he open to remote or relocation")]);
      if (e.roles.length) return res([`§f${q.has(T.yesno) ? "Yes — " : ""}He worked from ${e.name}:`, ...e.roles.map((r) => `§7▸ ${r.name} · ${r.company} §8(${r.mission.period})`)], []);
      return null;
    default:
      return null;
  }
}

function eduAnswer(): AskResult {
  return res([
    `§f${education.degree}`,
    `§7${education.institution} §8· ${education.period} · CGPA ${education.cgpa}`,
    `§7Certifications: ${list(certifications.map((c) => c.title))}.`,
  ], [{ label: "About →", act: { kind: "open", app: "about" } }]);
}

/* Questions that aren't about one thing. */
function generalAnswer(q: Q): AskResult | null {
  const has = (re: RegExp) => q.has(re);
  const ts = new Set(q.t);

  // Who is he / elevator pitch
  if (has(/\b(who is (he|kaustav)|who'?s (he|kaustav)|about (him|kaustav|yourself)|introduce|summary|elevator pitch|\bbio\b|tell me about (him|kaustav))\b/) || /^(who|kaustav( roy)?|him|about)\??$/.test(q.low) || /^who\b.*\bkaustav\b/.test(q.low))
    return res([`§f${profile.name} — ${profile.designation}, ${profile.tagline}.`, `§7${profile.bioShort}`], [ask("What's he working on?", "what is he working on now"), ask("Show his projects"), CONTACT]);

  // Why hire
  if (has(/\bwhy (should|would) (we|i|you|anyone) hire\b|\bwhy (him|kaustav)\b|\bwhat makes him (good|different|special)\b/))
    return res([
      `§f${profile.bioShort}`,
      `§7Recognition: ${list(AWARDS.slice(0, 3).map((a) => a.name))}.`,
      `§7Ships real AI products: ${list(projects.filter((p) => p.type === "main").slice(0, 3).map((p) => shortName(p)))}.`,
    ], [openProject(CURRENT_PROJECT, "See his flagship work →"), CONTACT]);

  // Current role / what he does / where he works
  if (has(/\bwhat (does|is) he (do|doing)\b|\bwhere (does|is) he (work|working|employed)\b|\bwho (does he|is he) work(ing)? for\b|\bwhat'?s his (job|role)\b/) || (has(T.current) && (has(T.role) || ts.has("work") || ts.has("company") || ts.has("role"))))
    return res([
      `§f${CURRENT_ROLE.name} at ${CURRENT_ROLE.company} §8· since ${CURRENT_ROLE.mission.period.split(/\s[–-]\s/)[0]}`,
      `§7Working on ${CURRENT_PROJECT.name}: ${clip(CURRENT_PROJECT.description, 180)}`,
    ], [openProject(CURRENT_PROJECT, "Read the case study →"), ask("How long at Fractal?")]);

  if (has(T.current) && (ts.has("project") || has(/\bworking on\b|\bbuilding\b/)))
    return projectAnswer(q, PROJECTS.find((p) => p.project.id === CURRENT_PROJECT.id)!);

  // Total experience
  if (has(T.duration) || has(/\b(years? of experience|how experienced|how senior)\b/)) {
    if (has(/\b(work|worked|working|experience|career|industry|design|designer|designing|professional|total)\b/) || q.t.length <= 1)
      return res([
        `§f${fmtMonths(monthsSince(CAREER_START))} in design, since July ${CAREER_START.year}.`,
        `§7That's from his Eugenie.ai internship on; ${fmtMonths(monthsSince(FRACTAL_START))} of it at Fractal Analytics.`,
      ], [{ label: "Experience →", act: { kind: "open", app: "experience" } }, ask("What does he do now?")]);
  }

  // Location
  if (has(/\bwhere (is he|does he live|is he based|is he from|does he stay)\b|\bbased\b|\bwhich city\b|\blocation\b/))
    return res([`§fHe's based in ${profile.location.replace(", IN", ", India")}.`], [ask("Remote or relocation?", "is he open to remote or relocation")]);

  // Education
  if (ts.has("education") || ts.has("university") || has(/\bwhere did he (study|graduate)\b|\bcgpa\b|\bgpa\b|\bgraduat/)) return eduAnswer();

  // Certifications
  if (has(/\bcertific\w*|\bcourses?\b/))
    return res([`§fCertifications:`, ...certifications.map((c) => `§7▸ ${c.title} §8· ${c.org}`)], [ask("Education?", "where did he study")]);

  // Awards
  if (ts.has("award") || has(/\bawards?\b|\brecogni[sz]ed\b|\bwon\b|\bwin\b|\bwinner\b|\bhackathons?\b|\bcompetitions?\b/))
    return res([`§fAwards:`, ...AWARDS.map((a) => `§7▸ ${a.name} §8· ${a.year}`)], [{ label: "About →", act: { kind: "open", app: "about" } }]);

  // Writing
  if (ts.has("writing") || has(/\bwrit(e|es|ing)\b|\bblogs?\b|\barticles?\b|\btalks?\b/))
    return res([`§fWriting:`, ...publications.map((p) => `§7▸ ${p.title} §8· ${p.venue}`)], [{ label: "Medium ↗", act: { kind: "link", url: profile.social.medium } }, { label: "LinkedIn ↗", act: { kind: "link", url: profile.social.linkedin } }]);

  // Contact & résumé
  if (ts.has("resume") || has(/\bresume\b/))
    return res(["§fHere's his résumé (PDF)."], [{ label: "Open résumé ↗", act: { kind: "link", url: "/Kaustav_Roy_CV.pdf" } }, CONTACT]);
  if (has(/\bgithub\b/)) {
    const gh = projects.filter((p) => p.github);
    const user = gh[0]?.github?.match(/github\.com\/[^/]+/)?.[0];
    if (user)
      return res([`§fHis side projects are on GitHub: §b${user}`, ...gh.slice(0, 4).map((p) => `§7▸ ${p.name}`)], [{ label: "GitHub ↗", act: { kind: "link", url: `https://${user}` } }, ...gh.slice(0, 2).map((p) => openProject(p))]);
  }
  if (has(/\b(contact|reach|email|mail|get in touch|talk to him|connect|linkedin|message him)\b|\bhow (do|can|should|would) (i|we) (hire|reach|contact|work with)\b/))
    return res([`§fThe contact form reaches him directly.`, `§7Or email §b${profile.social.email}§7 · LinkedIn §b${profile.social.linkedin.replace(/^https:\/\/(www\.)?/, "")}`], [CONTACT, { label: "LinkedIn ↗", act: { kind: "link", url: profile.social.linkedin } }]);

  // A year: what he was doing then
  const yr = q.low.match(/\b(20[12]\d)\b/);
  if (yr && !ts.has("award") && !has(/\bawards?\b|\bwon\b|\bgraduat|\bstud(y|ied)\b/)) {
    const y = Number(yr[1]);
    const now = new Date().getFullYear();
    const span = (s: string) => {
      const ys = [...s.matchAll(/\b(20\d\d)\b/g)].map((m) => Number(m[1]));
      if (!ys.length) return null;
      return [Math.min(...ys), /present/i.test(s) ? now : Math.max(...ys)] as const;
    };
    const roles = ROLES.filter((r) => { const sp = span(r.mission.period); return sp && sp[0] <= y && y <= sp[1]; });
    const projs = projects.filter((p) => { const sp = span(p.year); return sp && sp[0] <= y && y <= sp[1]; });
    if (roles.length || projs.length)
      return res([
        `§fIn ${y}:`,
        ...roles.map((r) => `§7▸ ${r.name} §8· ${r.company} · ${r.mission.period}`),
        ...projs.slice(0, 5).map((p) => `§7▸ §f${p.name} §8· ${p.type === "side" ? "side project" : p.status.toLowerCase()}`),
      ], projs.slice(0, 2).map((p) => openProject(p)));
  }

  // Projects
  if (ts.has("project") || ts.has("side") || has(/\b(portfolio|case stud(y|ies)|what has he (built|made|designed|shipped)|his work|show (me )?(his )?work)\b/)) {
    let set = projects;
    let label = "His projects";
    if (ts.has("side") || has(/\b(side|personal|hobby|fun)\b/)) { set = projects.filter((p) => p.type === "side"); label = "Side projects"; }
    else if (has(/\b(freelance|consult\w*|client)\b/)) { set = projects.filter((p) => p.type === "consulting"); label = "Consulting work"; }
    else if (has(/\b(work|main|professional|enterprise|company|fractal|job)\b/) && !has(/\bhis work\b|\bshow (me )?(his )?work\b/)) { set = projects.filter((p) => p.type === "main"); label = "Work projects"; }
    if (has(/\blive\b/)) set = set.filter((p) => p.status === "LIVE" || !!p.live);
    else if (has(/\bin progress\b|\bongoing\b|\bcurrent\b/)) set = set.filter((p) => /progress/i.test(p.status));
    if (ts.has("ai")) {
      set = set.filter((p) => p.tags.some((t) => /\bai\b|agent|xai|explainable|human-in-the-loop/i.test(t)) || /\bAI\b/.test(p.description));
      label = `${label} involving AI`;
    }
    if (!set.length) return null;
    if (q.has(T.count)) label = `${set.length} — ${label.toLowerCase()}`;
    return res([`§f${label}:`, ...set.slice(0, 6).map((p) => `§7▸ §f${p.name} §8· ${p.tagline}`), ...(set.length > 6 ? [`§8+ ${set.length - 6} more`] : [])], [...set.slice(0, 2).map((p) => openProject(p)), { label: "All projects →", act: { kind: "open", app: "projects" } }]);
  }

  // Skills overview
  if (ts.has("skill") || ts.has("tool") || ts.has("stack") || has(/\b(good at|best at|strengths?|expertise|speciali[sz]\w*|what can he do|toolkit|tools)\b/)) {
    if (ts.has("tool") || ts.has("stack") || has(/\btools?\b|\bsoftware\b|\btoolkit\b/))
      return res([`§fHis toolkit: ${list(TOOLS)}.`], [ask("Does he know Figma?"), { label: "Skills →", act: { kind: "open", app: "skills" } }]);
    const top = [...RATED].sort((a, b) => b.level - a.level).slice(0, 5);
    return res([`§fWhat he's strongest at:`, ...top.map((s) => `§7▸ ${s.name} §8${s.level}/100`)], [{ label: "Skills →", act: { kind: "open", app: "skills" } }, ask("Show his projects")]);
  }

  // Career overview
  if (has(/\b(experience|career|work history|worked|previous (jobs?|roles?|companies)|companies|employers?|timeline|background)\b/) || ts.has("company"))
    return res([`§fHis career so far:`, ...ROLES.slice().reverse().map((r) => `§7▸ ${r.name} §8· ${r.company} · ${r.mission.period}`)], [{ label: "Experience →", act: { kind: "open", app: "experience" } }, ask("How long at Fractal?")]);

  return null;
}

/* "Did he work at/for X?" where X isn't one of his employers. */
function notAnEmployer(q: Q): AskResult | null {
  const w = q.low.match(/\bwork(?:ed|s|ing)? (?:at|for)\s+(.+?)\??$/);
  if (!w || pick(q, "company")) return null;
  const award = pick(q, "award");
  return res([
    `§fNot that I know of — his work history is ${list(COMPANIES.map((c) => `${c.name} (${c.chapter.period})`))}.`,
    ...(award ? [`§7He was recognised by them, though: ${award.name} (${award.year}).`] : []),
  ], [{ label: "Experience →", act: { kind: "open", app: "experience" } }, CONTACT]);
}

/* "Does he know Rust?" / "Does he do motion design?" — when the thing isn't
   on the site at all, say so plainly instead of guessing. Generic words
   ("design", "ux") don't count as knowing the thing. */
function closedWorld(q: Q): AskResult | null {
  if (!q.has(T.yesno)) return null;
  const m = q.low.match(/\b(?:know|knows|use|uses|used|familiar with|experience (?:with|in)|worked with|work with|proficient (?:in|with)|skilled (?:in|at)|code in|program in|good at|done|do)\s+(.+?)\??$/);
  if (m) {
    const thing = m[1].replace(/^(a|an|the|any)\s+/, "").replace(/\s+(well|at all)$/, "");
    const tt = terms(thing).filter((x) => !GENERIC.has(x));
    if (tt.length && tt.length <= 4 && !tt.some((x) => KNOWN_WORDS.has(x)))
      return res([`§f${thing.replace(/^\w/, (c) => c.toUpperCase())} isn't on his skill list.`, `§7His toolkit: ${list(TOOLS)}. For anything else, ask him directly.`], [CONTACT, { label: "Skills →", act: { kind: "open", app: "skills" } }]);
  }
  return null;
}

/* ── 5 · Search (BM25) ── */
const extraDocs: Doc[] = [];
let stats: { df: Map<string, number>; avg: number; n: number } | null = null;
function bm25Stats() {
  if (stats) return stats;
  const all = [...DOCS, ...extraDocs];
  const df = new Map<string, number>();
  for (const d of all) for (const w of d.tf.keys()) df.set(w, (df.get(w) ?? 0) + 1);
  stats = { df, avg: all.reduce((s, d) => s + d.len, 0) / all.length, n: all.length };
  return stats;
}
const idf = (w: string) => {
  const { df, n } = bm25Stats();
  const d = df.get(w) ?? 0;
  return Math.log(1 + (n - d + 0.5) / (d + 0.5));
};

/* Map typos onto words the site actually uses. */
function correct(ts: string[]): string[] {
  const { df } = bm25Stats();
  return ts.map((w) => {
    if (df.has(w) || w.length < 5) return w;
    for (const v of df.keys()) if (fuzzyEq(w, v)) return v;
    return w;
  });
}

/* `scope` narrows the search to some passages (one project's case study)
   and relaxes the bar, since the topic is already known. */
function search(q: Q, scope?: (d: Doc) => boolean, override?: string[]): AskResult | null {
  const qt = [...new Set(correct(override ?? q.t))].filter((w) => w.length > 1);
  if (!qt.length) return null;
  const { avg } = bm25Stats();
  const k1 = 1.4, b = 0.7;
  // Inside a known topic, word families count too: "adopted" finds
  // "adoption", "solve" finds "solving" (shared stem of 4+ letters).
  const kin = (w: string, k: string) => k === w || (!!scope && Math.min(w.length, k.length) >= 4 && (k.startsWith(w) || w.startsWith(k) || (w.length >= 5 && k.length >= 5 && k.slice(0, 5) === w.slice(0, 5))));
  const tfOf = (tf: Map<string, number>, w: string) => {
    if (!scope) return tf.get(w) ?? 0;
    let n = 0;
    for (const [k, c] of tf) if (kin(w, k)) n += c;
    return n;
  };
  let best: { d: Doc; s: number } | null = null;
  for (const d of [...DOCS, ...extraDocs]) {
    if (scope && !scope(d)) continue;
    let s = 0;
    for (const w of qt) {
      const tf = tfOf(d.tf, w);
      if (tf) s += idf(w) * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.len) / avg)));
    }
    // Passages about what we were just discussing win close calls.
    if (s > 0 && focus && d.ent === focus) s *= 1.35;
    if (s > 0 && (!best || s > best.s)) best = { d, s };
  }
  // Needs real overlap: a distinctive word, and most of the question's
  // weight (by idf) found in the passage — not one lucky common word.
  if (!best) return null;
  const d0 = best.d;
  const strong = qt.filter((w) => idf(w) > (scope ? 1 : 2) && tfOf(d0.tf, w)).length;
  const mass = qt.reduce((s, w) => s + idf(w), 0);
  const covered = qt.reduce((s, w) => s + (tfOf(d0.tf, w) ? idf(w) : 0), 0);
  if (best.s < (scope ? 1.2 : 2.5) || !strong || covered / mass < 0.5) return null;

  const wantsNumber = q.has(/\bhow (many|much|big|fast|large)\b|\bpercent|\bnumbers?\b/);
  const sents = sentences(best.d.text);
  let top = { i: 0, s: -1 };
  sents.forEach((x, i) => {
    const st = terms(x);
    // "How many…?" wants the sentence with the number in it.
    const s = qt.reduce((acc, w) => acc + (st.some((k) => kin(w, k)) ? idf(w) : 0), 0) + (wantsNumber && /\d/.test(x) ? 1.5 : 0);
    if (s > top.s) top = { i, s };
  });
  let snippet = sents[top.i] ?? best.d.text;
  if (snippet.length < 90 && sents[top.i + 1]) snippet += " " + sents[top.i + 1];

  if (best.d.ent && !scope) focus = best.d.ent;
  const chips: Chip[] = [];
  const a = best.d.act;
  if (a?.kind === "open" && a.projectId) {
    const p = projects.find((x) => x.id === a.projectId);
    if (p) chips.push(openProject(p, "Read more →"));
  } else if (a?.kind === "open") chips.push({ label: `${a.app[0].toUpperCase()}${a.app.slice(1)} →`, act: a });
  else if (a) chips.push({ label: "Open ↗", act: a });
  chips.push(CONTACT);
  return res([`§7${clip(snippet, 280)}`, `§8— from ${best.d.title}`], chips, "search");
}

/* ── Main ── */
export function askKR(raw: string): AskResult {
  const q = parse(raw);
  if (!q.low) return res([], [], "miss");

  const declined = decline(q);
  if (declined) return declined;
  const small = smalltalk(q);
  if (small) return small;

  // Follow-ups: no thing named, but "it/there/that" or a bare "how long?" → the last topic.
  const entityQ = [T.duration, T.when, T.where, T.role, T.tools, T.impact, T.status, T.link, T.nda].some((re) => q.has(re));
  // …unless the question names a general topic of its own ("where did he study?").
  const ownTopic = /\b(work|worked|working|experience|career|industry|design|designer|total|overall|professional|stud(y|ied)|education|degree|college|university|school|awards?|won|certif\w*|writ\w*|resume|cv|contact|email|based|live|lives|from|located|city|skills?|projects?|company|companies|github|20[12]\d)\b/.test(q.low);
  // Implicit follow-ups ("how long?", "what tools?") only stick to a project,
  // role or company; an explicit "it/that/there" sticks to anything.
  // Present-tense "what tools does he use?" is about him in general, not the last topic.
  const thingFocus = focus && (focus.kind === "project" || focus.kind === "role" || focus.kind === "company");
  const general = q.has(/\b(does|do) he\b/) && !q.pronoun;
  if (!q.ents.length && focus && (q.pronoun || (thingFocus && entityQ && q.t.length <= 2 && !ownTopic && !general && !q.has(T.current)))) q.ents = [focus];
  // A detail of the project in focus ("how many tokens?" after the DLS) stays on that project.
  const sk = q.ents[0];
  if (sk?.kind === "skill" && focus?.kind === "project" && !q.has(T.yesno) && sk.projects.includes(focus.project)) q.ents = [focus, sk];

  const employer = notAnEmployer(q);
  if (employer) return employer;

  const primary = q.ents[0];
  const faq = faqByPattern(q);
  const strongEnt = primary && (primary.kind === "project" || primary.kind === "company" || primary.kind === "role" || (primary.kind === "skill" && q.has(T.yesno)));
  if (faq && !strongEnt) return faqAnswer(faq);

  let out: AskResult | null = null;
  if (primary) {
    // A question about a skill *inside* a project ("tools for nexval") stays on the project.
    const proj = pick(q, "project"), role = pick(q, "role"), comp = pick(q, "company"), skill = pick(q, "skill");
    if (proj && (!skill || q.has(T.tools) || q.ents[0] === proj)) out = projectAnswer(q, proj);
    else if (role) out = roleAnswer(q, role);
    else if (comp) out = companyAnswer(q, comp);
    else if (skill) out = skillAnswer(q, skill);
    else out = otherEntityAnswer(q, primary);
    if (out) focus = proj ?? role ?? comp ?? skill ?? primary;
  }
  out ??= closedWorld(q) ?? generalAnswer(q);
  if (out) return out;

  if (faq) return faqAnswer(faq);
  const faq2 = faqByOverlap(q);
  if (faq2) return faqAnswer(faq2);

  // Still talking about a project? Look in its case study first.
  if (thingFocus && focus?.kind === "project" && !ownTopic) {
    const pf = focus;
    const inTopic = search(q, (d) => d.ent === pf);
    if (inTopic) return inTopic;
  }
  const found = search(q);
  if (found) return found;

  return res([
    `§fI don't have an answer for that one.`,
    "§7Kaustav can tell you himself — leave him a note.",
  ], [CONTACT, ask("What can I ask?")], "miss");
}

/* For tests and the Sound-Lab-style debug views. */
export const __debug = { parse, findEntities, search: (s: string) => search(parse(s)) };

