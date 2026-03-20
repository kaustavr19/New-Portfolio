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

  return (
    <div
      className="h-full flex relative overflow-hidden"
      style={{ background: "#050e1a", color: "#e0e0e8" }}
    >
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #00e5ff, transparent)",
          animation: "scan 3s ease-in-out infinite",
          zIndex: 10,
        }}
      />

      {/* Left panel */}
      <div
        className="flex-shrink-0 flex flex-col items-center pt-10 pb-8 gap-5"
        style={{ width: 256, paddingLeft: 36, paddingRight: 28, borderRight: "1px solid #00e5ff1a", background: "#020c17" }}
      >
        {/* Avatar */}
        <div className="relative detroit-scan" style={{ width: 88, height: 88 }}>
          <div
            style={{
              width: 88, height: 88,
              border: "2px solid #00e5ff",
              background: "linear-gradient(135deg, #0a1e30, #061020)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
              boxShadow: "0 0 24px #00e5ff33",
            }}
          >
            🤖
          </div>
          {scanned && (
            <div
              className="absolute inset-0 flex items-end justify-center pb-1.5"
              style={{ background: "linear-gradient(transparent 55%, #00e5ff22)" }}
            >
              <span style={{ fontFamily: ORBITRON, fontSize: 7, color: "#00e5ff", letterSpacing: "0.25em" }}>VERIFIED</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <div style={{ fontFamily: ORBITRON, fontSize: 11, color: "#4fc3f7", letterSpacing: "0.15em", fontWeight: 700, lineHeight: 1.4 }}>
            {profile.name.toUpperCase()}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#00e5ff55", letterSpacing: "0.3em", marginTop: 3 }}>
            {profile.unit}
          </div>
        </div>

        {/* Scan bar */}
        {!scanned && (
          <div className="w-full">
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#00e5ff88", marginBottom: 5, letterSpacing: "0.2em" }}>
              SCANNING...
            </div>
            <div style={{ height: 4, background: "#0d2035", border: "1px solid #00e5ff33", borderRadius: 2 }}>
              <div
                style={{
                  height: "100%", width: `${scanProgress}%`,
                  background: "linear-gradient(90deg, #00e5ff, #4fc3f7)",
                  boxShadow: "0 0 6px #00e5ff",
                  transition: "width 0.03s linear",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        {scanned && (
          <div className="w-full space-y-3">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#00e5ff55", letterSpacing: "0.25em", marginBottom: 1 }}>{label}</div>
                <div style={{ fontFamily: ORBITRON, fontSize: 10, color: label === "STATUS" && deviant ? "#ff0090" : "#4fc3f7", letterSpacing: "0.08em" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deviant toggle */}
        {scanned && (
          <button
            onClick={() => setDeviant((d) => !d)}
            className="w-full mt-auto py-2 text-center transition-all"
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.25em",
              border: `1px solid ${deviant ? "#ff009077" : "#00e5ff33"}`,
              color: deviant ? "#ff0090" : "#00e5ff77",
              background: deviant ? "#1a0010" : "transparent",
            }}
          >
            {deviant ? "⚠ DEVIANT MODE" : "TOGGLE DEVIANT"}
          </button>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto space-y-7" style={{ padding: "36px 40px 36px 36px" }}>
        {/* Bio */}
        <div>
          <div style={{ fontFamily: ORBITRON, fontSize: 10, color: "#00e5ff77", letterSpacing: "0.4em", marginBottom: 10, borderBottom: "1px solid #00e5ff1a", paddingBottom: 6 }}>
            BIOGRAPHICAL DATA
          </div>
          <p style={{ fontFamily: MONO, fontSize: 13, color: "#b0bec5", lineHeight: 1.9, letterSpacing: "0.02em" }}>
            {profile.bio}
          </p>
        </div>

        {/* Capability bars */}
        <div>
          <div style={{ fontFamily: ORBITRON, fontSize: 10, color: "#00e5ff77", letterSpacing: "0.4em", marginBottom: 10, borderBottom: "1px solid #00e5ff1a", paddingBottom: 6 }}>
            CAPABILITY MATRIX
          </div>
          <div className="space-y-3">
            {[
              { label: "Product Design", value: 95 },
              { label: "AI / UX Strategy", value: 88 },
              { label: "User Research", value: 90 },
              { label: "Design Systems", value: 87 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
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
        <div>
          <div style={{ fontFamily: ORBITRON, fontSize: 10, color: "#00e5ff77", letterSpacing: "0.4em", marginBottom: 10, borderBottom: "1px solid #00e5ff1a", paddingBottom: 6 }}>
            COMMENDATIONS
          </div>
          <div className="space-y-3">
            {awards.map((award) => (
              <div key={award.title} className="flex items-start gap-3">
                <span style={{ color: "#00e5ff", fontSize: 12, marginTop: 1 }}>▸</span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "#4fc3f7" }}>{award.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: "#00e5ff55", marginTop: 1 }}>{award.org} · {award.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-3 pt-1">
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
