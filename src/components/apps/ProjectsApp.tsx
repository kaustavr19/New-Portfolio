"use client";

import { useState } from "react";
import { projects, type Project, type ProjectType, type Medal, type Objective, type ProjectBlock, type ProjectSection } from "@/data/content";
import { useIsMobile } from "@/lib/use-is-mobile";

/* GTA V pause-menu type: clean humanist sans (Chalet stand-in) for UI,
   Bebas for big display, mono for data readouts. */
const BEBAS = "'Bebas Neue', cursive";
const MONO = "'Share Tech Mono', monospace";
const SANS = "'Rajdhani', sans-serif";

/* Per-category accent — GTA V codes identity by colour.
   Main missions (work) = Franklin green. Side missions = Trevor orange. */
const ACCENT: Record<ProjectType, string> = {
  main: "#7cb342",
  side: "#f3922b",
};

const TABS: { type: ProjectType; label: string }[] = [
  { type: "main", label: "MAIN MISSIONS" },
  { type: "side", label: "SIDE MISSIONS" },
];

const STATUS_COLOR: Record<string, string> = {
  "IN PROGRESS": "#febc2e",
  LIVE: "#7cb342",
  SHIPPED: "#4fc3f7",
};

const MEDAL_COLOR: Record<Medal, string> = {
  gold: "#e6b422",
  silver: "#c8c8d0",
  bronze: "#c87f48",
};

/* GTA V "wanted level" stars — filled to the difficulty rating. */
function StarRating({ count, max = 5, color }: { count: number; max?: number; color: string }) {
  return (
    <div className="flex gap-1" aria-label={`${count} of ${max} wanted level`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z"
            fill={i < count ? color : "transparent"}
            stroke={i < count ? color : "#ffffff33"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* List-rail blip — main missions get a letter marker, side a "?". */
function Blip({ project, active }: { project: Project; active: boolean }) {
  const accent = ACCENT[project.type];
  const isMain = project.type === "main";
  return (
    <div
      style={{
        width: 26,
        height: 26,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? accent : `${accent}22`,
        border: `1.5px solid ${active ? accent : `${accent}66`}`,
        borderRadius: isMain ? 4 : "50%",
        color: active ? "#0a0a0a" : accent,
        fontFamily: BEBAS,
        fontSize: 15,
        lineHeight: 1,
      }}
    >
      {isMain ? project.name.replace(/[^a-z]/gi, "").charAt(0).toUpperCase() : "?"}
    </div>
  );
}

/* MISSION PASSED card — GTA V post-mission result: medal + completion %. */
function MissionResult({ project, accent }: { project: Project; accent: string }) {
  const passed = project.completion >= 100;
  const medal = project.medal;
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.55)",
        border: "1px solid #ffffff14",
        padding: "20px 24px",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 26, color: passed ? "#fff" : accent, letterSpacing: "0.06em", lineHeight: 1 }}>
          {passed ? "MISSION PASSED" : "MISSION ACTIVE"}
        </div>
        {medal && (
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="14" r="7" fill={MEDAL_COLOR[medal]} stroke="#00000040" strokeWidth="1" />
              <path d="M9 2l1.5 5h3L15 2" fill="none" stroke={MEDAL_COLOR[medal]} strokeWidth="2" />
              <path d="M12 11l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 13.3l2-.3z" fill="#00000055" />
            </svg>
            <span style={{ fontFamily: MONO, fontSize: 10, color: MEDAL_COLOR[medal], letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {medal}
            </span>
          </div>
        )}
      </div>

      {/* Completion bar */}
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff66", letterSpacing: "0.2em" }}>COMPLETION</span>
        <span style={{ fontFamily: BEBAS, fontSize: 18, color: accent, letterSpacing: "0.04em" }}>{project.completion}%</span>
      </div>
      <div style={{ height: 5, background: "#ffffff14", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${project.completion}%`, background: accent }} />
      </div>
    </div>
  );
}

/* GTA-style intel ticker — flags that mission content is still incoming. */
function ComingSoonBanner({ accent }: { accent: string }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        padding: "8px 18px",
        background: `${accent}10`,
        borderBottom: `1px solid ${accent}33`,
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.22em",
        color: "#e8e8e8",
      }}
    >
      <span style={{ color: accent }}>●</span>
      <span style={{ color: accent }}>INTEL UPDATE INCOMING</span>
      <span style={{ color: "#ffffff66" }}>— FULL MISSION BRIEFS COMING SOON</span>
    </div>
  );
}

function Section({ accent, title, children }: { accent: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: "#ffffff66",
          letterSpacing: "0.35em",
          borderBottom: "1px solid #ffffff14",
          paddingBottom: 8,
          marginBottom: 14,
        }}
      >
        <span style={{ color: accent }}>//</span> {title}
      </div>
      {children}
    </div>
  );
}

/* FEATURED ribbon — marks the flagship mission. */
function FeaturedTag({ accent }: { accent: string }) {
  return (
    <span
      style={{
        flexShrink: 0,
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: "0.2em",
        color: accent,
        border: `1px solid ${accent}66`,
        background: `${accent}14`,
        padding: "3px 8px",
        marginTop: 4,
        whiteSpace: "nowrap",
      }}
    >
      ★ FEATURED
    </span>
  );
}

/* INTEL stat strip — GTA V "stats" readout for headline / result numbers. */
function IntelStats({ stats, accent }: { stats: { value: string; label: string; sub?: string }[]; accent: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: "1 1 110px",
            minWidth: 100,
            background: "rgba(0,0,0,0.5)",
            border: "1px solid #ffffff14",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontFamily: BEBAS, fontSize: 30, color: accent, letterSpacing: "0.03em", lineHeight: 1 }}>
            {s.value}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#ffffff66", letterSpacing: "0.18em", marginTop: 6, textTransform: "uppercase" }}>
            {s.label}
          </div>
          {s.sub && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#ffffff44", letterSpacing: "0.1em", marginTop: 3 }}>
              {s.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* Three-up "pillars" — Core / Semantic / Component style architecture cards. */
function Pillars({ items, accent }: { items: { title: string; sub: string }[]; accent: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => (
        <div
          key={p.title}
          style={{ flex: "1 1 140px", minWidth: 130, background: `${accent}0d`, border: `1px solid ${accent}33`, padding: "16px 18px" }}
        >
          <div style={{ fontFamily: BEBAS, fontSize: 20, color: "#fff", letterSpacing: "0.05em", lineHeight: 1 }}>{p.title}</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#ffffff88", letterSpacing: "0.12em", marginTop: 6, textTransform: "uppercase" }}>{p.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* Research "intel reports" — a labelled finding per stakeholder group. */
function Findings({ items, accent }: { items: { label: string; text: string }[]; accent: string }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((f) => (
        <div key={f.label} style={{ borderLeft: `2px solid ${accent}66`, paddingLeft: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: accent, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
          <div style={{ fontFamily: SANS, fontSize: 15, color: "#cfcfcf", lineHeight: 1.5 }}>{f.text}</div>
        </div>
      ))}
    </div>
  );
}

/* Accent-marker bullet list — deliverables, iterations. */
function BulletList({ items, accent }: { items: string[]; accent: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3">
          <span style={{ color: accent, fontFamily: MONO, fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>▸</span>
          <span style={{ fontFamily: SANS, fontSize: 15, color: "#cfcfcf", lineHeight: 1.5 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

/* Highlighted callout — THE PROBLEM, SURPRISING INSIGHT, THE BIGGER LEARNING, DEBRIEF. */
function Callout({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div style={{ background: `${accent}10`, borderLeft: `3px solid ${accent}`, padding: "14px 18px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: accent, letterSpacing: "0.22em", marginBottom: 6 }}>{label}</div>
      <p style={{ fontFamily: SANS, fontSize: 15, fontStyle: "italic", color: "#dcdcdc", lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}

/* One dossier block → one styled element. */
function Block({ block, accent }: { block: ProjectBlock; accent: string }) {
  switch (block.kind) {
    case "para":
      return <p style={{ fontFamily: SANS, fontSize: 15, color: "#cfcfcf", lineHeight: 1.6 }}>{block.text}</p>;
    case "subhead":
      return <div style={{ fontFamily: BEBAS, fontSize: 18, color: "#fff", letterSpacing: "0.05em", marginTop: 2 }}>{block.text}</div>;
    case "callout":
      return <Callout label={block.label} text={block.text} accent={accent} />;
    case "stats":
      return <IntelStats stats={block.items} accent={accent} />;
    case "pillars":
      return <Pillars items={block.items} accent={accent} />;
    case "list":
      return <BulletList items={block.items} accent={accent} />;
    case "findings":
      return <Findings items={block.items} accent={accent} />;
  }
}

/* Full dossier — ordered GTA-style heist sections (Setup → Debrief). */
function Dossier({ sections, accent }: { sections: ProjectSection[]; accent: string }) {
  return (
    <div className="flex flex-col gap-7">
      {sections.map((sec) => (
        <Section key={sec.title} accent={accent} title={sec.title}>
          <div className="flex flex-col gap-3.5">
            {sec.blocks.map((b, i) => (
              <Block key={i} block={b} accent={accent} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

/* CLASSIFIED footer — NDA / available-on-request note. */
function Classified({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3" style={{ background: "rgba(0,0,0,0.4)", border: "1px dashed #ffffff22", padding: "12px 16px" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0, marginTop: 1 }}>
        <rect x="5" y="11" width="14" height="9" rx="1.5" fill="none" stroke="#ffffff88" strokeWidth="1.6" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#ffffff88" strokeWidth="1.6" />
      </svg>
      <span style={{ fontFamily: MONO, fontSize: 11, color: "#ffffff99", letterSpacing: "0.05em", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

/* OBJECTIVES — GTA V mission checklist; completed objectives are ticked. */
function Objectives({ items, accent }: { items: Objective[]; accent: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((o, i) => (
        <div key={i} className="flex items-start gap-3">
          <span
            style={{
              width: 16,
              height: 16,
              flexShrink: 0,
              marginTop: 2,
              border: `1.5px solid ${o.done ? accent : "#ffffff33"}`,
              background: o.done ? accent : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {o.done && (
              <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
                <path d="M5 13l4 4L19 7" fill="none" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 15, color: o.done ? "#d4d4d4" : "#9a9a9a", lineHeight: 1.4 }}>
            {o.text}
          </span>
        </div>
      ))}
    </div>
  );
}

function Tags({ tags, accent }: { tags: string[]; accent: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            padding: "4px 11px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${accent}44`,
            color: "#e8e8e8",
            letterSpacing: "0.08em",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function ProjectsApp() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<ProjectType>("main");
  const visible = projects.filter((p) => p.type === tab);
  const [selectedId, setSelectedId] = useState(visible[0].id);

  // Resolve selection within the active tab (selection can be stale after a switch).
  const project = visible.find((p) => p.id === selectedId) ?? visible[0];
  const accent = ACCENT[tab];

  function switchTab(next: ProjectType) {
    setTab(next);
    setSelectedId(projects.find((p) => p.type === next)!.id);
  }

  /* Tab bar — GTA V pause-menu segmented header. */
  const tabBar = (
    <div className="flex" style={{ borderBottom: "1px solid #ffffff14" }}>
      {TABS.map((t) => {
        const on = tab === t.type;
        const a = ACCENT[t.type];
        return (
          <button
            key={t.type}
            onClick={() => switchTab(t.type)}
            className="flex-1 transition-colors"
            style={{
              fontFamily: BEBAS,
              fontSize: isMobile ? 16 : 18,
              letterSpacing: "0.1em",
              padding: isMobile ? "13px 0" : "15px 0",
              color: on ? "#fff" : "#ffffff55",
              background: on ? `${a}14` : "transparent",
              borderBottom: on ? `2px solid ${a}` : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t.label}
            <span style={{ fontFamily: MONO, fontSize: 10, marginLeft: 8, color: on ? a : "#ffffff33" }}>
              {projects.filter((p) => p.type === t.type).length}
            </span>
          </button>
        );
      })}
    </div>
  );

  /* ── MOBILE — tabs + accordion mission list ── */
  if (isMobile) {
    return (
      <div className="h-full overflow-auto" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
        {tabBar}
        <ComingSoonBanner accent={accent} />
        <div className="flex flex-col">
          {visible.map((p) => {
            const isOpen = project.id === p.id;
            const statusColor = STATUS_COLOR[p.status] ?? "#888";
            return (
              <div key={p.id} style={{ borderBottom: "1px solid #ffffff0d" }}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className="w-full text-left flex items-center gap-3 active:bg-white/[0.02]"
                  style={{
                    padding: "15px 18px",
                    background: isOpen ? `${accent}10` : "transparent",
                    borderLeft: isOpen ? `3px solid ${accent}` : "3px solid transparent",
                  }}
                >
                  <Blip project={p} active={isOpen} />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontFamily: BEBAS, fontSize: 19, color: isOpen ? "#fff" : "#c8c8c8", letterSpacing: "0.06em", lineHeight: 1.05 }}>
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2" style={{ marginTop: 5 }}>
                      <span style={{ fontFamily: MONO, fontSize: 8, padding: "1px 5px", background: `${statusColor}1a`, color: statusColor, border: `1px solid ${statusColor}44`, letterSpacing: "0.12em" }}>
                        {p.status}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "#ffffff44" }}>{p.year}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-5" style={{ padding: "4px 18px 22px" }}>
                    <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: "#fff", lineHeight: 1.35 }}>
                      {p.tagline}
                    </div>
                    {p.role && (
                      <div style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff66", letterSpacing: "0.06em", marginTop: -8 }}>
                        {p.role}
                      </div>
                    )}
                    <StarRating count={p.stars} color={accent} />
                    <MissionResult project={p} accent={accent} />
                    {p.intel && p.intel.length > 0 && (
                      <Section accent={accent} title="INTEL">
                        <IntelStats stats={p.intel} accent={accent} />
                      </Section>
                    )}
                    <Section accent={accent} title="MISSION BRIEF">
                      <p style={{ fontFamily: SANS, fontSize: 15, color: "#cfcfcf", lineHeight: 1.55 }}>{p.description}</p>
                    </Section>
                    {p.objectives && p.objectives.length > 0 && (
                      <Section accent={accent} title="OBJECTIVES">
                        <Objectives items={p.objectives} accent={accent} />
                      </Section>
                    )}
                    {p.tags.length > 0 && (
                      <Section accent={accent} title="INTEL TAGS">
                        <Tags tags={p.tags} accent={accent} />
                      </Section>
                    )}
                    {p.dossier && p.dossier.length > 0 && <Dossier sections={p.dossier} accent={accent} />}
                    {p.debrief && <Callout label="DEBRIEF" text={p.debrief} accent={accent} />}
                    {p.classified && <Classified text={p.classified} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── DESKTOP — GTA V pause-menu: tab bar + list rail + brief panel ── */
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      {tabBar}
      <ComingSoonBanner accent={accent} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left — mission list rail */}
        <div className="flex-shrink-0 flex flex-col overflow-auto" style={{ width: 220, borderRight: "1px solid #ffffff14" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #ffffff0d" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff55", letterSpacing: "0.3em" }}>
              {tab === "main" ? "STORY" : "STRANGERS & FREAKS"}
            </div>
            <div style={{ fontFamily: BEBAS, fontSize: 20, color: accent, letterSpacing: "0.06em" }}>
              {visible.length} MISSIONS
            </div>
          </div>

          {visible.map((p) => {
            const on = project.id === p.id;
            const statusColor = STATUS_COLOR[p.status] ?? "#888";
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className="w-full text-left flex items-center gap-3 transition-colors"
                style={{
                  padding: "14px 16px",
                  background: on ? `${accent}12` : "transparent",
                  borderLeft: on ? `3px solid ${accent}` : "3px solid transparent",
                  borderBottom: "1px solid #ffffff0a",
                }}
              >
                <Blip project={p} active={on} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: BEBAS, fontSize: 16, color: on ? "#fff" : "#9a9a9a", letterSpacing: "0.05em", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: statusColor, letterSpacing: "0.14em", marginTop: 3 }}>
                    {p.status}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right — mission brief panel */}
        <div className="flex-1 flex flex-col overflow-auto" style={{ padding: "32px 36px" }}>
          {/* Header */}
          <div className="flex items-start gap-4" style={{ marginBottom: 28 }}>
            <Blip project={project} active />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div style={{ fontFamily: BEBAS, fontSize: 38, color: "#fff", letterSpacing: "0.05em", lineHeight: 0.95 }}>
                  {project.name}
                </div>
                {project.featured && <FeaturedTag accent={accent} />}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: accent, marginTop: 6, letterSpacing: "0.01em" }}>
                {project.tagline}
              </div>
              {project.role && (
                <div style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff66", letterSpacing: "0.08em", marginTop: 8 }}>
                  {project.role}
                </div>
              )}
              <div className="flex items-center gap-4" style={{ marginTop: 12 }}>
                <StarRating count={project.stars} color={accent} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff55", letterSpacing: "0.1em" }}>{project.year}</span>
              </div>
            </div>
          </div>

          {/* Mission result */}
          <div style={{ marginBottom: 28 }}>
            <MissionResult project={project} accent={accent} />
          </div>

          {/* Intel stats */}
          {project.intel && project.intel.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <Section accent={accent} title="INTEL">
                <IntelStats stats={project.intel} accent={accent} />
              </Section>
            </div>
          )}

          {/* Brief */}
          <div style={{ marginBottom: 28 }}>
            <Section accent={accent} title="MISSION BRIEF">
              <p style={{ fontFamily: SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.6 }}>{project.description}</p>
            </Section>
          </div>

          {/* Objectives */}
          {project.objectives && project.objectives.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <Section accent={accent} title="OBJECTIVES">
                <Objectives items={project.objectives} accent={accent} />
              </Section>
            </div>
          )}

          {/* Tags */}
          <Section accent={accent} title="INTEL TAGS">
            <Tags tags={project.tags} accent={accent} />
          </Section>

          {/* Dossier — full heist-style case study */}
          {project.dossier && project.dossier.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <Dossier sections={project.dossier} accent={accent} />
            </div>
          )}

          {/* Debrief (standalone, for missions without a full dossier) */}
          {project.debrief && (
            <div style={{ marginTop: 28 }}>
              <Callout label="DEBRIEF" text={project.debrief} accent={accent} />
            </div>
          )}

          {/* Classified — NDA / on-request note */}
          {project.classified && (
            <div style={{ marginTop: 28 }}>
              <Classified text={project.classified} />
            </div>
          )}

          {/* Other missions in this strand */}
          <div className="mt-auto" style={{ paddingTop: 32 }}>
            <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #ffffff14", padding: "18px 22px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#ffffff55", letterSpacing: "0.3em", marginBottom: 12 }}>
                <span style={{ color: accent }}>//</span> OTHER {tab === "main" ? "STORY" : "SIDE"} MISSIONS
              </div>
              <div className="flex gap-2 flex-wrap">
                {visible.filter((p) => p.id !== project.id).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      fontFamily: BEBAS,
                      fontSize: 14,
                      padding: "5px 14px",
                      border: `1px solid ${accent}44`,
                      color: "#e8e8e8",
                      background: "transparent",
                      cursor: "pointer",
                      letterSpacing: "0.05em",
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
    </div>
  );
}
