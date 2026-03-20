"use client";

import { useState } from "react";
import { skills } from "@/data/content";

const RAJDHANI = "'Rajdhani', sans-serif";
const MONO = "'Share Tech Mono', monospace";

type Category = "intelligence" | "technical" | "cool" | "body";

const categoryMeta: Record<Category, { label: string; stat: string; color: string; icon: string }> = {
  intelligence: { label: "INTELLIGENCE", stat: "INT", color: "#00ffff", icon: "🧠" },
  technical:    { label: "TECHNICAL",    stat: "TEC", color: "#f5e642", icon: "⚡" },
  cool:         { label: "COOL",         stat: "COL", color: "#ff0090", icon: "😎" },
  body:         { label: "BODY",         stat: "BOD", color: "#a855f7", icon: "💪" },
};

const CATEGORIES: Category[] = ["intelligence", "technical", "cool", "body"];

export default function SkillsApp() {
  const [active, setActive] = useState<Category>("intelligence");

  const activeSkills = skills[active];
  const meta = categoryMeta[active];

  return (
    <div
      className="h-full flex relative overflow-hidden"
      style={{ background: "#0a0a14" }}
    >
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(245,230,66,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,66,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Left — attribute nav */}
      <div
        className="flex-shrink-0 flex flex-col pt-6 pb-5 relative z-10"
        style={{ width: 196, borderRight: "1px solid #f5e64222" }}
      >
        <div style={{ fontFamily: RAJDHANI, fontSize: 11, color: "#f5e64255", letterSpacing: "0.5em", padding: "0 24px", marginBottom: 16 }}>
          ATTRIBUTES
        </div>

        {CATEGORIES.map((cat) => {
          const m = categoryMeta[cat];
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="flex items-center gap-3 py-3 text-left transition-all relative"
              style={{
                padding: "12px 24px",
                background: isActive ? `${m.color}0e` : "transparent",
                borderLeft: isActive ? `3px solid ${m.color}` : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <div>
                <div style={{ fontFamily: RAJDHANI, fontSize: 18, fontWeight: 700, color: isActive ? m.color : "#4a4a5a", letterSpacing: "0.1em", lineHeight: 1 }}>
                  {m.stat}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: isActive ? "#a0a0b8" : "#3a3a4a", letterSpacing: "0.08em", marginTop: 2 }}>
                  {m.label}
                </div>
              </div>
              {isActive && (
                <div className="absolute right-3" style={{ color: m.color, fontSize: 10 }}>▶</div>
              )}
            </button>
          );
        })}

        <div className="mt-auto pt-5" style={{ borderTop: "1px solid #f5e64222", paddingLeft: 24, paddingRight: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a", letterSpacing: "0.2em", marginBottom: 4 }}>STREET CRED</div>
          <div style={{ fontFamily: RAJDHANI, fontSize: 26, fontWeight: 700, color: "#f5e642", textShadow: "0 0 12px #f5e64288" }}>3+ YRS</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a" }}>IN THE FIELD</div>
        </div>
      </div>

      {/* Right — skill tree */}
      <div className="flex-1 flex flex-col relative z-10 overflow-auto" style={{ padding: "36px 40px 36px 36px" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span style={{ fontSize: 32 }}>{meta.icon}</span>
          <div>
            <div style={{ fontFamily: RAJDHANI, fontSize: 28, fontWeight: 700, color: meta.color, letterSpacing: "0.15em", textShadow: `0 0 16px ${meta.color}88`, lineHeight: 1 }}>
              {meta.label}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: `${meta.color}66`, letterSpacing: "0.3em", marginTop: 4 }}>
              SKILL TREE — ACTIVE PERKS
            </div>
          </div>
        </div>

        {/* Skill nodes */}
        <div className="space-y-6">
          {activeSkills.map((skill, i) => (
            <div key={skill.name} className="flex items-center gap-4">
              <div
                style={{
                  width: 36, height: 36, borderRadius: 4,
                  border: `1px solid ${meta.color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: RAJDHANI, fontSize: 15, fontWeight: 700, color: meta.color,
                  background: `${meta.color}0e`,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontFamily: RAJDHANI, fontSize: 17, fontWeight: 600, color: "#e0e0e8", letterSpacing: "0.06em" }}>
                    {skill.name}
                  </span>
                  <span style={{ fontFamily: RAJDHANI, fontSize: 16, fontWeight: 700, color: meta.color }}>
                    {skill.level}<span style={{ color: `${meta.color}55`, fontSize: 12 }}>/100</span>
                  </span>
                </div>
                <div
                  style={{
                    height: 6, background: "#141428",
                    border: `1px solid ${meta.color}22`,
                    borderRadius: 3, overflow: "hidden", position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%", width: `${skill.level}%`,
                      background: `linear-gradient(90deg, ${meta.color}66, ${meta.color})`,
                      boxShadow: `0 0 10px ${meta.color}66`,
                    }}
                  />
                  {[20, 40, 60, 80].map((pct) => (
                    <div key={pct} className="absolute top-0 bottom-0 w-px" style={{ left: `${pct}%`, background: "#0a0a14" }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-5" style={{ borderTop: "1px solid #f5e64222" }}>
          <div style={{ fontFamily: RAJDHANI, fontSize: 14, fontStyle: "italic", color: "#f5e64255", letterSpacing: "0.1em" }}>
            &ldquo;The future belongs to those who design it.&rdquo;
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#f5e64233", letterSpacing: "0.2em", marginTop: 3 }}>
            — NIGHT CITY PROVERB
          </div>
        </div>
      </div>
    </div>
  );
}
