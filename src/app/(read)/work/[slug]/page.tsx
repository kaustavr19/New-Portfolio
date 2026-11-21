import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InkDossier } from "@/components/ink/blocks";
import { SectionHead, StatTile } from "@/components/ink/ui";
import { caseStudyJsonLd, getCaseStudy, isGated, jsonLd, longformProjects, nextCaseStudy, osLink } from "@/lib/site";

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
  const live = p.status === "IN PROGRESS";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(caseStudyJsonLd(p)) }} />

      <article className="reader-section flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Link href="/work" className="ink-label" style={{ textDecoration: "none" }}>
            ← All work
          </Link>
          <span className={`ink-label ${live ? "ink-live" : ""}`} style={{ color: "var(--ink-fg)" }}>
            {consulting ? "Consulting" : "Case study"} · {p.status}
          </span>
          <h1 className="ink-dot-900" style={{ fontSize: "clamp(38px, 8vw, 64px)", lineHeight: 0.95, textTransform: "uppercase", overflowWrap: "anywhere" }}>{p.name}</h1>
          <p style={{ fontSize: 20 }}>{p.tagline}</p>
          {p.role && <p className="ink-meta" style={{ letterSpacing: ".03em" }}>{p.role}</p>}
          <Link href={osLink(p)} className="ink-pill" style={{ alignSelf: "flex-start", marginTop: 6 }}>
            ▶ View this mission in KR//OS
          </Link>
        </header>

        <p style={{ fontSize: 18, lineHeight: 1.75, color: "var(--ink-strong)" }}>{p.summary ?? p.description}</p>

        {p.intel && p.intel.length > 0 && (
          <ul className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", listStyle: "none" }}>
            {p.intel.map((s) => (
              <li key={s.label}>
                <StatTile value={s.value} label={s.label} size={34} />
              </li>
            ))}
          </ul>
        )}

        {p.live && (
          <a href={p.live.href} target="_blank" rel="noopener noreferrer" className="ink-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textDecoration: "none", position: "relative", overflow: "hidden" }}>
            <span aria-hidden className="ink-glyph" />
            <span>
              <span className="ink-label ink-live" style={{ display: "block", marginBottom: 6 }}>Live</span>
              <span className="ink-dot-900" style={{ fontSize: 26 }}>{p.live.label.toUpperCase()}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
            <span aria-hidden className="ink-pill solid">Visit ↗</span>
          </a>
        )}

        {gated ? (
          <aside className="ink-card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span aria-hidden style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", border: "1.5px solid var(--ink-red)", display: "grid", placeItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ink-red)" }} />
            </span>
            <div>
              <span className="ink-label ink-red">Classified · active engagement</span>
              <p className="ink-body" style={{ marginTop: 6 }}>{p.classified}</p>
            </div>
          </aside>
        ) : (
          <>
            {p.objectives && p.objectives.length > 0 && (
              <section>
                <SectionHead as="h2">{`Objectives · ${p.objectives.filter((o) => o.done).length} of ${p.objectives.length}`}</SectionHead>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.objectives.map((o) => (
                    <li key={o.text} style={{ display: "flex", gap: 12, fontSize: 16, lineHeight: 1.5, color: o.done ? "var(--ink-soft)" : "var(--ink-mute)" }}>
                      <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, marginTop: 5, flexShrink: 0, background: o.done ? "var(--ink-fg)" : "transparent", border: o.done ? 0 : "1.5px solid var(--ink-dim)" }} />
                      <span>{o.text}{!o.done && <span className="sr-only"> (in progress)</span>}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.dossier && p.dossier.length > 0 && (
              <section className="flex flex-col gap-6">
                {/* Keeps heading order h1 → h2 → h3 when there's no Objectives h2 above the dossier */}
                {!p.objectives?.length && <h2 className="sr-only">Process</h2>}
                <InkDossier sections={p.dossier} headingLevel="h3" />
              </section>
            )}

            {p.debrief && (
              <section>
                <SectionHead as="h2">Debrief</SectionHead>
                <p className="ink-body" style={{ fontSize: 17 }}>{p.debrief}</p>
              </section>
            )}

            {p.classified && (
              <p className="ink-meta" style={{ border: "1px dashed var(--ink-line-strong)", borderRadius: 14, padding: "12px 16px" }}>{p.classified}</p>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-2" aria-label="Topics">
          {p.tags.map((t) => (
            <span key={t} className="ink-label" style={{ border: "1px solid var(--ink-line)", borderRadius: 999, padding: "5px 11px", color: "var(--ink-soft)" }}>
              {t}
            </span>
          ))}
        </div>

        {next && next.id !== p.id && (
          <Link href={`/work/${next.id}`} className="ink-card" style={{ display: "block", textDecoration: "none" }}>
            <span className="ink-label">Next case study →</span>
            <span className="ink-dot-900" style={{ display: "block", fontSize: 26, marginTop: 8, textTransform: "uppercase" }}>{next.name}</span>
            <span style={{ display: "block", fontSize: 15, color: "var(--ink-mute)", marginTop: 4 }}>{next.tagline}</span>
          </Link>
        )}
      </article>
    </>
  );
}
