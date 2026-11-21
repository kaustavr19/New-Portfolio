import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReaderDossier, READER_SANS } from "@/components/reader/blocks";
import { caseStudyJsonLd, getCaseStudy, isGated, jsonLd, longformProjects, nextCaseStudy, osLink } from "@/lib/site";

const MONO = "'Share Tech Mono', monospace";

/* Only real case studies get a URL; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return longformProjects.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getCaseStudy(slug);
  if (!p) return {};
  // Consulting entries read "Nexval · Kaustav Roy" via the root title template.
  const title = p.type === "consulting" ? p.name : `${p.name} — Case study`;
  const shareTitle = p.type === "consulting" ? `${p.name} · Kaustav Roy` : `${p.name} — Kaustav Roy`;
  return {
    title,
    description: p.description,
    keywords: p.tags,
    alternates: { canonical: `/work/${p.id}`, types: { "text/markdown": `/work/${p.id}.md` } },
    openGraph: {
      title: shareTitle,
      description: p.description,
      type: "article",
      url: `/work/${p.id}`,
      siteName: "KR//OS",
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: p.description,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getCaseStudy(slug);
  if (!p) notFound();

  const gated = isGated(p);
  const next = nextCaseStudy(p);
  const consulting = p.type === "consulting";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(caseStudyJsonLd(p)) }} />

      <article className="reader-section flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link href="/work" style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff77", letterSpacing: "0.2em", textDecoration: "none" }}>
            ← ALL WORK
          </Link>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#a4c639", letterSpacing: "0.2em" }}>
            {consulting ? "CONSULTING" : "CASE STUDY"} · {p.status}
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

        <p style={{ fontFamily: READER_SANS, fontSize: 18, color: "#dcdcdc", lineHeight: 1.75 }}>{p.summary ?? p.description}</p>

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

        {p.live && (
          <a
            href={p.live.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid #a4c63966", padding: "16px 20px", textDecoration: "none" }}
          >
            <span>
              <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: "#a4c639", letterSpacing: "0.2em", marginBottom: 4 }}>
                <span aria-hidden>● </span>LIVE
              </span>
              <span style={{ fontFamily: READER_SANS, fontSize: 18, fontWeight: 600, color: "#fff" }}>{p.live.label}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
            <span aria-hidden style={{ fontFamily: MONO, fontSize: 18, color: "#a4c639" }}>↗</span>
          </a>
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

            {p.dossier && p.dossier.length > 0 && (
              <section className="flex flex-col gap-6">
                {/* Keeps heading order h1 → h2 → h3 when there's no OBJECTIVES h2 above the dossier */}
                {!p.objectives?.length && (
                  <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, color: "#ffffffaa", letterSpacing: "0.3em", borderBottom: "1px solid #ffffff22", paddingBottom: 10 }}>
                    PROCESS
                  </h2>
                )}
                <ReaderDossier sections={p.dossier} />
              </section>
            )}

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
