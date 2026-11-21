"use client";

import {
  awardsExternal,
  awardsFractal,
  capabilities,
  certifications,
  education,
  profile,
  publications,
  stats,
} from "@/data/content";
import { requestPersonnelBrief } from "@/lib/personnel-brief";
import { useReaderMode } from "@/lib/reader-mode";
import { SectionHead, SegBar } from "../ui";

/* Dot-pattern portrait: head + shoulders silhouette through a dot mask. */
function Avatar() {
  return (
    <div style={{ alignSelf: "center", padding: 6, borderRadius: "50%", border: "1px solid var(--ink-line-strong)" }} aria-hidden>
      <div
        style={{
          width: 124,
          height: 124,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 38%, var(--ink-fg) 0 22%, transparent 23%), radial-gradient(ellipse at 50% 100%, var(--ink-fg) 0 46%, transparent 47%)",
          WebkitMask: "radial-gradient(circle, #000 1.1px, transparent 1.6px) 0 0/5px 5px",
          mask: "radial-gradient(circle, #000 1.1px, transparent 1.6px) 0 0/5px 5px",
        }}
      />
    </div>
  );
}

export default function InkAbout() {
  const { setOpen: openReader } = useReaderMode();
  const rows: [string, string, boolean?][] = [
    ["Role", stats.role],
    ["Company", stats.company],
    ["Location", stats.location],
    ["Speciality", stats.speciality],
    ["Tenure", stats.tenure],
    ["Status", profile.status.charAt(0) + profile.status.slice(1).toLowerCase(), true],
  ];

  return (
    <div className="ink-app ink-app-scroll">
      <div className="ink-split">
        <aside className="ink-split-side">
          <Avatar />
          <div style={{ textAlign: "center" }}>
            <h3 className="ink-dot-900" style={{ fontSize: 30, lineHeight: 1 }}>{profile.name.toUpperCase()}</h3>
            <div className="ink-meta" style={{ marginTop: 6 }}>{profile.unit} · {profile.tagline}</div>
          </div>
          <span className="ink-label" style={{ alignSelf: "center", border: "1px solid var(--ink-line-strong)", borderRadius: 999, padding: "6px 12px", color: "var(--ink-fg)", whiteSpace: "nowrap" }}>
            {profile.featured}
          </span>
          <dl style={{ display: "flex", flexDirection: "column" }}>
            {rows.map(([k, v, live]) => (
              <div key={k} style={{ padding: "9px 0", borderBottom: "1px dashed var(--ink-line)" }}>
                <dt className="ink-label">{k}</dt>
                <dd className={live ? "ink-live" : ""} style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{v}</dd>
              </div>
            ))}
          </dl>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
            <a className="ink-pill action" href={profile.social.linkedin} target="_blank" rel="noopener noreferrer me">LinkedIn ↗</a>
            <a className="ink-pill action" href={`mailto:${profile.social.email}`}>Email</a>
          </div>
        </aside>

        <div className="ink-split-main" style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <section>
            <SectionHead as="h4">Biographical data</SectionHead>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--ink-strong)", maxWidth: 680 }}>{profile.bio}</p>
          </section>

          <div className="ink-raised" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <div>
              <span className="ink-label">Recruiter brief</span>
              <p style={{ fontSize: 14, color: "var(--ink-mute)", marginTop: 4 }}>Role fit, proof points, and the strongest work to review first.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="ink-pill solid" onClick={requestPersonnelBrief}>Open brief →</button>
              <button type="button" className="ink-pill" onClick={() => openReader(true)}>Reading view</button>
            </div>
          </div>

          <section>
            <SectionHead as="h4">Capability matrix</SectionHead>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {capabilities.map((c) => (
                <li key={c.label} style={{ display: "grid", gridTemplateColumns: "minmax(150px, 220px) minmax(0, 1fr) 38px", alignItems: "center", gap: 14, padding: "7px 0" }}>
                  <span style={{ fontSize: 14 }}>{c.label}</span>
                  <SegBar value={c.value} label={c.label} />
                  <span className="ink-dot" style={{ fontSize: 17, textAlign: "right" }}>{c.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHead as="h4">Education</SectionHead>
            <div className="ink-tile" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{education.degree}</div>
                <div className="ink-meta" style={{ marginTop: 4 }}>{education.institution} · {education.period}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="ink-dot-900" style={{ fontSize: 26 }}>{education.cgpa.split(" ")[0]}</div>
                <div className="ink-label">CGPA / 10</div>
              </div>
            </div>
          </section>

          <section>
            <SectionHead as="h4">Commendations</SectionHead>
            <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
              {[...awardsFractal.map((a) => ({ ...a, org: "Fractal" })), ...awardsExternal.map((a) => ({ ...a, org: "External" }))].map((a) => (
                <li key={a.title} className="ink-tile" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>
                    <span style={{ display: "block", fontSize: 14 }}>{a.title}</span>
                    <span className="ink-label" style={{ display: "block", marginTop: 4 }}>{a.org}</span>
                  </span>
                  <span className="ink-dot" style={{ fontSize: 15, whiteSpace: "nowrap" }}>{a.year}</span>
                </li>
              ))}
            </ul>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 26 }}>
            <section>
              <SectionHead as="h4">Certifications</SectionHead>
              <ul style={{ listStyle: "none" }}>
                {certifications.map((c) => (
                  <li key={c.title} style={{ padding: "8px 0", borderBottom: "1px solid var(--ink-line)" }}>
                    <span style={{ fontSize: 14 }}>{c.title}</span>
                    <span className="ink-meta" style={{ display: "block" }}>{c.org}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <SectionHead as="h4">Writing</SectionHead>
              <ul style={{ listStyle: "none" }}>
                {publications.map((p) => (
                  <li key={p.title} style={{ padding: "8px 0", borderBottom: "1px solid var(--ink-line)" }}>
                    {p.href ? (
                      <a href={p.href} target="_blank" rel="noopener noreferrer" className="ink-blue" style={{ fontSize: 14, textDecoration: "none" }}>{p.title} ↗</a>
                    ) : (
                      <span style={{ fontSize: 14 }}>{p.title}</span>
                    )}
                    <span className="ink-meta" style={{ display: "block" }}>{p.venue}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
