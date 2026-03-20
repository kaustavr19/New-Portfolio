"use client";

import { useState, useEffect } from "react";
import { profile, awards } from "@/data/content";

const ORBITRON = "'Orbitron', monospace";
const MONO = "'Share Tech Mono', monospace";

export default function AboutApp() {
  const [scanned, setScanned] = useState(false);
  const [deviant, setDeviant] = useState(false);
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

  const stats = [
    { label: "ROLE", value: "Design Consultant" },
    { label: "COMPANY", value: "Fractal" },
    { label: "LOCATION", value: "Bengaluru, IN" },
    { label: "SPECIALITY", value: "AI-Powered UX" },
    { label: "STATUS", value: deviant ? "DEVIANT ⚠" : "ACTIVE" },
    { label: "UNIT", value: profile.unit },
  ];

  // Deviant colour tokens — everything in the left panel keys off these
  const C = deviant
    ? { accent: "#ff0090", accentDim: "#ff009066", accentFaint: "#ff009022", accentGlow: "#ff009044", text: "#ff6699", bg: "#160008", panelBg: "#110006", border: "#ff009033" }
    : { accent: "#00e5ff", accentDim: "#00e5ff66", accentFaint: "#00e5ff1a", accentGlow: "#00e5ff33", text: "#4fc3f7", bg: "#020c17", panelBg: "#050e1a", border: "#00e5ff1a" };

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

      {/* Left panel */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 256,
          paddingTop: 48, paddingBottom: 36, paddingLeft: 36, paddingRight: 28,
          borderRight: `1px solid ${C.border}`,
          background: C.bg,
          transition: "background 0.5s ease, border-color 0.5s ease",
        }}
      >
        {/* ── Top: avatar + name ── */}
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
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
              🤖
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

          {/* Name */}
          <div className="text-center">
            <div style={{ fontFamily: ORBITRON, fontSize: 11, color: C.text, letterSpacing: "0.15em", fontWeight: 700, lineHeight: 1.4, transition: "color 0.5s ease" }}>
              {profile.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.accentDim, letterSpacing: "0.3em", marginTop: 3, transition: "color 0.5s ease" }}>
              {profile.unit}
            </div>
          </div>

          {/* Scan bar (while scanning) */}
          {!scanned && (
            <div className="w-full">
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

        {/* ── Middle: stats (flex-1, centred) ── */}
        {scanned && (
          <div className="flex-1 flex flex-col justify-center" style={{ marginTop: 36, marginBottom: 36 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: C.accentDim, letterSpacing: "0.25em", marginBottom: 3, transition: "color 0.5s ease" }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: ORBITRON, fontSize: 10, color: C.text, letterSpacing: "0.08em", transition: "color 0.5s ease" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom: deviant toggle switch ── */}
        {scanned && (
          <button
            onClick={() => setDeviant((d) => !d)}
            className="w-full flex items-center justify-between"
            style={{ paddingTop: 14, paddingBottom: 2, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.25em", color: deviant ? C.accent : C.accentDim, transition: "color 0.5s ease" }}>
              {deviant ? "⚠ DEVIANT" : "DEVIANT MODE"}
            </span>
            {/* Pill track */}
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
              {/* Knob */}
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

      {/* Right panel */}
      <div className="flex-1 overflow-auto flex flex-col" style={{ padding: "40px 40px 40px 36px" }}>
        {/* Bio */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: ORBITRON, fontSize: 10, color: "#00e5ff77", letterSpacing: "0.4em", marginBottom: 12, borderBottom: "1px solid #00e5ff1a", paddingBottom: 8 }}>
            BIOGRAPHICAL DATA
          </div>
          <p style={{ fontFamily: MONO, fontSize: 13, color: "#b0bec5", lineHeight: 2, letterSpacing: "0.02em" }}>
            {profile.bio}
          </p>
        </div>

        {/* Capability bars */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: ORBITRON, fontSize: 10, color: "#00e5ff77", letterSpacing: "0.4em", marginBottom: 16, borderBottom: "1px solid #00e5ff1a", paddingBottom: 8 }}>
            CAPABILITY MATRIX
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Product Design", value: 95 },
              { label: "AI / UX Strategy", value: 88 },
              { label: "User Research", value: 90 },
              { label: "Design Systems", value: 87 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: "#4fc3f7" }}>{label}</span>
                  <span style={{ fontFamily: ORBITRON, fontSize: 11, color: "#00e5ff" }}>{value}%</span>
                </div>
                <div style={{ height: 4, background: "#0d2035", border: "1px solid #00e5ff1a", borderRadius: 2 }}>
                  <div
                    style={{
                      height: "100%", width: `${scanned ? value : 0}%`,
                      background: "linear-gradient(90deg, #00e5ff88, #4fc3f7)",
                      transition: "width 1.2s ease",
                      boxShadow: "0 0 6px #00e5ff88",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ fontFamily: ORBITRON, fontSize: 10, color: "#00e5ff77", letterSpacing: "0.4em", marginBottom: 16, borderBottom: "1px solid #00e5ff1a", paddingBottom: 8 }}>
            COMMENDATIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {awards.map((award) => (
              <div key={award.title} className="flex items-start gap-3">
                <span style={{ color: "#00e5ff", fontSize: 12, marginTop: 1 }}>▸</span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "#4fc3f7" }}>{award.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: "#00e5ff55", marginTop: 3 }}>{award.org} · {award.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links — pushed to bottom */}
        <div className="flex gap-3 mt-auto" style={{ paddingTop: 40 }}>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 transition-all hover:bg-[#00e5ff1a]"
            style={{ fontFamily: ORBITRON, fontSize: 10, border: "1px solid #00e5ff44", color: "#00e5ff", letterSpacing: "0.2em" }}
          >
            LINKEDIN ↗
          </a>
          <a
            href={`mailto:${profile.social.email}`}
            className="px-4 py-2 transition-all hover:bg-[#00e5ff1a]"
            style={{ fontFamily: ORBITRON, fontSize: 10, border: "1px solid #00e5ff44", color: "#00e5ff", letterSpacing: "0.2em" }}
          >
            EMAIL ↗
          </a>
        </div>
      </div>
    </div>
  );
}
