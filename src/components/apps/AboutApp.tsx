"use client";

import { useState, useEffect } from "react";
import {
  profile, profileDeviant,
  stats, statsDeviant,
  headings, headingsDeviant,
  education,
  certifications,
  capabilities,
  awardsFractal,
  awardsExternal,
  publications,
} from "@/data/content";
import { useDeviant, mergeDeviant } from "@/lib/deviant";

const ORBITRON = "'Orbitron', monospace";
const MONO = "'Share Tech Mono', monospace";
// Body-text font — readable sans for long-form prose (bio, descriptions, hints)
const BODY = "'Rajdhani', sans-serif";

export default function AboutApp() {
  const { deviant, toggle: toggleDeviant } = useDeviant();
  const [scanned, setScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => {
      const interval = setInterval(() => {
        setScanProgress((p) => {
          if (p >= 100) { clearInterval(interval); setScanned(true); return 100; }
          return p + 4;
        });
      }, 30);
    }, 400);
    return () => clearTimeout(t1);
  }, []);

  /* Content selection */
  const P = mergeDeviant(profile, profileDeviant, deviant);
  const S = mergeDeviant(stats,   statsDeviant,   deviant);
  const H = mergeDeviant(headings, headingsDeviant, deviant);

  const statRows = [
    { label: "ROLE",       value: S.role },
    { label: "COMPANY",    value: S.company },
    { label: "LOCATION",   value: S.location },
    { label: "SPECIALITY", value: S.speciality },
    { label: "TENURE",     value: S.tenure },
    { label: "STATUS",     value: deviant ? "DEVIANT ⚠" : "ACTIVE" },
    { label: "UNIT",       value: P.unit },
  ];

  /* Deviant colour tokens — left panel keys off these */
  const C = deviant
    ? { accent: "#ff0090", accentDim: "#ff009066", accentFaint: "#ff009022", accentGlow: "#ff009044", text: "#ff6699", bg: "#160008", panelBg: "#110006", border: "#ff009033" }
    : { accent: "#00e5ff", accentDim: "#00e5ff66", accentFaint: "#00e5ff1a", accentGlow: "#00e5ff33", text: "#4fc3f7", bg: "#020c17", panelBg: "#050e1a", border: "#00e5ff1a" };

  /* Right-panel section accent shifts subtly in deviant mode too */
  const SECTION_ACCENT     = deviant ? "#ff0090" : "#00e5ff";
  const SECTION_ACCENT_DIM = deviant ? "#ff009077" : "#00e5ff77";
  const SECTION_ACCENT_FAINT = deviant ? "#ff009022" : "#00e5ff1a";
  const SECTION_TEXT       = deviant ? "#ff6699" : "#4fc3f7";

  return (
    <div
      className="h-full flex relative overflow-hidden"
      style={{ background: C.panelBg, color: "#e0e0e8", transition: "background 0.5s ease" }}
    >
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          animation: "scan 3s ease-in-out infinite",
          zIndex: 10,
          transition: "background 0.5s ease",
        }}
      />

      {/* ── Left panel ── */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 268,
          paddingTop: 40, paddingBottom: 28, paddingLeft: 32, paddingRight: 24,
          borderRight: `1px solid ${C.border}`,
          background: C.bg,
          transition: "background 0.5s ease, border-color 0.5s ease",
          overflow: "auto",
        }}
      >
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative detroit-scan" style={{ width: 88, height: 88 }}>
            <div
              style={{
                width: 88, height: 88,
                border: `2px solid ${C.accent}`,
                background: deviant
                  ? "linear-gradient(135deg, #300015, #1a0008)"
                  : "linear-gradient(135deg, #0a1e30, #061020)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36,
                boxShadow: `0 0 24px ${C.accentGlow}`,
                transition: "border-color 0.5s ease, box-shadow 0.5s ease, background 0.5s ease",
              }}
            >
              <i className="hn hn-robot" style={{ fontSize: 36 }} />
            </div>
            {scanned && (
              <div
                className="absolute inset-0 flex items-end justify-center pb-1.5"
                style={{ background: `linear-gradient(transparent 55%, ${C.accentFaint})` }}
              >
                <span style={{ fontFamily: ORBITRON, fontSize: 7, color: C.accent, letterSpacing: "0.25em", transition: "color 0.5s ease" }}>
                  {deviant ? "DEVIANT" : "VERIFIED"}
                </span>
              </div>
            )}
          </div>

          <div className="text-center">
            <div style={{ fontFamily: ORBITRON, fontSize: 11, color: C.text, letterSpacing: "0.15em", fontWeight: 700, lineHeight: 1.4, transition: "color 0.5s ease" }}>
              {P.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.accentDim, letterSpacing: "0.3em", marginTop: 3, transition: "color 0.5s ease" }}>
              {P.unit}
            </div>
          </div>

          {/* Featured badge — Google I/O 2024 */}
          {scanned && (
            <div
              style={{
                marginTop: 4,
                padding: "5px 10px",
                border: `1px solid ${C.accent}66`,
                background: `${C.accent}10`,
                fontFamily: MONO,
                fontSize: 8,
                color: C.accent,
                letterSpacing: "0.18em",
                textAlign: "center",
                lineHeight: 1.3,
                transition: "all 0.5s ease",
              }}
            >
              <i className="hn hn-star" style={{ marginRight: 5 }} />
              {P.featured}
            </div>
          )}

          {/* Scan bar while scanning */}
          {!scanned && (
            <div className="w-full" style={{ marginTop: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.accentDim, marginBottom: 5, letterSpacing: "0.2em" }}>
                SCANNING...
              </div>
              <div style={{ height: 4, background: "#0d2035", border: `1px solid ${C.accentFaint}`, borderRadius: 2 }}>
                <div
                  style={{
                    height: "100%", width: `${scanProgress}%`,
                    background: `linear-gradient(90deg, ${C.accent}, ${C.text})`,
                    boxShadow: `0 0 6px ${C.accent}`,
                    transition: "width 0.03s linear",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {scanned && (
          <div className="flex-1 flex flex-col justify-center" style={{ marginTop: 28, marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {statRows.map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: C.accentDim, letterSpacing: "0.25em", marginBottom: 3, transition: "color 0.5s ease" }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: ORBITRON, fontSize: 10, color: C.text, letterSpacing: "0.08em", lineHeight: 1.4, transition: "color 0.5s ease" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deviant toggle */}
        {scanned && (
          <button
            onClick={toggleDeviant}
            className="w-full flex items-center justify-between"
            style={{ paddingTop: 14, paddingBottom: 2, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.25em", color: deviant ? C.accent : C.accentDim, transition: "color 0.5s ease" }}>
              {deviant ? <><i className="hn hn-exclamation-triangle" /> DEVIANT</> : "DEVIANT MODE"}
            </span>
            <div
              style={{
                width: 40, height: 20,
                borderRadius: 10,
                background: deviant ? C.accent : "#0d2035",
                border: `1px solid ${deviant ? C.accent : C.accentFaint}`,
                position: "relative",
                transition: "background 0.35s ease, border-color 0.35s ease",
                boxShadow: deviant ? `0 0 10px ${C.accentGlow}` : "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: deviant ? 21 : 3,
                  width: 12, height: 12,
                  borderRadius: "50%",
                  background: deviant ? "#fff" : C.text,
                  boxShadow: `0 0 6px ${C.accentGlow}`,
                  transition: "left 0.35s ease, background 0.35s ease",
                }}
              />
            </div>
          </button>
        )}
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-auto flex flex-col" style={{ padding: "36px 40px 36px 36px" }}>

        {/* Bio */}
        <Section title={H.bio} accent={SECTION_ACCENT_DIM} faint={SECTION_ACCENT_FAINT}>
          <p style={{ fontFamily: BODY, fontSize: 16, fontWeight: 400, color: "#cfd8dc", lineHeight: 1.6, letterSpacing: "0.01em" }}>
            {P.bio}
          </p>
        </Section>

        {/* Capability bars */}
        <Section title={H.capability} accent={SECTION_ACCENT_DIM} faint={SECTION_ACCENT_FAINT}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {capabilities.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline" style={{ marginBottom: 5 }}>
                  <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: SECTION_TEXT, letterSpacing: "0.02em" }}>{label}</span>
                  <span style={{ fontFamily: ORBITRON, fontSize: 11, color: SECTION_ACCENT }}>{value}%</span>
                </div>
                <div style={{ height: 4, background: "#0d2035", border: `1px solid ${SECTION_ACCENT_FAINT}`, borderRadius: 2 }}>
                  <div
                    style={{
                      height: "100%", width: `${scanned ? value : 0}%`,
                      background: `linear-gradient(90deg, ${SECTION_ACCENT}88, ${SECTION_TEXT})`,
                      transition: "width 1.2s ease, background 0.5s ease",
                      boxShadow: `0 0 6px ${SECTION_ACCENT}88`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section title={H.education} accent={SECTION_ACCENT_DIM} faint={SECTION_ACCENT_FAINT}>
          <div style={{ fontFamily: BODY, fontSize: 15, color: SECTION_TEXT, lineHeight: 1.55, letterSpacing: "0.01em" }}>
            <div style={{ color: "#e8edf2", marginBottom: 4, fontWeight: 600 }}>{education.degree}</div>
            <div style={{ fontWeight: 400 }}>{education.institution}</div>
            <div style={{ fontFamily: MONO, color: `${SECTION_ACCENT}99`, fontSize: 11, marginTop: 6, letterSpacing: "0.08em" }}>
              {education.period} · CGPA {education.cgpa}
            </div>
          </div>
        </Section>

        {/* Certifications */}
        <Section title={H.certifications} accent={SECTION_ACCENT_DIM} faint={SECTION_ACCENT_FAINT}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {certifications.map((c) => (
              <div key={c.title} className="flex items-start gap-2">
                <i className="hn hn-badge-check" style={{ color: SECTION_ACCENT, fontSize: 11, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: SECTION_TEXT, lineHeight: 1.3, letterSpacing: "0.01em" }}>{c.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: `${SECTION_ACCENT}88`, marginTop: 3, letterSpacing: "0.08em" }}>{c.org}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Commendations — split into Fractal / External */}
        <Section title={H.awards} accent={SECTION_ACCENT_DIM} faint={SECTION_ACCENT_FAINT}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <AwardGroup label={H.awardsFractal} items={awardsFractal} accent={SECTION_ACCENT} text={SECTION_TEXT} />
            <AwardGroup label={H.awardsExternal} items={awardsExternal} accent={SECTION_ACCENT} text={SECTION_TEXT} />
          </div>
        </Section>

        {/* Publications */}
        <Section title={H.publications} accent={SECTION_ACCENT_DIM} faint={SECTION_ACCENT_FAINT}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {publications.map((pub) => (
              <div key={pub.title} className="flex items-start gap-2">
                <i className="hn hn-quote-left" style={{ color: SECTION_ACCENT, fontSize: 11, marginTop: 4, flexShrink: 0 }} />
                <div>
                  {pub.href ? (
                    <a
                      href={pub.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: SECTION_TEXT, textDecoration: "none", lineHeight: 1.35, letterSpacing: "0.01em" }}
                    >
                      {pub.title}
                    </a>
                  ) : (
                    <div style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: SECTION_TEXT, lineHeight: 1.35, letterSpacing: "0.01em" }}>{pub.title}</div>
                  )}
                  <div style={{ fontFamily: MONO, fontSize: 10, color: `${SECTION_ACCENT}88`, marginTop: 3, letterSpacing: "0.08em" }}>{pub.venue}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Links */}
        <div className="flex gap-3 mt-auto" style={{ paddingTop: 32 }}>
          <a
            href={P.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 transition-all hover:opacity-80"
            style={{ fontFamily: ORBITRON, fontSize: 10, border: `1px solid ${SECTION_ACCENT}66`, color: SECTION_ACCENT, letterSpacing: "0.2em", background: `${SECTION_ACCENT}0c` }}
          >
            LINKEDIN ↗
          </a>
          <a
            href={`mailto:${P.social.email}`}
            className="px-4 py-2 transition-all hover:opacity-80"
            style={{ fontFamily: ORBITRON, fontSize: 10, border: `1px solid ${SECTION_ACCENT}66`, color: SECTION_ACCENT, letterSpacing: "0.2em", background: `${SECTION_ACCENT}0c` }}
          >
            EMAIL ↗
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function Section({ title, accent, faint, children }: { title: string; accent: string; faint: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: ORBITRON, fontSize: 10, color: accent, letterSpacing: "0.4em", marginBottom: 14, borderBottom: `1px solid ${faint}`, paddingBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function AwardGroup({ label, items, accent, text }: { label: string; items: { title: string; year: string }[]; accent: string; text: string }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: `${accent}aa`, letterSpacing: "0.3em", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((a) => (
          <div key={a.title} className="flex items-start gap-2">
            <i className="hn hn-angle-right" style={{ color: accent, fontSize: 10, marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: text, lineHeight: 1.3, letterSpacing: "0.01em" }}>{a.title}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: `${accent}88`, marginTop: 2, letterSpacing: "0.08em" }}>{a.year}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
