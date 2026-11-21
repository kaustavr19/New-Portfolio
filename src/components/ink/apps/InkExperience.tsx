"use client";

import { chapters, education } from "@/data/content";

/* Timeline: newest first. A vertical line of dots; the current role is lit red. */
export default function InkExperience() {
  const ordered = [...chapters].reverse();

  return (
    <div className="ink-app ink-app-scroll">
      <div style={{ padding: "clamp(20px, 3cqi, 36px)", display: "flex", flexDirection: "column", gap: 10 }}>
        <header style={{ marginBottom: 18 }}>
          <span className="ink-label">Timeline · {chapters.reduce((n, c) => n + c.missions.length, 0)} roles across {chapters.length} companies</span>
          <h3 className="ink-dot-900" style={{ fontSize: "clamp(30px, 5cqi, 44px)", lineHeight: 1, marginTop: 8 }}>EXPERIENCE</h3>
        </header>

        <ol style={{ listStyle: "none", position: "relative" }}>
          <span aria-hidden style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 1, background: "repeating-linear-gradient(to bottom, var(--ink-line-strong) 0 3px, transparent 3px 7px)" }} />
          {ordered.map((c) => (
            <li key={c.id} style={{ position: "relative", paddingLeft: 36, paddingBottom: 30 }}>
              <span aria-hidden className={`ink-status ${c.status === "in_progress" ? "live" : ""}`} style={{ position: "absolute", left: 1, top: 10, width: 13, height: 13, background: c.status === "in_progress" ? undefined : "var(--ink-bg)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <h4 className="ink-dot-900" style={{ fontSize: 30, lineHeight: 1 }}>{c.title}</h4>
                <span className="ink-meta">{c.period} · {c.duration}</span>
              </div>

              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                {[...c.missions].reverse().map((m) => {
                  const live = m.status === "in_progress";
                  return (
                    <li key={m.id} className="ink-card" style={{ borderColor: live ? "var(--ink-line-strong)" : undefined }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                        <div>
                          <span className={`ink-label ${live ? "ink-live" : ""}`}>{live ? "Current" : m.duration}</span>
                          <h5 style={{ fontSize: 17, fontWeight: 600, marginTop: 6 }}>{m.role}</h5>
                        </div>
                        <div className="ink-meta" style={{ textAlign: "right" }}>
                          {m.period}
                          <br />
                          {m.location}
                        </div>
                      </div>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, marginTop: 14 }}>
                        {m.objectives.map((o) => (
                          <li key={o.text} style={{ display: "flex", gap: 12, fontSize: 14, lineHeight: 1.5, color: o.done ? "var(--ink-soft)" : "var(--ink-mute)" }}>
                            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, marginTop: 5, flexShrink: 0, background: o.done ? "var(--ink-fg)" : "transparent", border: o.done ? 0 : "1.5px solid var(--ink-dim)" }} />
                            <span>{o.text}{!o.done && <span className="sr-only"> (in progress)</span>}</span>
                          </li>
                        ))}
                      </ul>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                        {m.weapons.map((w) => (
                          <span key={w} className="ink-label" style={{ border: "1px solid var(--ink-line)", borderRadius: 999, padding: "4px 10px", color: "var(--ink-soft)" }}>{w}</span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
          <li style={{ position: "relative", paddingLeft: 36 }}>
            <span aria-hidden className="ink-status" style={{ position: "absolute", left: 1, top: 6, width: 13, height: 13, background: "var(--ink-bg)" }} />
            <span className="ink-label">Education · {education.period}</span>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{education.degree}</div>
            <div className="ink-meta">{education.institution} · CGPA {education.cgpa}</div>
          </li>
        </ol>
      </div>
    </div>
  );
}
