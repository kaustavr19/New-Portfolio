import type { Metadata } from "next";
import Link from "next/link";
import {
  profile,
  chapters,
  capabilityGroups,
  education,
  certifications,
  awardsFractal,
  awardsExternal,
  publications,
} from "@/data/content";
import { SectionHead } from "@/components/ink/ui";
import { SITE_URL, getCaseStudy, jsonLd, personJsonLd, quickFacts } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Design Consultant, AI & enterprise UX",
  description: profile.bio,
  alternates: { canonical: "/about", types: { "text/markdown": "/about.md" } },
  openGraph: {
    title: "About Kaustav Roy — Design × AI × Enterprise UX",
    description: profile.bioShort,
    type: "profile",
    url: "/about",
    siteName: "KR//OS",
    // Overriding openGraph drops the inherited file-based image — point back at the root card
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Kaustav Roy — KR//OS" }],
  },
};

const allCapabilities = Object.values(capabilityGroups).flat();

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: `${SITE_URL}/about`,
  name: `About ${profile.name}`,
  mainEntity: personJsonLd,
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profilePageJsonLd) }} />

      <header className="flex flex-col gap-3">
        <span className="ink-label ink-live">{profile.tagline}</span>
        <h1 className="ink-dot-900" style={{ fontSize: "clamp(40px, 9vw, 68px)", lineHeight: 0.95 }}>{profile.name.toUpperCase()}</h1>
        <p style={{ fontSize: 19 }}>
          {profile.designation} at Fractal Analytics · {profile.location}
        </p>
        <p style={{ fontSize: 18, lineHeight: 1.75, color: "var(--ink-strong)" }}>{profile.bio}</p>
        <p className="ink-body">
          Start with the <Link href="/work" className="ink-blue">case studies</Link>, or{" "}
          <Link href="/" className="ink-blue">enter KR//OS</Link> for the interactive version.
        </p>
      </header>

      <section aria-labelledby="quick-facts">
        <div id="quick-facts"><SectionHead as="h2">Quick facts</SectionHead></div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {quickFacts.map((f) => (
            <li key={f} className="ink-body" style={{ display: "flex", gap: 12 }}>
              <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink-fg)", marginTop: 11, flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead as="h2">Capabilities — with evidence</SectionHead>
        <div className="flex flex-col gap-4">
          {allCapabilities.map((c) => (
            <div key={c.name} className="ink-card">
              <h3 style={{ fontWeight: 600, fontSize: 18 }}>{c.name}</h3>
              <p className="ink-body" style={{ marginTop: 4 }}>{c.claim}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {c.evidence.map((e) => {
                  const cs = e.projectId ? getCaseStudy(e.projectId) : undefined;
                  const href = cs ? `/work/${cs.id}` : e.href;
                  return (
                    <li key={e.signal} style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)" }}>
                      <strong className="ink-dot" style={{ fontSize: 16, color: "var(--ink-fg)" }}>{e.signal}</strong> — {e.detail}
                      {href && (
                        <>
                          {" "}
                          {href.startsWith("/") ? (
                            <Link href={href} className="ink-blue">({cs ? cs.name : "source"})</Link>
                          ) : (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="ink-blue">(source)</a>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead as="h2">Experience</SectionHead>
        <div className="flex flex-col gap-8">
          {[...chapters].reverse().map((c) => (
            <div key={c.id} className="flex flex-col gap-4">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <h3 className={`ink-dot-900 ${c.status === "in_progress" ? "ink-live" : ""}`} style={{ fontSize: 28 }}>{c.title}</h3>
                <span className="ink-meta">{c.period} · {c.duration}</span>
              </div>
              {[...c.missions].reverse().map((m) => (
                <div key={m.id} className="ink-card">
                  <h4 style={{ fontWeight: 600, fontSize: 17 }}>{m.role}</h4>
                  <div className="ink-meta" style={{ marginTop: 3, marginBottom: 10 }}>{m.period} · {m.location}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.objectives.map((o) => (
                      <li key={o.text} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.55, color: "var(--ink-soft)" }}>
                        <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, marginTop: 6, flexShrink: 0, background: o.done ? "var(--ink-fg)" : "transparent", border: o.done ? 0 : "1.5px solid var(--ink-dim)" }} />
                        {o.text}
                      </li>
                    ))}
                  </ul>
                  {m.weapons.length > 0 && <div className="ink-label" style={{ marginTop: 12 }}>{m.weapons.join(" · ")}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead as="h2">Education</SectionHead>
        <p className="ink-body">
          {education.degree} — {education.institution} ({education.period}), CGPA {education.cgpa}
        </p>
      </section>

      <section>
        <SectionHead as="h2">Commendations</SectionHead>
        <ul style={{ listStyle: "none" }}>
          {[...awardsFractal, ...awardsExternal].map((a) => (
            <li key={a.title} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--ink-line)" }}>
              <span>{a.title}</span>
              <span className="ink-dot" style={{ whiteSpace: "nowrap" }}>{a.year}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead as="h2">Writing</SectionHead>
        <ul style={{ listStyle: "none" }}>
          {publications.map((p) => (
            <li key={p.title} style={{ padding: "10px 0", borderBottom: "1px solid var(--ink-line)" }}>
              {p.href ? (
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="ink-blue">{p.title} ↗</a>
              ) : (
                p.title
              )}
              <span className="ink-meta" style={{ display: "block" }}>{p.venue}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead as="h2">Certifications</SectionHead>
        <ul style={{ listStyle: "none" }}>
          {certifications.map((c) => (
            <li key={c.title} style={{ padding: "10px 0", borderBottom: "1px solid var(--ink-line)" }}>
              {c.title}
              <span className="ink-meta" style={{ display: "block" }}>{c.org}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
