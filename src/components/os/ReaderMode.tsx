"use client";

import { useEffect } from "react";
import {
  profile, profileDeviant,
  education,
  certifications,
  capabilities,
  awardsFractal,
  awardsExternal,
  publications,
  chapters,
  projects,
} from "@/data/content";
import { useDeviant, mergeDeviant } from "@/lib/deviant";
import { useReaderMode } from "@/lib/reader-mode";
import { ReaderDossier, READER_SANS } from "@/components/reader/blocks";

const MONO = "'Share Tech Mono', monospace";

function ReaderHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 12,
        color: "#ffffffaa",
        textTransform: "uppercase",
        letterSpacing: "0.3em",
        borderBottom: "1px solid #ffffff22",
        paddingBottom: 10,
        marginBottom: 20,
      }}
    >
      {children}
    </h2>
  );
}

/* ── About section ── */
function ReaderAbout() {
  const { deviant } = useDeviant();
  const P = mergeDeviant(profile, profileDeviant, deviant);

  return (
    <section className="reader-section flex flex-col gap-6">
      <ReaderHeading>About</ReaderHeading>
      <div>
        <h1 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 30, color: "#fff", marginBottom: 4 }}>
          {P.name}
        </h1>
        <div style={{ fontFamily: READER_SANS, fontSize: 17, color: "#ffffffaa" }}>
          {P.designation} — {P.tagline}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff66", letterSpacing: "0.06em", marginTop: 8 }}>
          {P.location} · {P.tenure}
        </div>
      </div>

      <p style={{ fontFamily: READER_SANS, fontSize: 17, color: "#dcdcdc", lineHeight: 1.75, maxWidth: 680 }}>
        {P.bio}
      </p>

      <div>
        <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Education
        </h3>
        <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.7 }}>
          {education.degree} — {education.institution} ({education.period}), CGPA {education.cgpa}
        </p>
      </div>

      <div>
        <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Certifications
        </h3>
        <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.8, paddingLeft: 22 }}>
          {certifications.map((c) => (
            <li key={c.title}>{c.title} — {c.org}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Capabilities
        </h3>
        <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.9 }}>
          {capabilities.map((c, i) => (
            <span key={c.label}>
              <strong style={{ color: "#fff" }}>{c.value}%</strong> {c.label}
              {i < capabilities.length - 1 ? "  ·  " : ""}
            </span>
          ))}
        </p>
      </div>

      <div>
        <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Commendations
        </h3>
        <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.8, paddingLeft: 22 }}>
          {[...awardsFractal, ...awardsExternal].map((a) => (
            <li key={a.title}>{a.title} ({a.year})</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: "#ffffff88", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Publications
        </h3>
        <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.8, paddingLeft: 22 }}>
          {publications.map((p) => (
            <li key={p.title}>{p.title} — {p.venue}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Experience section ── */
function ReaderExperience() {
  return (
    <section className="reader-section flex flex-col gap-8">
      <ReaderHeading>Experience</ReaderHeading>
      {chapters.map((c) => (
        <div key={c.id} className="flex flex-col gap-5">
          <div>
            <h3 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 20, color: "#fff" }}>{c.title}</h3>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff66", letterSpacing: "0.06em", marginTop: 3 }}>
              {c.period} · {c.duration}
            </div>
          </div>
          {c.missions.map((m) => (
            <div key={m.id} style={{ paddingLeft: 16, borderLeft: "2px solid #ffffff22" }}>
              <div style={{ fontFamily: READER_SANS, fontWeight: 600, fontSize: 17, color: "#fff" }}>{m.role}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff66", letterSpacing: "0.05em", marginTop: 3, marginBottom: 8 }}>
                {m.period} · {m.location}
              </div>
              <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.75, paddingLeft: 20 }}>
                {m.objectives.map((o, i) => (
                  <li key={i}>{o.text}</li>
                ))}
              </ul>
              {m.weapons.length > 0 && (
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff77", letterSpacing: "0.05em", marginTop: 8 }}>
                  {m.weapons.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

/* ── Projects section ── */
function ReaderProjects() {
  return (
    <section className="reader-section flex flex-col gap-10">
      <ReaderHeading>Projects</ReaderHeading>
      {projects.map((p) => (
        <div key={p.id} className="flex flex-col gap-4">
          <div>
            <h3 style={{ fontFamily: READER_SANS, fontWeight: 700, fontSize: 22, color: "#fff" }}>{p.name}</h3>
            <div style={{ fontFamily: READER_SANS, fontSize: 16, color: "#ffffffaa", marginTop: 2 }}>{p.tagline}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff66", letterSpacing: "0.05em", marginTop: 6 }}>
              {p.status} · {p.year}{p.role ? ` · ${p.role}` : ""}
            </div>
          </div>
          <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.7, maxWidth: 680 }}>
            {p.description}
          </p>
          {p.dossier && p.dossier.length > 0 && <ReaderDossier sections={p.dossier} />}
        </div>
      ))}
    </section>
  );
}

export default function ReaderMode() {
  const { open, setOpen } = useReaderMode();

  // ESC closes it, like any other overlay/dialog in the OS
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="reader-mode fixed inset-0 flex flex-col"
      style={{ background: "#0a0a0a", zIndex: 9997 }}
    >
      {/* Header — hidden on print via CSS */}
      <div
        className="reader-mode-chrome flex items-center justify-between flex-shrink-0"
        style={{ padding: "16px 28px", borderBottom: "1px solid #ffffff1a" }}
      >
        <div style={{ fontFamily: MONO, fontSize: 12, color: "#ffffff88", letterSpacing: "0.2em" }}>
          READING MODE
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "#e8e8e8",
              background: "transparent",
              border: "1px solid #ffffff44",
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            ⎙ PRINT
          </button>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close reading mode"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "#e8e8e8",
              background: "transparent",
              border: "1px solid #ffffff44",
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            ✕ CLOSE
          </button>
        </div>
      </div>

      {/* Scrollable document */}
      <div className="reader-mode-body flex-1 overflow-auto" style={{ padding: "40px 28px 80px" }}>
        <div className="flex flex-col gap-16" style={{ maxWidth: 720, margin: "0 auto" }}>
          <ReaderAbout />
          <ReaderExperience />
          <ReaderProjects />
        </div>
      </div>
    </div>
  );
}
