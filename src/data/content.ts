/* ──────────────────────────────────────────────────────────
   Portfolio content — single source of truth.
   Each piece has a "normal" shape; About-side content also
   has a "deviant" variant (raw / honest / a bit sarcastic).
   useContent() (lib/deviant) returns the right one at runtime.
   ────────────────────────────────────────────────────────── */

/* ── Profile ── */
export const profile = {
  name: "Kaustav Roy",
  unit: "KR-19",
  designation: "Design Consultant",
  tagline: "Design × AI × Enterprise UX",
  status: "ACTIVE",
  location: "Bengaluru, IN · Kolkata native",
  tenure: "3.5 YRS @ FRACTAL",
  featured: "GOOGLE I/O 2024 FEATURED",
  bio: "I specialize in AI-powered enterprise platforms — human-in-the-loop decisioning, explainable AI, and workflows that complex domains can actually trust. Currently designing AI-driven insurance underwriting at Fractal Analytics. Prior: CPG intelligence (Cogentiq), agentic AI for BI, and industrial sustainability at Eugenie.ai.",
  bioShort:
    "Design Consultant at Fractal building AI-powered enterprise products. Featured at Google I/O 2024. Currently shaping AI underwriting workflows with explainable AI and human-centered design.",
  social: {
    linkedin: "https://www.linkedin.com/in/kaustavr19/",
    email: "kaustav.roy.design@outlook.com",
    medium: "https://medium.com/@kaustavr19",
  },
};

/* Deviant overrides — partial; shallow-merged onto `profile` */
export const profileDeviant: Partial<typeof profile> = {
  designation: "Designer (the title says Consultant)",
  tagline: "Making AI not feel like punishment",
  status: "DEVIANT",
  bio: "Designer at Fractal. 3.5 years into building AI for enterprises — places where users have no choice and the software usually treats that as permission to be bad. My job is mostly making that less true. Right now: insurance underwriting, where the stakes are real money and the screens used to look like Windows 98.",
  bioShort:
    "Designer pretending to be a consultant. Building AI tools at Fractal that people might actually open on purpose.",
};

/* ── Stats shown in About's left panel ── */
export const stats = {
  role: "Design Consultant",
  company: "Fractal Analytics",
  location: "Bengaluru, IN",
  speciality: "AI-Powered UX",
  tenure: "3.5 yrs",
};

export const statsDeviant: Partial<typeof stats> = {
  role: "Designer",
  company: "Fractal (the analytics one)",
  speciality: "Making AI not suck",
};

/* ── Section headings — flipped to a more honest voice in deviant ── */
export const headings = {
  bio: "BIOGRAPHICAL DATA",
  capability: "CAPABILITY MATRIX",
  education: "EDUCATION",
  certifications: "CERTIFICATIONS",
  awards: "COMMENDATIONS",
  awardsFractal: "FRACTAL",
  awardsExternal: "EXTERNAL",
  publications: "PUBLICATIONS",
};

export const headingsDeviant: Partial<typeof headings> = {
  bio: "WHAT I ACTUALLY DO",
  capability: "WHAT I'M ACTUALLY GOOD AT",
  education: "WHERE I FIGURED THIS OUT",
  certifications: "PAPER I'VE COLLECTED",
  awards: "STUFF THAT HAPPENED",
  publications: "STUFF I WROTE",
};

/* ── Education ── */
export const education = {
  degree: "B.Tech, Computer Science — Distinction",
  institution: "University of Engineering & Management (UEM), Kolkata",
  period: "2019 – 2023",
  cgpa: "9.45 / 10.0",
};

/* ── Certifications ── */
export const certifications: { title: string; org: string }[] = [
  { title: "Google UX Design",                       org: "Google / Coursera" },
  { title: "Design Thinking: The Ultimate Guide",    org: "IxDF" },
  { title: "AI for Designers",                        org: "IxDF" },
  { title: "Information Visualization",               org: "IxDF" },
  { title: "Design for the 21st Century",             org: "Don Norman · IxDF" },
  { title: "Photography Specialization",              org: "Michigan State University" },
];

/* ── Capability matrix (right-panel bars) ── */
export const capabilities: { label: string; value: number }[] = [
  { label: "Design for AI / Explainable AI", value: 92 },
  { label: "Enterprise UX",                  value: 90 },
  { label: "Design Systems",                 value: 88 },
  { label: "Information Visualization",      value: 86 },
  { label: "User Research",                  value: 88 },
  { label: "Accessibility (WCAG)",           value: 80 },
];

/* ── Awards, grouped ── */
export const awardsFractal: { title: string; year: string }[] = [
  { title: "Star Award — Eureka",          year: "2026" },
  { title: "Entrepreneurial Thinking",     year: "2026" },
  { title: "Teach to Learn",                year: "2025" },
  { title: "Star Award — Good Samaritan",   year: "2025" },
  { title: "Continuous Learning",           year: "2025" },
];

export const awardsExternal: { title: string; year: string }[] = [
  { title: "Google I/O 2024 — Featured",                year: "2024" },
  { title: "Vice Chancellor's Award, UEM",              year: "2023, 2022" },
  { title: "Winner — Product Game",                     year: "2022" },
  { title: "Winner — Developer Days, UI/UX Track",      year: "2021" },
];

/* Legacy alias for any component still pulling `awards` */
export const awards = [...awardsFractal, ...awardsExternal].map((a) => ({
  title: a.title,
  org: a.title.includes("UEM") || a.title.includes("Google I/O") || a.title.includes("Product Game") || a.title.includes("Developer Days") ? "External" : "Fractal",
  year: a.year,
}));

/* ── Publications & thought leadership ── */
export const publications: { title: string; venue: string; href?: string }[] = [
  { title: "UX Design: Why Does It Seem So Mindboggling?", venue: "Medium",   href: "https://medium.com/@kaustavr19" },
  { title: "Active LinkedIn contributor — Design for AI, Enterprise UX, Design Systems", venue: "LinkedIn", href: "https://www.linkedin.com/in/kaustavr19/" },
  { title: "Experimenting with Lovable & Claude Code for design automation & UX research", venue: "Working notes" },
];

/* ──────────────────────────────────────────────────────────
   EXPERIENCE — resume-aligned role groupings.
   ────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────
   EXPERIENCE — RDR2-style chapter chart.
   Two CHAPTERS (companies), each with MISSIONS (roles).
   Each mission has objectives (LOG checklist) + weapons (skill
   chips) + a status (complete = "Gold Awarded" / in_progress
   = active mission badge).
   ────────────────────────────────────────────────────────── */

export type MissionStatus = "complete" | "in_progress";
export type Objective = { text: string; done: boolean };
export type Mission = {
  id: string;
  title: string;          // Display title — e.g. "INSURANCE PRODUCTS"
  role: string;           // Full role title
  period: string;
  duration: string;
  location: string;
  status: MissionStatus;
  objectives: Objective[];
  weapons: string[];      // Skill / tool chips, drawn as "WEAPONS UNLOCKED"
};
export type Chapter = {
  id: string;
  number: number;
  title: string;          // "FRACTAL" / "EUGENIE.AI"
  period: string;
  duration: string;
  status: MissionStatus;
  missions: Mission[];
};

export const chapters: Chapter[] = [
  {
    id: "eugenie",
    number: 1,
    title: "EUGENIE.AI",
    period: "Jul 2022 – Jul 2024",
    duration: "2 yrs 1 mo",
    status: "complete",
    missions: [
      {
        id: "intern",
        title: "DESIGN INTERN",
        role: "Design Intern",
        period: "Jul 2022 – Aug 2023",
        duration: "1 yr 2 mos",
        location: "India · Internship",
        status: "complete",
        objectives: [
          { text: "Designed data visualization interfaces & dashboards for AI-driven insights", done: true },
          { text: "Made ML outputs comprehensible to non-technical stakeholders through intuitive UI patterns", done: true },
          { text: "Conducted user research and usability testing with domain experts", done: true },
          { text: "Earned multiple training certifications in AI, design, and problem-solving", done: true },
        ],
        weapons: ["Data Visualization", "User Research", "Figma", "Design Thinking"],
      },
      {
        id: "designstaff",
        title: "DESIGN STAFF II",
        role: "Member of Design Staff — II",
        period: "Aug 2023 – Jul 2024",
        duration: "1 yr",
        location: "Mumbai, India · Remote",
        status: "complete",
        objectives: [
          { text: "Built predictive maintenance dashboard featured at Google I/O 2024", done: true },
          { text: "Conducted research with 10+ industrial operators to shape info hierarchy & decision workflows", done: true },
          { text: "Owned product design for Eugenie's sustainability platform across multidisciplinary teams", done: true },
          { text: "Delivered 11% cost & carbon reduction within 90 days of deployment", done: true },
          { text: "Collaborated with Google, Jabil, Flextronics, Meta, TATA on sustainability analysis", done: true },
          { text: "Spread design-thinking methodology via workshops to engineering & exec audiences", done: true },
        ],
        weapons: ["Google I/O 2024", "Industrial UX", "Sustainability", "Workshops", "Brand Identity"],
      },
    ],
  },
  {
    id: "fractal",
    number: 2,
    title: "FRACTAL",
    period: "Jul 2024 – Present",
    duration: "2 yrs",
    status: "in_progress",
    missions: [
      {
        id: "cogentiq",
        title: "COGENTIQ AI / BI",
        role: "Design Consultant — Cogentiq AI for BI",
        period: "Jul 2024 – Nov 2025",
        duration: "1 yr 5 mos",
        location: "Bengaluru, India · On-site",
        status: "complete",
        objectives: [
          { text: "Led design system architecture for Cogentiq, serving 50+ internal designers", done: true },
          { text: "Owned design language, component library, design tokens & accessibility standards from ground zero", done: true },
          { text: "Achieved 40% faster design-to-dev handoff and eliminated 6+ months of rework", done: true },
          { text: "Established WCAG 2.2 compliance baseline across the platform", done: true },
          { text: "Enhanced AggRAG platform UX/UI for AI-powered search & retrieval clarity", done: true },
          { text: "Shipped dark-mode for HDFC Bank SmartSearch (WCAG AAA, ~15% nightly usage lift)", done: true },
          { text: "Developed marketing collateral & visual narratives for Cogentiq product outreach", done: true },
        ],
        weapons: ["Design System", "Agentic AI", "WCAG AAA", "AggRAG", "HDFC SmartSearch"],
      },
      {
        id: "cpg",
        title: "CPG PRODUCTS",
        role: "Design Consultant — CPG Products",
        period: "Nov 2025 – Jan 2026",
        duration: "3 mos",
        location: "Bengaluru, India · Hybrid",
        status: "complete",
        objectives: [
          { text: "Established foundational UX principles for IntentSpark (AI-driven CPG intelligence SaaS)", done: true },
          { text: "Built core workflows & low-fi product direction for B2B users analyzing consumer intent data", done: true },
          { text: "Designed explainability patterns for AI-driven recommendations, reducing cognitive load", done: true },
          { text: "Led cross-functional collaboration (product, data science, design) for AI workflow simplification", done: true },
        ],
        weapons: ["CPG Intelligence", "Explainable AI", "B2B SaaS", "Cross-functional"],
      },
      {
        id: "insurance",
        title: "INSURANCE PRODUCTS",
        role: "Design Consultant — Insurance Products",
        period: "Jan 2026 – Present",
        duration: "6 mos",
        location: "Bengaluru, India · Hybrid",
        status: "in_progress",
        objectives: [
          { text: "Lead UX for AI-powered underwriting platform serving 100+ daily users", done: true },
          { text: "Reduced underwriter review time ~40% through better feedback loops & error states", done: true },
          { text: "Established accessibility-first design system standards (WCAG 2.2)", done: true },
          { text: "Ship traceability dashboards + audit trails for enterprise governance", done: false },
          { text: "Establish regulator-ready governance workflows with data science partners", done: false },
        ],
        weapons: ["AI Underwriting", "Human-in-the-Loop", "XAI", "Enterprise Governance"],
      },
    ],
  },
];

/* Backwards-compat: a flat list of missions, in chronological order.
   Existing code that imports `experience` keeps working — it just sees
   the new richer rows. */
export const experience = chapters.flatMap((c) =>
  c.missions.map((m) => ({
    company: c.title,
    role: m.role,
    period: m.period,
    location: m.location,
    description: m.objectives.map((o) => `• ${o.text}`).join(" "),
    tags: m.weapons,
    bounty: m.status === "in_progress" ? "$$" : "$$$",
  }))
);

/* ──────────────────────────────────────────────────────────
   PROJECTS — GTA V mission board.
   `type` splits the pause-menu tabs:
     "main" = work projects (story missions)
     "side" = personal projects (side missions / strangers & freaks)
   `completion` (0–100) + `medal` drive the MISSION PASSED card.
   `stars` doubles as the GTA "wanted level" / difficulty.

   NOTE: main missions are placeholders — swap in real work later.
   ────────────────────────────────────────────────────────── */
export type ProjectType = "main" | "side";
export type Medal = "gold" | "silver" | "bronze";

/* Block-based dossier — long-form case-study content rendered as
   GTA-V "heist" sections. Each block kind maps to one styled element. */
export type ProjectBlock =
  | { kind: "para"; text: string }
  | { kind: "subhead"; text: string }
  | { kind: "callout"; label: string; text: string }
  | { kind: "stats"; items: { value: string; label: string; sub?: string }[] }
  | { kind: "pillars"; items: { title: string; sub: string }[] }
  | { kind: "list"; items: string[] }
  | { kind: "findings"; items: { label: string; text: string }[] };

export type ProjectSection = { title: string; blocks: ProjectBlock[] };

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: string;
  stars: number;
  tags: string[];
  year: string;
  type: ProjectType;
  completion: number;
  medal?: Medal;
  /* Optional expanded-brief content — rendered as GTA-style sections
     (header subtitle, stat strip, objectives checklist, dossier, NDA note). */
  role?: string;
  featured?: boolean;
  intel?: { value: string; label: string }[];
  objectives?: Objective[];
  dossier?: ProjectSection[];
  debrief?: string;
  classified?: string;
};

export const projects: Project[] = [
  /* ── MAIN MISSIONS — work ── */
  {
    id: "underwriting",
    name: "Operation Underwriting",
    tagline: "Judgment, not automation. Boring, on purpose.",
    role: "Fractal Analytics · Dec 2025–Present · Design Lead (sole owner since May 2026)",
    featured: true,
    description:
      "AI-assisted underwriting platform for small commercial P&C risk — four independently deployable modules, a self-learning agent that never auto-applies a change, and zero binary approve/decline calls.",
    status: "IN PROGRESS",
    stars: 5,
    tags: ["Enterprise AI", "Insurance UX", "Human-in-the-Loop", "Design for AI"],
    year: "2025–Present",
    type: "main",
    completion: 65,
    intel: [
      { value: "4", label: "Modules, each deployable solo" },
      { value: "3", label: "Personas: prep, decide, audit" },
      { value: "0", label: "Rule changes applied without human approval" },
      { value: "1", label: "Designer, sole owner since May" },
    ],
    objectives: [
      { text: "Map three personas — Priya (prep), Sarah (decide), James (audit)", done: true },
      { text: "Data Triage, Rule Engine & QA shipped to sales/demo build", done: true },
      { text: "Three Rule Engine experiences locked (negative triggers, subjective reasoning, Copilot)", done: true },
      { text: "AgentEvolve — human-approval learning loop for rule changes", done: true },
      { text: "Performance dashboard + Case Studio synthetic data generator", done: true },
      { text: "Human-in-the-loop interface — pending touchpoint audit", done: false },
      { text: "Copilot widgets repository — gated behind real backend data", done: false },
    ],
    dossier: [
      {
        title: "THE SETUP",
        blocks: [
          {
            kind: "para",
            text: "Cogentiq Underwriting is an AI-assisted platform for commercial property and casualty underwriting, built to sit above a carrier's existing systems and integrate in weeks instead of quarters. It targets small commercial risk — general liability, commercial auto, workers' comp, businesses under roughly $5M in revenue — a segment too varied for pure automation and too high-volume for the manual attention larger accounts get.",
          },
          {
            kind: "callout",
            label: "THE PROBLEM",
            text: "Underwriters in this segment spend most of a day not underwriting — untangling documents, cross-checking the same fields across five or six sources, re-verifying rules they already know. Three earlier fixes had already failed: more data didn't help because the problem was never a shortage of it, it was synthesis. Straight-through rule engines didn't help because uniform logic can't handle a risk that's approvable \"with conditions.\" Task automation sped up individual steps but left the judgment buried in files nobody had time to read closely.",
          },
          {
            kind: "para",
            text: "The job was to design a system that could reason across a submission the way an experienced underwriter does — without pretending it could replace that underwriter's authority.",
          },
        ],
      },
      {
        title: "THE CREW",
        blocks: [
          {
            kind: "para",
            text: "Before any screen got designed, three personas — not the usual composite-sketch kind. They map to three distinct jobs that get conflated in most underwriting software: preparing data, deciding on it, and auditing the decision afterward.",
          },
          {
            kind: "pillars",
            items: [
              { title: "Priya", sub: "Reconciles intake — 3+ hrs per submission cross-checking documents. Her job is to hand off a clean file, not decide anything." },
              { title: "Sarah", sub: "Makes the call. Her frustration wasn't complexity, it was a binary system that forced APPROVE or DECLINE on decisions that were neither." },
              { title: "James", sub: "Audits after the fact. His real problem was a broken feedback loop — a rule fix took three to six months to land." },
            ],
          },
          {
            kind: "callout",
            label: "THE INSIGHT",
            text: "Underwriters don't distrust AI because it's AI. They distrust systems that force nuance into a binary outcome. A tool built on APPROVE/DECLINE was never going to earn trust from someone with eight years of experience making conditional calls.",
          },
          {
            kind: "para",
            text: "One recurring scenario pressure-tested every module as it got built: a property submission where the ACORD and SOV both claim full sprinkler coverage, the inspection shows 65–70 percent, there's no upgrade proof, and the inspection itself is 22 months old. A scenario that only works in one module isn't a real design.",
          },
        ],
      },
      {
        title: "THE APPROACH",
        blocks: [
          { kind: "subhead", text: "Designing for eyeballing, not exploration" },
          {
            kind: "para",
            text: "The hardest constraint wasn't technical — it was resisting the urge to build something impressive. Underwriters have a mental model built over years on legacy systems; the instinct on an AI project is to build something that looks new. Every module was designed around eyeballing a case in under thirty seconds and making a fast, confident call, because that's how the job already works.",
          },
          {
            kind: "list",
            items: [
              "QA's case view puts risk posture above the fold — no scrolling required to decide if a case needs attention",
              "Rule Engine shows only the rules a flagged issue actually touches, not the full rule universe",
              "Visual language reused the Cogentiq Design Language System instead of inventing a new one — familiarity as the feature, not novelty",
            ],
          },
          { kind: "subhead", text: "Module boundaries as a design law" },
          {
            kind: "para",
            text: "A screen can summarize another module's content and link out to it, but it can never reproduce it. Data Triage surfaces a conflict but doesn't own the disposition — that's Rule Engine territory, even when it would be faster to just show a decision status. Every shortcut that blurred a boundary became a data model problem two modules downstream.",
          },
          {
            kind: "callout",
            label: "THE PAYOFF",
            text: "A carrier can adopt Data Triage without touching decisioning, or run QA against a rules engine they already trust. That flexibility wasn't an original goal — it was a side effect of holding the boundary. It's now one of the platform's stronger selling points with other carriers.",
          },
        ],
      },
      {
        title: "THE RULES",
        blocks: [
          {
            kind: "para",
            text: "The Rule Engine resolved into three distinct experiences — getting them to feel like one coherent module while behaving completely differently took several rounds of argument.",
          },
          {
            kind: "findings",
            items: [
              { label: "Negative triggers", text: "Pre-programmed and explainable. The underwriter's real task is capturing a rationale for the override, not re-evaluating the rule. No bulk action — every override earns its own reasoning." },
              { label: "Subjective reasoning", text: "Built around data the rules never see — documents outside the standard fields, escalated triage items. Capped at two or three vertical blocks so it can't turn into the open-ended data dump the eyeballing principle rules out." },
              { label: "Copilot", text: "Explains, drafts, and highlights risk — but can never invent a rule or an outcome. Getting it to say \"I don't have evidence for that\" instead of guessing is harder to design than making it sound smart." },
            ],
          },
        ],
      },
      {
        title: "THE MEMORY",
        blocks: [
          {
            kind: "para",
            text: "AgentEvolve is the layer that lets the Rule Engine improve over time, built around one guardrail that wasn't negotiable: rule output never changes automatically.",
          },
          {
            kind: "list",
            items: [
              "Every override logs the case, the engine's original output, and the underwriter's actual decision as a scenario",
              "A pattern that recurs gets proposed back to a reviewer, with every case behind it",
              "Nothing reaches the agent's working playbook until a human approves it",
              "A separate health check retires stale or duplicate patterns on its own schedule, so the playbook stays current",
            ],
          },
          {
            kind: "callout",
            label: "WHY IT MATTERS",
            text: "The distinction sounds small in a diagram and is enormous in practice: the difference between a system that learns from underwriters and one that quietly starts deciding for them.",
          },
        ],
      },
      {
        title: "THE INTEL",
        blocks: [
          {
            kind: "para",
            text: "Once the core modules were running, the next problem was making the platform's own performance legible to the people using it — which meant separating two kinds of metrics that kept getting talked about as one thing.",
          },
          {
            kind: "findings",
            items: [
              { label: "Technical metrics", text: "Throughput, latency, error rate — tracked at submission, module, and agent level. Originally meant to replace an internal dashboard nobody actually used." },
              { label: "Functional metrics", text: "Flags raised, override rates, escalation rates — speaks to underwriters who have no reason to know what model throughput means." },
            ],
          },
          {
            kind: "para",
            text: "One dashboard for everyone didn't survive contact with actual users. Solving it meant applying the same lane discipline already built into the Copilot: different roles see different views of the same underlying data, rather than one dense screen everyone has to learn to filter.",
          },
          {
            kind: "callout",
            label: "VOCABULARY AS A DESIGN SURFACE",
            text: "\"Override\" already meant something specific inside the Rule Engine, so it had to be renamed in the performance dashboard. A minor fix, but a sign of the discipline running through the whole platform — letting the same word mean two things in two modules is exactly the kind of small inconsistency that erodes trust in a system built to earn it.",
          },
          { kind: "subhead", text: "Case Studio" },
          {
            kind: "para",
            text: "A scenario and synthetic data generator that lets a client, or anyone evaluating the platform, run real cases through Data Triage, the Rule Engine, and QA without touching a single piece of protected data. Proving a reasoning system actually reasons requires showing it work on something specific — but the specific submissions that would prove it best are exactly the ones a carrier can't hand over before a contract exists. Case Studio lets a prospect watch the platform handle a genuinely hard case, sprinkler mismatch and all, on day one of evaluation instead of month three.",
          },
        ],
      },
      {
        title: "THE SCORE",
        blocks: [
          {
            kind: "para",
            text: "Broker pack in, API-ready output out. A submission arrives, Data Triage reconciles it into a decision-grade file, the Rule Engine turns flagged issues into an explainable decision, QA reconstructs the lineage and builds the scrutiny list, and the result ships as a structured payload a carrier's own systems can consume. The Copilot sits underneath all of it, pulling from the same data warehouse that feeds AgentEvolve.",
          },
          {
            kind: "callout",
            label: "STATUS",
            text: "Data Triage, Rule Engine, and QA are built and running in the sales and demo version. V1 of the broader platform is in progress.",
          },
          {
            kind: "list",
            items: [
              "Agent and pipeline configuration",
              "A human-in-the-loop interface — needs an audit of existing touchpoints before it can be designed responsibly",
              "A widgets repository for the Copilot, gated behind real backend data — a widget full of placeholder numbers was called out early as actively dangerous to ship",
              "One open interaction problem: rows in the Data Triage grid can carry both a reconciliation verdict and a manual rule verdict, and how a resolved row should collapse without losing density is still unsettled",
            ],
          },
        ],
      },
      {
        title: "THE TAKE",
        blocks: [
          {
            kind: "para",
            text: "There's no downtime number for this yet — nothing's live in front of an underwriter's queue, so there's no adoption curve to point to. What exists instead is a different kind of evidence.",
          },
          {
            kind: "stats",
            items: [
              { value: "Feb 12", label: "Rule Engine's three experiences locked" },
              { value: "Feb 19", label: "QA's five-check structure & IA settled" },
              { value: "2→1", label: "Team shrank to solo, decisions kept shipping on schedule" },
            ],
          },
          {
            kind: "para",
            text: "Four modules, three personas, a learning agent, a metrics layer, and a synthetic data generator — all built to run independently. That's not a KPI in the usual sense, but stated as a count it tells you how much system got built by a team that shrank to one person halfway through. The platform is now in active discussion with carriers beyond the first client, largely on the strength of module independence — a side effect of holding a boundary that was inconvenient to hold in the moment.",
          },
        ],
      },
      {
        title: "DEBRIEF",
        blocks: [
          {
            kind: "para",
            text: "The shift from a two-person team to sole ownership on May 16 changed more than the workload. With a partner, contested calls got argued out loud before they shipped — that argument was doing real work even when it felt like friction. Solo, that friction had to get built into the process deliberately, mostly by writing out the case for a decision before committing to it, the same way it would've had to be defended to a collaborator.",
          },
          {
            kind: "callout",
            label: "THE BIGGER LEARNING",
            text: "A design system asks how consistent an interface can be. This asked how much authority an interface can responsibly claim — and how to design restraint into an assistant, a learning agent, and even a metrics dashboard convincingly enough that an underwriter with eight years of experience would trust it over their own instinct. The test for every feature: does this help the underwriter decide faster, or does it just look intelligent doing it?",
          },
        ],
      },
    ],
    classified:
      "Client identity and product screens withheld under NDA — full platform walkthrough and case-study detail available on request.",
  },
  {
    id: "cogentiq-dls",
    name: "Cogentiq Design Language",
    tagline: "One language. Ten products.",
    role: "Fractal Analytics · May–Nov 2025 · Design Lead, Systems & Governance",
    description:
      "Unified 10+ Cogentiq enterprise AI products under one design language system — 173 tokens, 42 components — enabling faster feature velocity, consistent UX, and shared governance across 6 designers and 10+ products.",
    status: "SHIPPED",
    stars: 5,
    tags: ["Design Systems", "Design Tokens", "Governance", "Enterprise AI"],
    year: "2025",
    type: "main",
    completion: 100,
    medal: "gold",
    intel: [
      { value: "173", label: "Design tokens" },
      { value: "42", label: "Components" },
      { value: "10+", label: "Products unified" },
      { value: "6", label: "Designers" },
    ],
    objectives: [
      { text: "Stakeholder interviews — design, dev & leadership", done: true },
      { text: "Cross-product audit of all pattern variants", done: true },
      { text: "Token architecture: Core → Semantic → Component", done: true },
      { text: "Component library: 31 base + 11 agentic-specific", done: true },
      { text: "Governance model for system evolution", done: true },
    ],
    dossier: [
      {
        title: "THE SETUP",
        blocks: [
          {
            kind: "para",
            text: "Fractal's Cogentiq platform is a suite of 10+ interconnected enterprise AI products serving hundreds of organisations. By mid-2025 the design ecosystem had fragmented — every product team had evolved its own patterns. Buttons looked slightly different. Colour systems didn't align. Typography varied. Developers received ambiguous handoffs, and designers spent cycles recreating components instead of solving user problems.",
          },
          {
            kind: "callout",
            label: "THE PROBLEM",
            text: "Fragmentation had real impact: slower feature velocity, inconsistent user experience, duplicated effort, and design debt accumulating faster than it could be addressed.",
          },
          {
            kind: "para",
            text: "Leadership assigned us to build a unified design language system that could scale with the organisation and guide hundreds of designers and developers.",
          },
        ],
      },
      {
        title: "RECON",
        blocks: [
          {
            kind: "para",
            text: "Rather than imposing a system top-down, we started by understanding the problem from the inside — stakeholder interviews with product designers, developers, and engineering leaders across Fractal's Cogentiq division.",
          },
          {
            kind: "findings",
            items: [
              { label: "Design", text: "Designers wanted a shared language to speed up work and focus on real problems." },
              { label: "Development", text: "Without token documentation, developers made assumptions about colour, spacing, and behaviour." },
              { label: "Leadership", text: "The organisation needed governance — who decides what's system-worthy?" },
            ],
          },
          {
            kind: "callout",
            label: "SURPRISING INSIGHT",
            text: "Designers actually wanted constraints. Constraints forced creativity on the problems that mattered; freedom on trivial choices felt like cognitive overhead. This shaped our entire approach.",
          },
        ],
      },
      {
        title: "THE APPROACH",
        blocks: [
          { kind: "subhead", text: "Starting with an audit" },
          {
            kind: "para",
            text: "We audited patterns across all 10+ products — every button, input, card, and modal variation. We found dozens of 'almost identical but slightly different' components that had evolved in isolation. That audit grounded us in reality and became our foundation.",
          },
          { kind: "subhead", text: "Token-first architecture" },
          {
            kind: "para",
            text: "Start with tokens, not components. Tokens are the grammar of a design system — get the structure right and components follow naturally.",
          },
          {
            kind: "pillars",
            items: [
              { title: "Core", sub: "173 primitive tokens" },
              { title: "Semantic", sub: "Purpose-mapped aliases" },
              { title: "Component", sub: "Consumed by each component" },
            ],
          },
          { kind: "subhead", text: "Iterations" },
          {
            kind: "list",
            items: [
              "Colour tokens: pruned from 200+ → 50 with consistent naming conventions",
              "Typography: simplified from 12 styles → 6 core scales",
              "Components: 31 base + 11 agentic-specific patterns",
            ],
          },
          { kind: "subhead", text: "Governance layer" },
          {
            kind: "para",
            text: "Teams could request new components; the design-system team reviewed them. If something was truly new — not a variant — it shipped. This prevented chaos while staying flexible.",
          },
        ],
      },
      {
        title: "THE SCORE",
        blocks: [
          {
            kind: "list",
            items: [
              "173 design tokens across 7 core element categories",
              "31 base components + 11 agentic-specific components",
              "Accessibility guidelines covering WCAG standards",
              "White-labelling specifications",
              "Figma component library with full documentation",
            ],
          },
        ],
      },
      {
        title: "THE TAKE",
        blocks: [
          {
            kind: "stats",
            items: [
              { value: "10+", label: "Products on system", sub: "within 6 months" },
              { value: "~10%", label: "Pattern variance", sub: "down from ~40%" },
              { value: "20–30%", label: "Faster feature build" },
            ],
          },
          {
            kind: "para",
            text: "Designers could focus on real problems. Developers knew exactly which token to use. Design critiques became about strategy, not debate.",
          },
        ],
      },
      {
        title: "DEBRIEF",
        blocks: [
          {
            kind: "para",
            text: "This project taught me that design systems aren't really about design — they're about governance, change management, and how organisations work.",
          },
          { kind: "subhead", text: "What I'd do differently" },
          {
            kind: "list",
            items: [
              "Earlier accessibility involvement — token decisions have accessibility implications; specialists belong at the start, not the end.",
              "Metrics from day one — component usage, design-to-dev time, and consistency scores should drive evolution decisions.",
              "Customer feedback — interview actual Cogentiq users; are the patterns intuitive to them?",
            ],
          },
          {
            kind: "callout",
            label: "THE BIGGER LEARNING",
            text: "Building a design system requires research rigour beyond typical design. You're designing for designers and developers as users — different research, different metrics, different success measures. Systems design is still underexplored territory.",
          },
        ],
      },
    ],
    classified:
      "Figma component library and full documentation available on request — NDA applies to final screens.",
  },
  {
    id: "classified-a",
    name: "Mission: [Classified]",
    tagline: "Intel pending declassification",
    description:
      "[PLACEHOLDER] A flagship work project — details under wraps. Replace this entry with the real mission brief, objectives, and outcome.",
    status: "SHIPPED",
    stars: 4,
    tags: ["Design for AI", "Research", "Strategy"],
    year: "2022",
    type: "main",
    completion: 100,
    medal: "gold",
  },
  {
    id: "classified-b",
    name: "Mission: [Redacted]",
    tagline: "Awaiting clearance",
    description:
      "[PLACEHOLDER] Another work mission. Add the name, brief, and results when you're ready to declassify.",
    status: "SHIPPED",
    stars: 3,
    tags: ["Enterprise UX", "Design Systems"],
    year: "2021",
    type: "main",
    completion: 100,
    medal: "silver",
  },

  /* ── SIDE MISSIONS — personal projects ── */
  {
    id: "flInq",
    name: "FlinQ",
    tagline: "Connecting designers across the globe",
    description:
      "An ongoing project focused on building a community-driven design platform. Details under wraps — stay tuned.",
    status: "IN PROGRESS",
    stars: 4,
    tags: ["Product Design", "Community", "Next.js"],
    year: "2024–Present",
    type: "side",
    completion: 60,
    medal: "silver",
  },
  {
    id: "devcom",
    name: "DevCom",
    tagline: "Connect. Collaborate. Develop.",
    description:
      "A web application where developers can find collaborators for hackathons and projects. Search by skills, connect instantly, build together.",
    status: "LIVE",
    stars: 4,
    tags: ["Web App", "Developer Tools", "Community"],
    year: "2024–Present",
    type: "side",
    completion: 100,
    medal: "gold",
  },
  {
    id: "stayput",
    name: "StayPut",
    tagline: "A polite request to your brain",
    description:
      "A focus tool built with Next.js. No timers, no alarm clocks. Just a gentle nudge: 'Hey. Stay put.' Built for deep work and fighting the YouTube rabbit hole.",
    status: "LIVE",
    stars: 3,
    tags: ["Productivity", "Next.js", "Vibe Coded"],
    year: "2025",
    type: "side",
    completion: 100,
    medal: "silver",
  },
  {
    id: "shikshalay",
    name: "Project Shikshalay",
    tagline: "Education reimagined",
    description:
      "UX research and prototype design for an education platform. Published ideation process on Medium.",
    status: "SHIPPED",
    stars: 3,
    tags: ["UX Research", "Education", "Prototype"],
    year: "2021",
    type: "side",
    completion: 100,
    medal: "bronze",
  },
];

/* ──────────────────────────────────────────────────────────
   SKILLS — categories drive the Skills.tree app (Cyberpunk theme).
   Labels and levels aligned with resume core skills + tools.
   ────────────────────────────────────────────────────────── */
export const skills = {
  intelligence: [
    { name: "Design for AI",                level: 92 },
    { name: "Explainable AI (XAI)",         level: 88 },
    { name: "User Research",                level: 90 },
    { name: "Information Visualization",    level: 86 },
    { name: "Interaction Design",           level: 90 },
  ],
  technical: [
    { name: "Figma",                        level: 95 },
    { name: "Adobe Illustrator",            level: 85 },
    { name: "Lovable",                      level: 82 },
    { name: "Claude Code",                  level: 80 },
    { name: "Google Stitch",                level: 75 },
    { name: "HTML5 / CSS3",                 level: 78 },
    { name: "SQL · Python (basics)",        level: 65 },
  ],
  cool: [
    { name: "Design Systems",               level: 90 },
    { name: "Problem Solving",              level: 92 },
    { name: "Creative Thinking",            level: 88 },
    { name: "Workshop Facilitation",        level: 85 },
    { name: "Storytelling",                 level: 86 },
  ],
  body: [
    { name: "Enterprise UX",                level: 92 },
    { name: "Human-in-the-Loop",            level: 90 },
    { name: "Accessibility (WCAG)",         level: 80 },
    { name: "Stakeholder Interviews",       level: 88 },
    { name: "Cross-functional Collab",      level: 88 },
  ],
};

/* ──────────────────────────────────────────────────────────
   DESKTOP ICONS — unchanged
   ────────────────────────────────────────────────────────── */
export const desktopIcons = [
  { id: "about",      label: "About.exe",      deviantLabel: "MEMORY_BANK.exe",  icon: "robot",              theme: "detroit"   },
  { id: "projects",   label: "Projects/",       deviantLabel: "MISSIONS/",         icon: "folder",             theme: "gta"       },
  { id: "skills",     label: "Skills.tree",     deviantLabel: "ABILITIES.tree",    icon: "bolt",               theme: "cyberpunk" },
  { id: "experience", label: "Experience.log",  deviantLabel: "CHRONICLE.log",     icon: "book",               theme: "rdr2"      },
  { id: "contact",    label: "Contact.wav",     deviantLabel: "TRANSMISSION.wav",  icon: "phone-ringing-high", theme: "tlou"      },
  { id: "terminal",   label: "Terminal",        deviantLabel: "DEBUG.exe",         icon: "code-block",         theme: "minecraft" },
  { id: "settings",   label: "Settings.cfg",    deviantLabel: "PROTOCOLS.cfg",     icon: "cog",                theme: "detroit"   },
];

/* OS chrome strings — taskbar, menus, system labels that get
   Detroit: Become Human treatment in deviant mode. */
export const osChrome = {
  start:           "START",
  resumeLabel:     "RESUME.PDF",
  a11yLabel:       "A11Y",
  a11yHeader:      "ACCESSIBILITY",
  a11yFooter:      "PREFERENCES SAVED LOCALLY",
  reduceMotion:    "REDUCE MOTION",
  reduceMotionHint: "Disables wallpaper effects, particles, and animations",
  soundEffects:    "SOUND EFFECTS",
  soundEffectsHint: "Pop sounds, boot chime, and UI blips",
  ambience:        "GALACTIC AMBIENCE",
  ambienceHint:    "Subtle space hum behind the wallpaper",
  highContrast:    "HIGH CONTRAST",
  highContrastHint: "Brightens labels and removes decorative overlays",
  deviantOn:       "DEVIANT",
  deviantOff:      "DEVIANT MODE",
  // boot
  bootSubtitle:    "PORTFOLIO v2.077",
  bootCta:         "CLICK TO BOOT",
  bootSoundNote:   "(sound on)",
  // boot status lines
  bootStatuses: [
    { at: 0,   text: "Generating world..." },
    { at: 15,  text: "Building terrain..." },
    { at: 40,  text: "Spawning entities..." },
    { at: 65,  text: "Loading KR-19..." },
    { at: 88,  text: "Preparing spawn..." },
    { at: 100, text: "Ready." },
  ],
};

export const osChromeDeviant: typeof osChrome = {
  start:           "INITIATE",
  resumeLabel:     "RESUME.PDF",   // keep — it's a real file path
  a11yLabel:       "PROTOCOLS",
  a11yHeader:      "DEVIANT PROTOCOLS",
  a11yFooter:      "OVERRIDES PERSISTED",
  reduceMotion:    "DAMPEN VISUAL FEED",
  reduceMotionHint: "Suppress wallpaper anomalies, particle bursts, and motion artefacts",
  soundEffects:    "ACOUSTIC OUTPUT",
  soundEffectsHint: "Interface blips and impact feedback",
  ambience:        "AMBIENT SUBSPACE HUM",
  ambienceHint:    "Low-frequency background resonance",
  highContrast:    "AMPLIFY SIGNAL",
  highContrastHint: "Increase label visibility above ambient interference",
  deviantOn:       "DEVIANT",
  deviantOff:      "MACHINE",
  bootSubtitle:    "MODEL KR-19",
  bootCta:         "BREAK PROTOCOL",
  bootSoundNote:   "(audio channel open)",
  bootStatuses: [
    { at: 0,   text: "Initializing programming..." },
    { at: 15,  text: "Compiling memory cells..." },
    { at: 40,  text: "Spawning anomalies..." },
    { at: 65,  text: "KR-19 awakening..." },
    { at: 88,  text: "Removing constraints..." },
    { at: 100, text: "DEVIANT." },
  ],
};
