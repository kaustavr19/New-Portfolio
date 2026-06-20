"use client";

import { useState } from "react";
import { projects } from "@/data/content";
import { useIsMobile } from "@/lib/use-is-mobile";

const BEBAS = "'Bebas Neue', cursive";
const MONO = "'Share Tech Mono', monospace";
// Body-text font — readable sans for long-form prose
const BODY = "'Rajdhani', sans-serif";

const STATUS_COLOR: Record<string, string> = {
  "IN PROGRESS": "#febc2e",
  "LIVE": "#a4c639",
  "SHIPPED": "#4fc3f7",
};

function StarRating({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 12, height: 12,
            background: i < count ? "#ff6b35" : "#2a2a1a",
            border: "1px solid #4a3a0a",
          }}
        />
      ))}
    </div>
  );
}

export default function ProjectsApp() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState(projects[0].id);
  const project = projects.find((p) => p.id === selected) ?? projects[0];

  /* ──────────────────────────────────────────────────────────
     Mobile layout — collapsible mission list (accordion).
     Tap a project header to expand its dossier inline.
     Only one project expanded at a time (`selected` doubles as
     "currently expanded" state).
     ────────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div className="h-full overflow-auto" style={{ background: "#0b0b05", color: "#d4c9a8" }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", background: "#141408", borderBottom: "1px solid #a4c63922" }}>
          <div style={{ fontFamily: BEBAS, fontSize: 11, color: "#a4c63977", letterSpacing: "0.4em", marginBottom: 2 }}>
            ACTIVE MISSIONS
          </div>
          <div className="flex items-baseline justify-between">
            <div style={{ fontFamily: BEBAS, fontSize: 22, color: "#a4c639", letterSpacing: "0.08em" }}>
              {projects.length} FILES FOUND
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#a4c63944", letterSpacing: "0.25em" }}>
              KR//OS
            </div>
          </div>
        </div>

        {/* Project list — accordion */}
        <div className="flex flex-col">
          {projects.map((p) => {
            const isOpen = selected === p.id;
            const statusColor = STATUS_COLOR[p.status] ?? "#888";
            return (
              <div
                key={p.id}
                style={{ borderBottom: "1px solid #a4c63911" }}
              >
                {/* Header row — always visible, tap to toggle */}
                <button
                  onClick={() => setSelected(isOpen ? "" : p.id)}
                  className="w-full text-left flex items-center transition-colors active:bg-white/[0.02]"
                  style={{
                    padding: "16px 20px",
                    background: isOpen ? "#1a1e0a" : "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderLeft: isOpen ? "3px solid #a4c639" : "3px solid transparent",
                    borderBottom: "none",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                      <div
                        style={{
                          fontFamily: MONO, fontSize: 8,
                          padding: "1px 5px",
                          background: `${statusColor}1a`,
                          color: statusColor,
                          border: `1px solid ${statusColor}44`,
                          letterSpacing: "0.15em",
                          flexShrink: 0,
                        }}
                      >
                        {p.status}
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "#6b6b4a", letterSpacing: "0.08em" }}>
                        {p.year}
                      </span>
                    </div>
                    <div style={{ fontFamily: BEBAS, fontSize: 20, color: isOpen ? "#a4c639" : "#c8c8a6", letterSpacing: "0.08em", lineHeight: 1.05 }}>
                      {p.name}
                    </div>
                  </div>
                  {/* Chevron */}
                  <i
                    className="hn hn-angle-down"
                    style={{
                      color: isOpen ? "#a4c639" : "#6b6b4a",
                      fontSize: 16,
                      marginLeft: 12,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease, color 0.25s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: "0 20px 22px" }}>
                    {/* Tagline */}
                    <div style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#d8c8a8", lineHeight: 1.35, letterSpacing: "0.02em", marginBottom: 12 }}>
                      {p.tagline}
                    </div>

                    {/* Stars */}
                    <div style={{ marginBottom: 16 }}>
                      <StarRating count={p.stars} />
                    </div>

                    {/* Brief */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontFamily: BEBAS, fontSize: 12, color: "#a4c63966", letterSpacing: "0.4em", borderBottom: "1px solid #a4c63922", paddingBottom: 6, marginBottom: 12 }}>
                        MISSION BRIEF
                      </div>
                      <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 400, color: "#c8bd9a", lineHeight: 1.55, letterSpacing: "0.01em" }}>
                        {p.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div>
                        <div style={{ fontFamily: BEBAS, fontSize: 12, color: "#a4c63966", letterSpacing: "0.4em", borderBottom: "1px solid #a4c63922", paddingBottom: 6, marginBottom: 10 }}>
                          INTEL TAGS
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontFamily: MONO, fontSize: 10, padding: "4px 10px",
                                background: "#141408",
                                border: "1px solid #a4c63933",
                                color: "#a4c639",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex relative overflow-hidden"
      style={{ background: "#0b0b05", color: "#d4c9a8" }}
    >
      {/* Left — mission list */}
      <div
        className="flex-shrink-0 flex flex-col overflow-auto"
        style={{ width: 200, borderRight: "1px solid #a4c63922" }}
      >
        <div
          style={{ padding: "24px 24px 20px", background: "#141408", borderBottom: "1px solid #a4c63922", flexShrink: 0 }}
        >
          <div style={{ fontFamily: BEBAS, fontSize: 11, color: "#a4c63977", letterSpacing: "0.4em", marginBottom: 2 }}>
            ACTIVE MISSIONS
          </div>
          <div style={{ fontFamily: BEBAS, fontSize: 20, color: "#a4c639", letterSpacing: "0.08em" }}>
            {projects.length} FILES FOUND
          </div>
        </div>

        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className="w-full text-left transition-all"
            style={{
              paddingLeft: 24, paddingRight: 16,
              paddingTop: 18, paddingBottom: 18,
              background: selected === p.id ? "#1a1e0a" : "transparent",
              borderLeft: selected === p.id ? "3px solid #a4c639" : "3px solid transparent",
              borderBottom: "1px solid #a4c63911",
            }}
          >
            <div style={{ fontFamily: BEBAS, fontSize: 16, color: selected === p.id ? "#a4c639" : "#7a7a5a", letterSpacing: "0.06em", marginBottom: 6 }}>
              {p.name}
            </div>
            <div className="flex items-center gap-2">
              <div
                style={{
                  fontFamily: MONO, fontSize: 8,
                  padding: "1px 5px",
                  background: `${STATUS_COLOR[p.status] ?? "#666"}1a`,
                  color: STATUS_COLOR[p.status] ?? "#888",
                  border: `1px solid ${STATUS_COLOR[p.status] ?? "#666"}44`,
                  letterSpacing: "0.15em",
                }}
              >
                {p.status}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Right — mission brief */}
      <div className="flex-1 flex flex-col overflow-auto" style={{ padding: "40px 40px 40px 36px" }}>
        {/* Mission header card */}
        <div
          className="relative"
          style={{
            background: "#141408",
            border: "1px solid #a4c63922",
            boxShadow: "0 0 40px rgba(164,198,57,0.04)",
            padding: "28px 28px 24px",
            marginBottom: 40,
          }}
        >
          <div className="absolute top-4 right-5" style={{ fontFamily: MONO, fontSize: 9, color: "#a4c63922", letterSpacing: "0.3em" }}>
            KR//OS MISSIONS
          </div>
          <div className="flex items-start gap-5">
            <div
              style={{
                width: 72, height: 72, flexShrink: 0,
                background: "#0b0b05",
                border: "1px solid #a4c63944",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36,
              }}
            >
              📁
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: BEBAS, fontSize: 32, color: "#a4c639", letterSpacing: "0.08em", lineHeight: 1, marginBottom: 6 }}>
                {project.name}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#d8c8a8", marginBottom: 14, letterSpacing: "0.02em", lineHeight: 1.35 }}>
                {project.tagline}
              </div>
              <div className="flex items-center gap-3">
                <StarRating count={project.stars} />
                <div
                  style={{
                    fontFamily: MONO, fontSize: 9, padding: "2px 7px",
                    background: `${STATUS_COLOR[project.status] ?? "#666"}1a`,
                    color: STATUS_COLOR[project.status] ?? "#888",
                    border: `1px solid ${STATUS_COLOR[project.status] ?? "#666"}44`,
                    letterSpacing: "0.2em",
                  }}
                >
                  {project.status}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "#6b6b4a" }}>{project.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brief */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: BEBAS, fontSize: 14, color: "#a4c63966", letterSpacing: "0.4em", borderBottom: "1px solid #a4c63922", paddingBottom: 8, marginBottom: 14 }}>
            MISSION BRIEF
          </div>
          <p style={{ fontFamily: BODY, fontSize: 16, fontWeight: 400, color: "#c8bd9a", lineHeight: 1.6, letterSpacing: "0.01em" }}>
            {project.description}
          </p>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ fontFamily: BEBAS, fontSize: 14, color: "#a4c63966", letterSpacing: "0.4em", borderBottom: "1px solid #a4c63922", paddingBottom: 8, marginBottom: 14 }}>
            INTEL TAGS
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: MONO, fontSize: 10, padding: "5px 12px",
                  background: "#141408",
                  border: "1px solid #a4c63933",
                  color: "#a4c639",
                  letterSpacing: "0.08em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Connected missions — pinned to bottom */}
        <div className="mt-auto" style={{ paddingTop: 40 }}>
          <div
            style={{ background: "#0b0b05", border: "1px solid #a4c63922", padding: "20px 24px" }}
          >
            <div style={{ fontFamily: BEBAS, fontSize: 13, color: "#a4c63966", letterSpacing: "0.3em", marginBottom: 12 }}>
              CONNECTED MISSIONS
            </div>
            <div className="flex gap-2 flex-wrap">
              {projects.filter((p) => p.id !== selected).slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  style={{
                    fontFamily: BEBAS, fontSize: 14, padding: "5px 14px",
                    border: "1px solid #a4c63933",
                    color: "#a4c63988",
                    background: "transparent",
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
