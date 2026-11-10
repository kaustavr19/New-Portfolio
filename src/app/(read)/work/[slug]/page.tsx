import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReaderDossier, READER_SANS } from "@/components/reader/blocks";
import { caseStudies, caseStudyJsonLd, getCaseStudy, isGated, jsonLd, osLink } from "@/lib/site";

const MONO = "'Share Tech Mono', monospace";

/* Only real case studies get a URL; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getCaseStudy(slug);
  if (!p) return {};
  const title = `${p.name} — Case study`;
  return {
    title,
    description: p.description,
    keywords: p.tags,
    alternates: { canonical: `/work/${p.id}` },
    openGraph: {
      title: `${p.name} — Kaustav Roy`,
      description: p.description,
      type: "article",
      url: `/work/${p.id}`,
      siteName: "KR//OS",
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — Kaustav Roy`,
      description: p.description,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getCaseStudy(slug);
  if (!p) notFound();

  const gated = isGated(p);
  const idx = caseStudies.findIndex((c) => c.id === p.id);
  const next = caseStudies[(idx + 1) % caseStudies.length];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(caseStudyJsonLd(p)) }} />

      <article className="reader-section flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link href="/work" style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff77", letterSpacing: "0.2em", textDecoration: "none" }}>
            ← ALL WORK
          </Link>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#a4c639", letterSpacing: "0.2em" }}>
            CASE STUDY · {p.status}
          </div>
          <h1 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 36, lineHeight: 1.15, color: "#fff" }}>{p.name}</h1>
          <p style={{ fontFamily: READER_SANS, fontSize: 19, color: "#ffffffcc" }}>{p.tagline}</p>
          {p.role && (
            <p style={{ fontFamily: MONO, fontSize: 12, color: "#ffffff77", letterSpacing: "0.05em", lineHeight: 1.6 }}>{p.role}</p>
          )}
          <Link
            href={osLink(p)}
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "#a4c639",
              border: "1px solid #a4c63966",
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            ▶ VIEW THIS MISSION IN KR//OS
          </Link>
        </header>

        <p style={{ fontFamily: READER_SANS, fontSize: 18, color: "#dcdcdc", lineHeight: 1.75 }}>{p.description}</p>

        {p.intel && p.intel.length > 0 && (
          <ul className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", listStyle: "none" }}>
            {p.intel.map((s) => (
              <li key={s.label} style={{ border: "1px solid #ffffff1f", padding: "14px 16px" }}>
                <strong style={{ display: "block", fontFamily: READER_SANS, fontWeight: 700, fontSize: 26, color: "#fff" }}>{s.value}</strong>
                <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: "#ffffff88", letterSpacing: "0.06em", marginTop: 4, lineHeight: 1.4 }}>
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {gated ? (
          <aside style={{ border: "1px dashed #ffffff33", padding: "16px 20px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#febc2e", letterSpacing: "0.2em", marginBottom: 6 }}>
              CLASSIFIED — ACTIVE ENGAGEMENT
            </div>
            <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#e2e2e2", lineHeight: 1.6 }}>{p.classified}</p>
          </aside>
        ) : (
          <>
            {p.objectives && p.objectives.length > 0 && (
              <section>
                <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", letterSpacing: "0.12em", marginBottom: 12 }}>
                  OBJECTIVES
                </h2>
                <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.8, listStyle: "none" }}>
                  {p.objectives.map((o) => (
                    <li key={o.text}>
                      <span aria-hidden style={{ fontFamily: MONO, color: o.done ? "#a4c639" : "#ffffff55", marginRight: 10 }}>
                        {o.done ? "✓" : "○"}
                      </span>
                      {o.text}
                      {!o.done && <span className="sr-only"> (in progress)</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.dossier && p.dossier.length > 0 && <ReaderDossier sections={p.dossier} />}

            {p.debrief && (
              <section>
                <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", letterSpacing: "0.12em", marginBottom: 12 }}>
                  DEBRIEF
                </h2>
                <p style={{ fontFamily: READER_SANS, fontSize: 17, color: "#dcdcdc", lineHeight: 1.75 }}>{p.debrief}</p>
              </section>
            )}

            {p.classified && (
              <p style={{ fontFamily: MONO, fontSize: 12, color: "#ffffff88", lineHeight: 1.6, border: "1px dashed #ffffff22", padding: "12px 16px" }}>
                {p.classified}
              </p>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-2" aria-label="Topics">
          {p.tags.map((t) => (
            <span key={t} style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff99", border: "1px solid #ffffff22", padding: "4px 10px" }}>
              {t}
            </span>
          ))}
        </div>

        {next && next.id !== p.id && (
          <Link
            href={`/work/${next.id}`}
            style={{ display: "block", border: "1px solid #ffffff1f", padding: "16px 20px", textDecoration: "none" }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff77", letterSpacing: "0.2em" }}>NEXT CASE STUDY →</div>
            <div style={{ fontFamily: READER_SANS, fontSize: 19, fontWeight: 600, color: "#fff", marginTop: 4 }}>{next.name}</div>
            <div style={{ fontFamily: READER_SANS, fontSize: 15, color: "#ffffffaa", marginTop: 2 }}>{next.tagline}</div>
          </Link>
        )}
      </article>
    </>
  );
}
