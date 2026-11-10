import { profile, projects, awardsFractal, awardsExternal, type Project } from "@/data/content";

/* ──────────────────────────────────────────────────────────
   Site-wide constants + helpers shared by the server-rendered
   (indexable) pages, sitemap, robots, and the OS itself.
   ────────────────────────────────────────────────────────── */

export const SITE_URL = "https://kr-os-folio.vercel.app";
export const SITE_NAME = "KR//OS";

/* An in-progress client engagement with an NDA note shows only its brief.
   Single source of truth — the OS window, reading mode, and the /work
   pages must all agree, or gated detail leaks through one of them. */
export function isGated(p: Pick<Project, "status" | "classified">): boolean {
  return p.status === "IN PROGRESS" && !!p.classified;
}

/* Main missions are the long-form case studies that get their own URL. */
export const caseStudies = projects.filter((p) => p.type === "main");
export const sideProjects = projects.filter((p) => p.type === "side");

export function getCaseStudy(slug: string): Project | undefined {
  return caseStudies.find((p) => p.id === slug);
}

/* Deep link that opens the same case study inside the OS. */
export function osLink(p: Pick<Project, "id">): string {
  return `/#projects/${p.id}`;
}

/* ── Quick facts ──
   Short, self-contained, third-person sentences that search and AI answer
   engines can lift verbatim. Each repeats the name instead of a pronoun so it
   still makes sense quoted alone. Shown on /about and in llms.txt — keep in
   step with content.ts when roles change. */
export const quickFacts: string[] = [
  `${profile.name} is a ${profile.designation} at Fractal Analytics in Bengaluru, India, who designs AI-powered enterprise products.`,
  `${profile.name} specializes in design for AI, explainable AI (XAI), human-in-the-loop decision systems, enterprise UX, and design systems.`,
  `${profile.name} currently leads UX for an AI-assisted commercial insurance underwriting platform at Fractal, as its sole design owner since May 2026.`,
  `At Fractal, ${profile.name} led the design system architecture for the Cogentiq AI platform, used by 50+ designers, cutting design-to-development handoff time by about 40%.`,
  `At Eugenie.ai (2022–2024), ${profile.name} designed industrial AI and digital-twin products, including a predictive-maintenance dashboard featured at Google I/O 2024.`,
  `${profile.name} holds a B.Tech in Computer Science with distinction (CGPA 9.45/10) from the University of Engineering & Management, Kolkata.`,
  `${profile.name} can be reached at ${profile.social.email} or on LinkedIn at ${profile.social.linkedin}.`,
];

/* ── JSON-LD ── */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: profile.name,
  url: SITE_URL,
  jobTitle: profile.designation,
  description: profile.bioShort,
  email: `mailto:${profile.social.email}`,
  worksFor: { "@type": "Organization", name: "Fractal Analytics", url: "https://fractal.ai" },
  hasOccupation: {
    "@type": "Occupation",
    name: profile.designation,
    occupationLocation: { "@type": "City", name: "Bengaluru" },
    skills: "Design for AI, explainable AI, human-in-the-loop systems, enterprise UX, design systems",
  },
  award: [...awardsFractal, ...awardsExternal].map((a) => `${a.title} (${a.year})`),
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Engineering & Management, Kolkata" },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  knowsAbout: [
    "Design for AI",
    "Explainable AI",
    "Human-in-the-loop systems",
    "Enterprise UX",
    "Design systems",
    "Information visualization",
    "Accessibility (WCAG)",
  ],
  sameAs: [profile.social.linkedin, profile.social.medium, "https://github.com/kaustavr19"],
};

export function caseStudyJsonLd(p: Project) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.name,
    description: p.description,
    url: `${SITE_URL}/work/${p.id}`,
    keywords: p.tags.join(", "),
    author: { "@id": `${SITE_URL}/#person`, "@type": "Person", name: profile.name, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/work` },
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE_URL}/work/${p.id}` },
    ],
  };
  return [article, breadcrumbs];
}

/* Serialize for a <script type="application/ld+json"> — escape "<" so a
   string in content can never close the script tag (per Next's JSON-LD guide). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
