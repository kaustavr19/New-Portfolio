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
export const experience = [
  {
    company: "Fractal Analytics",
    role: "Design Consultant — Insurance Products",
    period: "Jan 2026 – Present",
    location: "Bengaluru, India · Hybrid",
    description:
      "Designing an AI-powered underwriting platform at the intersection of AI, risk, and enterprise UX. End-to-end product design with deep emphasis on human-in-the-loop decisioning, explainable AI, and regulator-ready workflows. Architecting override mechanisms, traceability dashboards, and audit trails for enterprise governance; partnering closely with data science and underwriting domain experts.",
    tags: ["AI/UX", "Underwriting", "XAI", "Enterprise Governance"],
    bounty: "$$$",
  },
  {
    company: "Fractal Analytics",
    role: "Design Consultant — CPG & Cogentiq AI",
    period: "Jul 2024 – Jan 2026",
    location: "Bengaluru, India · Hybrid",
    description:
      "Two parallel tracks: Cogentiq CPG — established the foundational UX direction for an AI-driven CPG intelligence platform, turning complex market data into decision-ready experiences. Cogentiq AI for BI — designed the Design Language & System for Fractal's agentic AI platform, enhanced AggRAG platform UX/UI, and shipped dark-mode design for HDFC Bank's SmartSearch.",
    tags: ["Design System", "Agentic AI", "BI", "CPG"],
    bounty: "$$$",
  },
  {
    company: "Eugenie.ai (Fractal subsidiary)",
    role: "Member of Design Staff II → Design Intern",
    period: "Jul 2022 – Jul 2024",
    location: "Mumbai & Kolkata, India · Remote / On-site",
    description:
      "Featured at Google I/O 2024 for asset & process management dashboard design. Drove a 90-day MVP with Google, Jabil, Flextronics, Meta, and TATA — delivering 11% cost and carbon reduction. Conducted user research, factory visits, and stakeholder interviews. Established brand identity and design systems for AI-powered industrial tools. Delivered design-thinking workshops to engineering and exec audiences.",
    tags: ["Google I/O 2024", "Sustainability", "Industrial UX", "Design Workshops"],
    bounty: "$$$",
  },
];

/* ──────────────────────────────────────────────────────────
   PROJECTS — personal side work
   ────────────────────────────────────────────────────────── */
export const projects = [
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
  muteAudio:       "MUTE AUDIO",
  muteAudioHint:   "Silences pop sounds and boot chime",
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
  muteAudio:       "MUTE AUDITORY INPUT",
  muteAudioHint:   "Disable acoustic stimulation channels",
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
