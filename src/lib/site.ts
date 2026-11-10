import { profile, projects, type Project } from "@/data/content";

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

/* ── JSON-LD ── */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: profile.name,
  url: SITE_URL,
  jobTitle: profile.designation,
  description: profile.bioShort,
  worksFor: { "@type": "Organization", name: "Fractal Analytics", url: "https://fractal.ai" },
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
  return {
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
}

/* Serialize for a <script type="application/ld+json"> — escape "<" so a
   string in content can never close the script tag (per Next's JSON-LD guide). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
