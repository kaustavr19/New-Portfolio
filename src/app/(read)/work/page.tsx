import type { Metadata } from "next";
import Link from "next/link";
import type { Project } from "@/data/content";
import { SectionHead } from "@/components/ink/ui";
import { SITE_URL, caseStudies, consultingProjects, jsonLd, longformProjects, sideProjects } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work — Case studies in AI & enterprise UX",
  description:
    "Case studies by Kaustav Roy: AI-assisted insurance underwriting, agentic-AI workbench realignment, the Cogentiq design language system, Eugenie.ai's industrial digital-twin platform, and consulting work for a US mortgage BPO.",
  alternates: { canonical: "/work", types: { "text/markdown": "/work.md" } },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Work — Kaustav Roy",
  url: `${SITE_URL}/work`,
  author: { "@id": `${SITE_URL}/#person` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: longformProjects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/work/${p.id}`,
      name: p.name,
    })),
  },
};

/* Data-driven sections of long-form cards — add an entry to content.ts and it shows up. */
const LONGFORM_SECTIONS: { id: string; title: string; intro?: string; items: Project[] }[] = [
  { id: "case-studies", title: "Case studies", items: caseStudies },
  { id: "consulting", title: "Consulting", intro: "Outside engagements. Strategy through to shipped.", items: consultingProjects },
];

function WorkCard({ p, n }: { p: Project; n: number }) {
  const live = p.status === "IN PROGRESS";
  return (
    <Link href={`/work/${p.id}`} className="ink-card" style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr)", gap: 14, textDecoration: "none" }}>
      <span className="ink-dot" style={{ fontSize: 20, color: "var(--ink-dim)" }}>{String(n).padStart(2, "0")}</span>
      <span>
        <span className={`ink-label ${live ? "ink-live" : ""}`}>{p.status} · {p.year}</span>
        <span className="ink-dot-900" style={{ display: "block", fontSize: 26, lineHeight: 1.05, marginTop: 8, textTransform: "uppercase" }}>{p.name}</span>
        <span style={{ display: "block", fontSize: 16, marginTop: 6 }}>{p.tagline}</span>
        <span className="ink-body" style={{ display: "block", fontSize: 15, marginTop: 8, color: "var(--ink-mute)" }}>{p.description}</span>
        <span className="ink-label ink-blue" style={{ display: "block", marginTop: 12 }}>Read case study →</span>
      </span>
    </Link>
  );
}

export default function WorkIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionJsonLd) }} />
      <header className="flex flex-col gap-3">
        <span className="ink-label">Kaustav Roy · Work</span>
        <h1 className="ink-dot-900" style={{ fontSize: "clamp(34px, 7vw, 54px)", lineHeight: 1 }}>
          DESIGNING AI PRODUCTS PEOPLE CAN UNDERSTAND, QUESTION, AND TRUST.
        </h1>
        <p className="ink-body" style={{ fontSize: 17 }}>
          Long-form case studies from enterprise AI work at Fractal Analytics and Eugenie.ai, outside consulting engagements, plus things built on the side.
        </p>
      </header>

      {LONGFORM_SECTIONS.filter((s) => s.items.length > 0).map((s) => (
        <section key={s.id} aria-labelledby={`${s.id}-heading`}>
          <div id={`${s.id}-heading`}>
            <SectionHead as="h2" n={String(s.items.length).padStart(2, "0")}>{s.title}</SectionHead>
          </div>
          {s.intro && <p className="ink-body" style={{ marginTop: -4, marginBottom: 16 }}>{s.intro}</p>}
          <ul className="flex flex-col gap-3" style={{ listStyle: "none" }}>
            {s.items.map((p, i) => (
              <li key={p.id}>
                <WorkCard p={p} n={i + 1} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="side-projects-heading">
        <div id="side-projects-heading">
          <SectionHead as="h2" n={String(sideProjects.length).padStart(2, "0")}>Side projects</SectionHead>
        </div>
        <ul style={{ listStyle: "none" }}>
          {sideProjects.map((p) => (
            <li key={p.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--ink-line)" }}>
              <h3 style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 12px", fontSize: 18, fontWeight: 600 }}>
                {p.github ? (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    {p.name} <span className="ink-blue" aria-hidden>↗</span>
                  </a>
                ) : (
                  p.name
                )}
                <span className={`ink-label ${p.status === "IN PROGRESS" ? "ink-live" : ""}`}>{p.status} · {p.year}</span>
              </h3>
              <p className="ink-body" style={{ fontSize: 15, marginTop: 4, color: "var(--ink-mute)" }}>{p.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
