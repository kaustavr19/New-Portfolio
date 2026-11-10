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
import { READER_SANS } from "@/components/reader/blocks";
import { getCaseStudy, jsonLd, personJsonLd } from "@/lib/site";

const MONO = "'Share Tech Mono', monospace";

export const metadata: Metadata = {
  title: "About — Design Consultant, AI & enterprise UX",
  description: profile.bio,
  alternates: { canonical: "/about" },
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

const h2: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 700,
  fontSize: 12,
  color: "#ffffffaa",
  letterSpacing: "0.3em",
  borderBottom: "1px solid #ffffff22",
  paddingBottom: 10,
  marginBottom: 20,
};
const body: React.CSSProperties = { fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.75 };
const meta: React.CSSProperties = { fontFamily: MONO, fontSize: 11, color: "#ffffff66", letterSpacing: "0.06em" };

const allCapabilities = Object.values(capabilityGroups).flat();

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personJsonLd) }} />

      <header className="flex flex-col gap-3">
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#4fc3f7", letterSpacing: "0.2em" }}>{profile.tagline.toUpperCase()}</div>
        <h1 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 38, color: "#fff" }}>{profile.name}</h1>
        <p style={{ fontFamily: READER_SANS, fontSize: 19, color: "#ffffffcc" }}>
          {profile.designation} at Fractal Analytics · {profile.location}
        </p>
        <p style={{ ...body, fontSize: 18, color: "#dcdcdc" }}>{profile.bio}</p>
        <p style={body}>
          Start with the <Link href="/work" style={{ color: "#4fc3f7" }}>case studies</Link>, or{" "}
          <Link href="/" style={{ color: "#4fc3f7" }}>enter KR//OS</Link> for the interactive version.
        </p>
      </header>

      <section>
        <h2 style={h2}>CAPABILITIES — WITH EVIDENCE</h2>
        <div className="flex flex-col gap-6">
          {allCapabilities.map((c) => (
            <div key={c.name}>
              <h3 style={{ fontFamily: READER_SANS, fontWeight: 600, fontSize: 18, color: "#fff" }}>{c.name}</h3>
              <p style={{ ...body, marginTop: 2 }}>{c.claim}</p>
              <ul style={{ ...body, fontSize: 15, paddingLeft: 20, marginTop: 6 }}>
                {c.evidence.map((e) => {
                  const cs = e.projectId ? getCaseStudy(e.projectId) : undefined;
                  const href = cs ? `/work/${cs.id}` : e.href;
                  return (
                    <li key={e.signal}>
                      <strong style={{ color: "#fff" }}>{e.signal}</strong> — {e.detail}
                      {href && (
                        <>
                          {" "}
                          {href.startsWith("/") ? (
                            <Link href={href} style={{ color: "#4fc3f7" }}>({cs ? cs.name : "source"})</Link>
                          ) : (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#4fc3f7" }}>(source)</a>
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
        <h2 style={h2}>EXPERIENCE</h2>
        <div className="flex flex-col gap-8">
          {[...chapters].reverse().map((c) => (
            <div key={c.id} className="flex flex-col gap-5">
              <div>
                <h3 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 20, color: "#fff" }}>{c.title}</h3>
                <div style={{ ...meta, marginTop: 3 }}>{c.period} · {c.duration}</div>
              </div>
              {[...c.missions].reverse().map((m) => (
                <div key={m.id} style={{ paddingLeft: 16, borderLeft: "2px solid #ffffff22" }}>
                  <h4 style={{ fontFamily: READER_SANS, fontWeight: 600, fontSize: 17, color: "#fff" }}>{m.role}</h4>
                  <div style={{ ...meta, marginTop: 3, marginBottom: 8 }}>{m.period} · {m.location}</div>
                  <ul style={{ ...body, paddingLeft: 20 }}>
                    {m.objectives.map((o) => (
                      <li key={o.text}>{o.text}</li>
                    ))}
                  </ul>
                  {m.weapons.length > 0 && <div style={{ ...meta, color: "#ffffff77", marginTop: 8 }}>{m.weapons.join(" · ")}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={h2}>EDUCATION</h2>
        <p style={body}>
          {education.degree} — {education.institution} ({education.period}), CGPA {education.cgpa}
        </p>
      </section>

      <section>
        <h2 style={h2}>COMMENDATIONS</h2>
        <ul style={{ ...body, paddingLeft: 20 }}>
          {[...awardsFractal, ...awardsExternal].map((a) => (
            <li key={a.title}>
              {a.title} ({a.year})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={h2}>WRITING</h2>
        <ul style={{ ...body, paddingLeft: 20 }}>
          {publications.map((p) => (
            <li key={p.title}>
              {p.href ? (
                <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: "#4fc3f7" }}>{p.title}</a>
              ) : (
                p.title
              )}{" "}
              — {p.venue}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={h2}>CERTIFICATIONS</h2>
        <ul style={{ ...body, paddingLeft: 20 }}>
          {certifications.map((c) => (
            <li key={c.title}>
              {c.title} — {c.org}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
