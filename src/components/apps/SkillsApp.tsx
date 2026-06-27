"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { skills } from "@/data/content";
import { useIsMobile } from "@/lib/use-is-mobile";
import { useExperiments } from "@/lib/experiments";

// Lazy — only downloads when the skills3d experiment is on.
const SkillsGraph3D = dynamic(() => import("@/components/experiments/SkillsGraph3D"), { ssr: false });

const RAJDHANI = "'Rajdhani', sans-serif";
const MONO = "'Share Tech Mono', monospace";

type Category = "intelligence" | "technical" | "cool" | "body";

const categoryMeta: Record<Category, { label: string; stat: string; color: string; icon: string }> = {
  intelligence: { label: "INTELLIGENCE", stat: "INT", color: "#00ffff", icon: "lightbulb" },
  technical:    { label: "TECHNICAL",    stat: "TEC", color: "#f5e642", icon: "bolt" },
  cool:         { label: "COOL",         stat: "COL", color: "#ff0090", icon: "face-grin" },
  body:         { label: "BODY",         stat: "BOD", color: "#a855f7", icon: "trophy" },
};

const CATEGORIES: Category[] = ["intelligence", "technical", "cool", "body"];

export default function SkillsApp() {
  const isMobile = useIsMobile();
  const fx = useExperiments();
  const [active, setActive] = useState<Category>("intelligence");

  const activeSkills = skills[active];
  const meta = categoryMeta[active];

  // 3D node-graph experiment — desktop only.
  const use3d = fx.skills3d && !isMobile;

  /* ──────────────────────────────────────────────────────────
     Mobile layout — horizontal tab strip + full-width tree.
     ────────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div className="h-full overflow-auto relative" style={{ background: "#0a0a14" }}>
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,230,66,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,66,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ── Tab strip ── */}
        <div className="relative z-10" style={{ borderBottom: "1px solid #f5e64222" }}>
          <div style={{ fontFamily: RAJDHANI, fontSize: 10, color: "#f5e64255", letterSpacing: "0.45em", padding: "16px 20px 8px" }}>
            ATTRIBUTES
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {CATEGORIES.map((cat) => {
              const m = categoryMeta[cat];
              const isActive = cat === active;
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className="flex flex-col items-center justify-center transition-colors active:opacity-70"
                  style={{
                    padding: "10px 4px 12px",
                    background: isActive ? `${m.color}0e` : "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderLeft: "none",
                    borderBottom: isActive ? `2px solid ${m.color}` : "2px solid transparent",
                    color: isActive ? m.color : "#4a4a5a",
                    cursor: "pointer",
                  }}
                >
                  <i className={`hn hn-${m.icon}`} style={{ fontSize: 18, marginBottom: 4 }} />
                  <span style={{ fontFamily: RAJDHANI, fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", lineHeight: 1 }}>
                    {m.stat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active category header ── */}
        <div className="relative z-10 flex items-center gap-3" style={{ padding: "20px 20px 8px" }}>
          <i className={`hn hn-${meta.icon}`} style={{ fontSize: 26, color: meta.color }} />
          <div>
            <div style={{ fontFamily: RAJDHANI, fontSize: 22, fontWeight: 700, color: meta.color, letterSpacing: "0.12em", textShadow: `0 0 14px ${meta.color}88`, lineHeight: 1 }}>
              {meta.label}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: `${meta.color}66`, letterSpacing: "0.25em", marginTop: 5 }}>
              SKILL TREE — ACTIVE PERKS
            </div>
          </div>
        </div>

        {/* ── Skill nodes ── */}
        <div className="relative z-10" style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {activeSkills.map((skill, i) => (
            <div key={skill.name} className="flex items-center gap-3">
              <div
                style={{
                  width: 34, height: 34, borderRadius: 4,
                  border: `1px solid ${meta.color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: RAJDHANI, fontSize: 13, fontWeight: 700, color: meta.color,
                  background: `${meta.color}0e`,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline" style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: RAJDHANI, fontSize: 15, fontWeight: 600, color: "#e0e0e8", letterSpacing: "0.04em" }}>
                    {skill.name}
                  </span>
                  <span style={{ fontFamily: RAJDHANI, fontSize: 14, fontWeight: 700, color: meta.color, flexShrink: 0, marginLeft: 8 }}>
                    {skill.level}<span style={{ color: `${meta.color}55`, fontSize: 11 }}>/100</span>
                  </span>
                </div>
                <div
                  style={{
                    height: 5, background: "#141428",
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

        {/* ── Footer: STREET CRED + proverb ── */}
        <div
          className="relative z-10"
          style={{
            padding: "20px 20px 24px",
            borderTop: "1px solid #f5e64222",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div className="flex items-baseline gap-3">
            <div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a", letterSpacing: "0.25em" }}>STREET CRED</div>
              <div style={{ fontFamily: RAJDHANI, fontSize: 22, fontWeight: 700, color: "#f5e642", textShadow: "0 0 12px #f5e64288", lineHeight: 1 }}>3+ YRS</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a", letterSpacing: "0.1em" }}>IN THE FIELD</div>
          </div>
          <div>
            <div style={{ fontFamily: RAJDHANI, fontSize: 13, fontStyle: "italic", color: "#f5e64255", letterSpacing: "0.08em", lineHeight: 1.4 }}>
              &ldquo;The future belongs to those who design it.&rdquo;
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#f5e64233", letterSpacing: "0.2em", marginTop: 4 }}>
              — NIGHT CITY PROVERB
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        className="flex-shrink-0 flex flex-col relative z-10"
        style={{ width: 196, borderRight: "1px solid #f5e64222", paddingTop: 28, paddingBottom: 28 }}
      >
        <div style={{ fontFamily: RAJDHANI, fontSize: 11, color: "#f5e64255", letterSpacing: "0.5em", padding: "0 24px", marginBottom: 20 }}>
          ATTRIBUTES
        </div>

        {CATEGORIES.map((cat) => {
          const m = categoryMeta[cat];
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="flex items-center gap-3 text-left transition-all relative"
              style={{
                padding: "18px 24px",
                background: isActive ? `${m.color}0e` : "transparent",
                borderLeft: isActive ? `3px solid ${m.color}` : "3px solid transparent",
              }}
            >
              <i className={`hn hn-${m.icon}`} style={{ fontSize: 18, color: isActive ? m.color : "#4a4a5a" }} />
              <div>
                <div style={{ fontFamily: RAJDHANI, fontSize: 18, fontWeight: 700, color: isActive ? m.color : "#4a4a5a", letterSpacing: "0.1em", lineHeight: 1 }}>
                  {m.stat}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: isActive ? "#a0a0b8" : "#3a3a4a", letterSpacing: "0.08em", marginTop: 2 }}>
                  {m.label}
                </div>
              </div>
              {isActive && (
                <i className="hn hn-angle-right absolute right-3" style={{ color: m.color, fontSize: 10 }} />
              )}
            </button>
          );
        })}

        <div className="mt-auto" style={{ borderTop: "1px solid #f5e64222", paddingTop: 24, paddingLeft: 24, paddingRight: 20, marginTop: 28 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a", letterSpacing: "0.2em", marginBottom: 4 }}>STREET CRED</div>
          <div style={{ fontFamily: RAJDHANI, fontSize: 26, fontWeight: 700, color: "#f5e642", textShadow: "0 0 12px #f5e64288" }}>3+ YRS</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a" }}>IN THE FIELD</div>
        </div>
      </div>

      {/* Right — skill tree */}
      <div className="flex-1 flex flex-col relative z-10 overflow-auto" style={{ padding: "40px 40px 40px 36px" }}>
        {/* Header */}
        <div className="flex items-center gap-4" style={{ marginBottom: 48 }}>
          <i className={`hn hn-${meta.icon}`} style={{ fontSize: 36, color: meta.color }} />
          <div>
            <div style={{ fontFamily: RAJDHANI, fontSize: 30, fontWeight: 700, color: meta.color, letterSpacing: "0.15em", textShadow: `0 0 16px ${meta.color}88`, lineHeight: 1 }}>
              {meta.label}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: `${meta.color}66`, letterSpacing: "0.3em", marginTop: 6 }}>
              SKILL TREE — ACTIVE PERKS
            </div>
          </div>
        </div>

        {/* Skill nodes — DOM list, or the 3D node graph when skills3d is on */}
        {use3d ? (
          <div className="relative" style={{ flex: 1, minHeight: 280 }}>
            <SkillsGraph3D active={active} />
            <div
              className="absolute left-0 bottom-0 pointer-events-none"
              style={{ fontFamily: MONO, fontSize: 9, color: `${meta.color}66`, letterSpacing: "0.25em" }}
            >
              DRAG TO ORBIT · SCROLL TO ZOOM · NODE SIZE = LEVEL
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {activeSkills.map((skill, i) => (
              <div key={skill.name} className="flex items-center gap-4">
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 4,
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
                  <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
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
        )}

        <div className="mt-auto" style={{ borderTop: "1px solid #f5e64222", paddingTop: 24, marginTop: 48 }}>
          <div style={{ fontFamily: RAJDHANI, fontSize: 14, fontStyle: "italic", color: "#f5e64255", letterSpacing: "0.1em" }}>
            &ldquo;The future belongs to those who design it.&rdquo;
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#f5e64233", letterSpacing: "0.2em", marginTop: 4 }}>
            — NIGHT CITY PROVERB
          </div>
        </div>
      </div>
    </div>
  );
}
