import type { Metadata } from "next";
import Link from "next/link";
import type { Project } from "@/data/content";
import { READER_SANS } from "@/components/reader/blocks";
import { SITE_URL, caseStudies, consultingProjects, jsonLd, longformProjects, sideProjects } from "@/lib/site";

const MONO = "'Share Tech Mono', monospace";

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

const label: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 700,
  fontSize: 12,
  color: "#ffffffaa",
  letterSpacing: "0.3em",
  borderBottom: "1px solid #ffffff22",
  paddingBottom: 10,
  marginBottom: 20,
};

/* Data-driven sections of long-form cards — add an entry to content.ts and it shows up. */
const LONGFORM_SECTIONS: { id: string; title: string; intro?: string; items: Project[] }[] = [
  { id: "case-studies", title: "CASE STUDIES", items: caseStudies },
  { id: "consulting", title: "CONSULTING", intro: "Outside engagements. Strategy through to shipped.", items: consultingProjects },
];

function WorkCard({ p }: { p: Project }) {
  return (
    <Link
      href={`/work/${p.id}`}
      style={{ display: "block", border: "1px solid #ffffff1f", padding: "18px 20px", textDecoration: "none" }}
    >
      <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff77", letterSpacing: "0.12em" }}>
        {p.status} · {p.year}
      </div>
      <h3 style={{ fontFamily: READER_SANS, fontSize: 21, fontWeight: 700, color: "#fff", marginTop: 6 }}>{p.name}</h3>
      <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#ffffffcc", marginTop: 2 }}>{p.tagline}</p>
      <p style={{ fontFamily: READER_SANS, fontSize: 15, color: "#ffffff99", lineHeight: 1.6, marginTop: 8 }}>{p.description}</p>
    </Link>
  );
}

export default function WorkIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionJsonLd) }} />
      <header className="flex flex-col gap-3">
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#a4c639", letterSpacing: "0.2em" }}>KAUSTAV ROY · WORK</div>
        <h1 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 36, color: "#fff", lineHeight: 1.15 }}>
          Designing AI products people can understand, question, and trust.
        </h1>
        <p style={{ fontFamily: READER_SANS, fontSize: 17, color: "#ffffffaa", lineHeight: 1.65 }}>
          Long-form case studies from enterprise AI work at Fractal Analytics and Eugenie.ai, outside consulting engagements, plus things built on the side.
        </p>
      </header>

      {LONGFORM_SECTIONS.filter((s) => s.items.length > 0).map((s) => (
        <section key={s.id} aria-labelledby={`${s.id}-heading`}>
          <h2 id={`${s.id}-heading`} style={label}>{s.title}</h2>
          {s.intro && (
            <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#ffffffaa", lineHeight: 1.6, marginTop: -6, marginBottom: 18 }}>{s.intro}</p>
          )}
          <ul className="flex flex-col gap-4" style={{ listStyle: "none" }}>
            {s.items.map((p) => (
              <li key={p.id}>
                <WorkCard p={p} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="side-projects-heading">
        <h2 id="side-projects-heading" style={label}>SIDE PROJECTS</h2>
        <ul className="flex flex-col gap-5" style={{ listStyle: "none" }}>
          {sideProjects.map((p) => (
            <li key={p.id}>
              <h3 style={{ fontFamily: READER_SANS, fontSize: 18, fontWeight: 600, color: "#fff" }}>
                {p.github ? (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>
                    {p.name}
                  </a>
                ) : (
                  p.name
                )}
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 400, color: "#ffffff66", letterSpacing: "0.08em", marginLeft: 10 }}>
                  {p.status} · {p.year}
                </span>
              </h3>
              <p style={{ fontFamily: READER_SANS, fontSize: 15, color: "#ffffff99", lineHeight: 1.6, marginTop: 4 }}>{p.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
