/* ──────────────────────────────────────────────────────────
   Ask KR-19 — the questions the site itself can't answer.

   HOW TO EDIT
   · Fill in `answer` with a few plain sentences, in your own voice.
     Write in the third person ("He's open to…") — the terminal speaks
     about Kaustav, not as him.
   · Leave `answer` out and the terminal still recognises the question:
     it shows whatever the site already says on the topic (`fromSite`)
     and points the visitor to the contact form for the rest.
   · `ask` holds example phrasings; `re` catches the common shapes.
     Add phrasings when you see a question being missed.

   Tier 2 — recruiter essentials · Tier 3 — how he works
   Declines — topics it politely won't answer (→ contact form)
   ────────────────────────────────────────────────────────── */

export type FaqEntry = {
  id: string;
  tier: 2 | 3;
  topic: string; // short label, shown as the source line
  ask: string[];
  re: RegExp[];
  answer?: string;
  /* Facts already on the site, shown while `answer` is empty. */
  fromSite?: string;
};

export const FAQ: FaqEntry[] = [
  /* ── Tier 2 · recruiter essentials ── */
  {
    id: "open-to-work",
    tier: 2,
    topic: "Availability",
    ask: ["is he open to work", "is he looking for a job", "is he available", "is he open to new opportunities", "can we hire him", "is he job hunting"],
    re: [/\b(open|available|looking)\b.*\b(work|job|role|opportunit|offers?|hire|hiring|position|switch|change)/, /\bcan (we|i|you) hire\b/, /\bjob hunting\b/, /\bavailable\b\s*\??$/],
    // answer: "",
  },
  {
    id: "work-type",
    tier: 2,
    topic: "Engagement type",
    ask: ["does he do freelance", "is he open to consulting", "full time or contract", "does he take side gigs", "can he consult for us"],
    re: [/\b(freelanc|contract(or|ing)?|consult(ing)? (work|gig|project)|side gigs?|part[- ]time|full[- ]time|moonlight)/, /\bconsult for\b/],
    fromSite: "He has taken outside consulting work before — the Nexval website redesign, research to launch in about four months.",
  },
  {
    id: "remote",
    tier: 2,
    topic: "Remote & relocation",
    ask: ["does he work remote", "is he open to relocation", "would he relocate", "hybrid or onsite", "can he move abroad", "does he work from home"],
    re: [/\b(remote\w*|relocat\w*|hybrid|on-?site|in[- ]office|work from home|wfh|move (to|abroad|countr\w*)|abroad|visa)\b/],
    fromSite: "He's worked all three ways: remote (Eugenie.ai), on-site and hybrid (Fractal, Bengaluru). He's based in Kolkata.",
  },
  {
    id: "timezone",
    tier: 2,
    topic: "Time zone & hours",
    ask: ["what time zone is he in", "what are his working hours", "can he overlap with us hours", "us time zone overlap"],
    re: [/\btime ?zones?\b/, /\b(working|work|office) hours\b/, /\boverlap\b/, /\b(ist|est|pst|cet|gmt|utc)\b/],
    fromSite: "He's in Kolkata, India — IST (UTC+5:30).",
  },
  {
    id: "languages",
    tier: 2,
    topic: "Languages",
    ask: ["what languages does he speak", "does he speak english", "does he speak hindi", "is he fluent in english"],
    re: [/\b(speak|spoken|fluent|languages?\b(?!.*(design|visual)))/, /\b(english|hindi|bengali|bangla)\b/],
  },
  {
    id: "seniority",
    tier: 2,
    topic: "Seniority & team",
    ask: ["what level is he", "is he senior", "does he lead a team", "does he manage people", "ic or manager", "has he mentored designers"],
    re: [/\b(senior|seniority|junior|mid[- ]level|level is he|lead (a )?team|manage (people|a team|designers)|people manager|managerial|ic\b|individual contributor|mentor)/],
    fromSite: "He's currently the design lead on Fractal's AI underwriting platform — sole design owner since May 2026 — and set up design standards for the Cogentiq suite.",
  },

  /* ── Tier 3 · how he works ── */
  {
    id: "process",
    tier: 3,
    topic: "Design process",
    ask: ["what is his design process", "how does he approach a project", "how does he work", "walk me through his process", "what's his methodology"],
    re: [/\b(design )?process\b/, /\bapproach (a |to )?(problem|project|design)/, /\bhow does he (work|design|approach)\b/, /\bmethodolog/, /\bworkflow\b.*\b(his|he)\b/],
  },
  {
    id: "collaboration",
    tier: 3,
    topic: "Working with PMs & engineers",
    ask: ["how does he work with engineers", "how does he collaborate with product managers", "does he work well with developers", "how does he handle handoff", "how does he work with stakeholders"],
    re: [/\b(work|works|working|collaborat)\w* (with|alongside) (engineers?|developers?|devs?|pms?|product managers?|stakeholders?|teams?)/, /\bhand-?off\b/],
    fromSite: "His skills page says he creates alignment across product, engineering, data science and design when ownership is ambiguous — at Fractal he led cross-functional work across product, data science and design on the CPG products.",
  },
  {
    id: "ai-practice",
    tier: 3,
    topic: "How he uses AI",
    ask: ["how does he use ai in his work", "does he use ai tools for design", "does he use chatgpt", "how does ai fit in his process", "does he vibe code"],
    re: [
      /\b(does|do|did|how does|how do|how did) (he|you) use (ai|chatgpt|chat gpt|copilot|llms?|gpt|cursor|ai tools)\b/,
      /\bvibe ?cod/,
      /\bai (in|for|into) (his|your) (own )?(work|design|process|workflow)/,
      /\bhow\b.*\bai\b.*\b(his|your) (work|design|process|workflow)/,
    ],
    fromSite: "His skills page says he uses AI to speed up research synthesis, exploration and prototyping while keeping design judgment accountable — tools include Lovable, Claude Code and Google Stitch, and he's built reusable Claude skills for UX audits and benchmarking.",
  },
  {
    id: "motivation",
    tier: 3,
    topic: "What he's looking for",
    ask: ["what kind of problems excite him", "what is he looking for next", "what's his dream role", "what motivates him", "what kind of work does he enjoy"],
    re: [/\b(excite|motivat|passion|enjoy|dream (role|job|company)|looking for next|ideal (role|job|team))/],
  },
  {
    id: "learning",
    tier: 3,
    topic: "Learning right now",
    ask: ["what is he learning", "what is he learning right now", "how does he keep up with design", "what's he exploring lately"],
    re: [/\b(learning|studying|exploring|keep(s|ing)? up|upskill)/],
    fromSite: "His notes mention experimenting with Lovable and Claude Code for design automation and UX research.",
  },
];

/* ── Declines — answered with a polite redirect to the contact form ── */
export type Decline = { id: string; re: RegExp; reply: string };

export const DECLINES: Decline[] = [
  { id: "compensation", re: /\b(salary|salaries|compensation|ctc|pay|payment|hourly rate|day rate|his rates?|fees?|expected (pay|ctc|salary)|how much (does|would|will|did) (he|it) (cost|charge|earn|make)|what does he charge)\b/, reply: "Compensation and rates are best discussed directly." },
  { id: "notice", re: /\b(notice period|joining date|start date|when can he (join|start)|serving notice|last working day)\b/, reply: "Notice and start dates depend on the role — that's one to ask him directly." },
  { id: "references", re: /\b(references?|referees?|reference check|background check)\b/, reply: "References are shared directly, later in a process." },
  { id: "personal", re: /\b(how old|his age|age is he|birthday|date of birth|married|wife|girlfriend|boyfriend|relationship status|religion|religious|caste|politics|political|vote|home address|phone number|mobile number|whatsapp)\b/, reply: "That's personal — this terminal sticks to work." },
];
