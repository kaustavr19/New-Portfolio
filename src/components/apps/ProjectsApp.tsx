"use client";

import { useState } from "react";
import { projects } from "@/data/content";

const BEBAS = "'Bebas Neue', cursive";
const MONO = "'Share Tech Mono', monospace";

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
  const [selected, setSelected] = useState(projects[0].id);
  const project = projects.find((p) => p.id === selected) ?? projects[0];

  return (
    <div
      className="h-full flex relative overflow-hidden"
      style={{ background: "#0b0b05", color: "#d4c9a8" }}
    >
      {/* Left — mission list */}
      <div
        className="flex-shrink-0 flex flex-col"
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

        {/* Items fill remaining height evenly */}
        <div className="flex flex-col flex-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="w-full text-left flex-1 flex flex-col justify-center transition-all"
              style={{
                paddingLeft: 24, paddingRight: 16,
                paddingTop: 20, paddingBottom: 20,
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
              <div style={{ fontFamily: MONO, fontSize: 12, color: "#c8b89a", marginBottom: 12, letterSpacing: "0.04em" }}>
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
          <p style={{ fontFamily: MONO, fontSize: 13, color: "#b0a880", lineHeight: 2 }}>
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
