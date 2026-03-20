"use client";

import { useState } from "react";
import { experience } from "@/data/content";

const CINZEL = "'Cinzel', serif";
const MONO = "'Share Tech Mono', monospace";

export default function ExperienceApp() {
  const [selected, setSelected] = useState(0);
  const job = experience[selected];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — journal list */}
      <div
        className="flex-shrink-0 flex flex-col overflow-auto rdr-paper"
        style={{ width: 196, borderRight: "2px solid #c8a96e44" }}
      >
        <div
          style={{ padding: "20px 28px", background: "#e4d4a8", borderBottom: "2px solid #c8a96e44" }}
        >
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#8b6020", letterSpacing: "0.3em", marginBottom: 3 }}>
            ARTHUR&apos;S JOURNAL
          </div>
          <div style={{ fontFamily: CINZEL, fontSize: 15, color: "#2a1a0e", fontWeight: 600 }}>
            Work History
          </div>
        </div>

        {experience.map((job, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="w-full text-left transition-all"
            style={{
              paddingLeft: 28, paddingRight: 20,
              paddingTop: 18, paddingBottom: 18,
              background: selected === i ? "#ddc89055" : "transparent",
              borderLeft: selected === i ? "3px solid #8b4423" : "3px solid transparent",
              borderBottom: "1px solid #c8a96e2a",
            }}
          >
            <div style={{ fontFamily: CINZEL, fontSize: 11, color: selected === i ? "#2a1a0e" : "#6b4a20", marginBottom: 4, fontWeight: selected === i ? 600 : 400 }}>
              {job.company}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#8b6020" }}>
              {job.period.split("–")[0].trim()}
            </div>
          </button>
        ))}
      </div>

      {/* Right — journal page */}
      <div className="flex-1 overflow-auto rdr-paper relative">
        {/* Stitched top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "repeating-linear-gradient(90deg, #c8a96e55 0, #c8a96e55 8px, transparent 8px, transparent 14px)",
          }}
        />

        <div className="flex flex-col" style={{ padding: "40px 40px 40px 36px", minHeight: "100%" }}>
          {/* Header */}
          <div className="flex items-start justify-between" style={{ marginBottom: 36 }}>
            <div>
              <div style={{ fontFamily: CINZEL, fontSize: 20, color: "#2a1a0e", fontStyle: "italic", fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
                {job.role}
              </div>
              <div style={{ fontFamily: CINZEL, fontSize: 14, color: "#6b4423", fontWeight: 700, letterSpacing: "0.04em" }}>
                {job.company}
              </div>
            </div>

            {/* Bounty badge */}
            <div
              style={{
                padding: "10px 16px",
                border: "2px solid #8b4423",
                background: "#e8d09077",
                textAlign: "center",
                minWidth: 88,
                flexShrink: 0,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 8, color: "#8b4423", letterSpacing: "0.3em", marginBottom: 4 }}>BOUNTY</div>
              <div style={{ fontFamily: CINZEL, fontSize: 22, color: "#6b2a0e", fontWeight: 700 }}>{job.bounty}</div>
            </div>
          </div>

          {/* ── Group 1: Period/Territory + Description ── */}
          <div style={{ marginBottom: 40, paddingBottom: 36, borderBottom: "1px dashed #c8a96e66" }}>
            <div className="flex items-start gap-8" style={{ marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#8b6020", letterSpacing: "0.25em", marginBottom: 4 }}>PERIOD</div>
                <div style={{ fontFamily: CINZEL, fontSize: 12, color: "#2a1a0e" }}>{job.period}</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#8b6020", letterSpacing: "0.25em", marginBottom: 4 }}>TERRITORY</div>
                <div style={{ fontFamily: CINZEL, fontSize: 12, color: "#2a1a0e" }}>{job.location}</div>
              </div>
            </div>
            <p style={{ fontFamily: CINZEL, fontSize: 13, color: "#3a2a10", lineHeight: 2.1, margin: 0 }}>
              {job.description}
            </p>
          </div>

          {/* ── Group 2: Tags ── */}
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: MONO, fontSize: 9,
                  padding: "4px 12px",
                  border: "1px solid #8b4423",
                  color: "#6b4423",
                  background: "#ddc89044",
                  letterSpacing: "0.1em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Nav — pinned to bottom */}
          <div className="flex items-center justify-between mt-auto" style={{ paddingTop: 40, borderTop: "1px dashed #c8a96e44", marginTop: 40 }}>
            <div className="flex gap-3">
              {selected > 0 && (
                <button
                  onClick={() => setSelected((s) => s - 1)}
                  style={{
                    fontFamily: CINZEL, fontSize: 11, padding: "6px 16px",
                    border: "1px solid #8b442366",
                    color: "#6b4423", background: "transparent",
                    cursor: "pointer", letterSpacing: "0.1em",
                  }}
                >
                  ← Newer
                </button>
              )}
              {selected < experience.length - 1 && (
                <button
                  onClick={() => setSelected((s) => s + 1)}
                  style={{
                    fontFamily: CINZEL, fontSize: 11, padding: "6px 16px",
                    border: "1px solid #8b442366",
                    color: "#6b4423", background: "transparent",
                    cursor: "pointer", letterSpacing: "0.1em",
                  }}
                >
                  Older →
                </button>
              )}
            </div>
            <div style={{ fontFamily: CINZEL, fontSize: 10, color: "#8b602044" }}>
              Entry {selected + 1} of {experience.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
