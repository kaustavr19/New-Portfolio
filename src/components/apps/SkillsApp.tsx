"use client";

import { useState } from "react";
import {
  capabilityGroups,
  type CapabilityEvidence,
  type EvidenceLinkedCapability,
} from "@/data/content";
import { setHash } from "@/lib/deep-link";
import { useIsMobile } from "@/lib/use-is-mobile";

const RAJDHANI = "'Rajdhani', sans-serif";
const MONO = "'Share Tech Mono', monospace";

type Category = keyof typeof capabilityGroups;

const categoryMeta: Record<Category, { label: string; stat: string; color: string; icon: string; summary: string }> = {
  intelligence: {
    label: "AI SYSTEMS",
    stat: "AI",
    color: "#00ffff",
    icon: "lightbulb",
    summary: "Designing intelligent systems people can understand, question, and overrule.",
  },
  technical: {
    label: "PRODUCT SYSTEMS",
    stat: "SYS",
    color: "#f5e642",
    icon: "bolt",
    summary: "Turning complex products into coherent workflows, systems, and information.",
  },
  cool: {
    label: "DELIVERY",
    stat: "OPS",
    color: "#ff0090",
    icon: "trophy",
    summary: "Researching, aligning, and shipping across specialist teams and constraints.",
  },
  body: {
    label: "BUILD LAB",
    stat: "BLD",
    color: "#a855f7",
    icon: "code-block",
    summary: "Using code and reusable tooling to move ideas from claims to working proof.",
  },
};

const CATEGORIES = Object.keys(capabilityGroups) as Category[];

function openProject(projectId: string) {
  setHash("projects", projectId);
  window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "projects" }));
}

export default function SkillsApp() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<Category>("intelligence");
  const capabilities = capabilityGroups[active];
  const meta = categoryMeta[active];

  return (
    <div
      className={isMobile ? "h-full overflow-auto relative" : "h-full flex relative overflow-hidden"}
      style={{ background: "#0a0a14" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,230,66,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,66,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <CapabilityNav active={active} onSelect={setActive} mobile={isMobile} />

      <main
        className="relative z-10 flex-1 overflow-auto"
        style={{ padding: isMobile ? "22px 18px 30px" : "34px 36px 40px" }}
      >
        <header
          className={isMobile ? "mb-6" : "flex items-start justify-between gap-8 mb-8"}
          style={{ borderBottom: `1px solid ${meta.color}22`, paddingBottom: 20 }}
        >
          <div>
            <div className="flex items-center gap-3">
              <i className={`hn hn-${meta.icon}`} style={{ fontSize: isMobile ? 24 : 30, color: meta.color }} />
              <h1
                style={{
                  fontFamily: RAJDHANI,
                  fontSize: isMobile ? 24 : 29,
                  fontWeight: 700,
                  color: meta.color,
                  letterSpacing: "0.12em",
                  textShadow: `0 0 16px ${meta.color}66`,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {meta.label}
              </h1>
            </div>
            <p style={{ fontFamily: RAJDHANI, fontSize: 14, color: "#9b9bad", lineHeight: 1.45, margin: "10px 0 0", maxWidth: 520 }}>
              {meta.summary}
            </p>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 8,
              color: `${meta.color}88`,
              letterSpacing: "0.2em",
              marginTop: isMobile ? 12 : 2,
              whiteSpace: "nowrap",
            }}
          >
            EVIDENCE &gt; SELF-SCORES
          </div>
        </header>

        <div className="flex flex-col" style={{ gap: 14 }}>
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.name}
              capability={capability}
              index={index}
              color={meta.color}
              mobile={isMobile}
            />
          ))}
        </div>

        <footer
          className={isMobile ? "" : "flex items-center justify-between"}
          style={{ borderTop: "1px solid #f5e64218", marginTop: 26, paddingTop: 16 }}
        >
          <div style={{ fontFamily: MONO, fontSize: 8, color: "#555568", letterSpacing: "0.15em" }}>
            CLAIM → METHOD → INSPECTABLE PROOF
          </div>
          <div style={{ fontFamily: RAJDHANI, fontSize: 12, color: "#f5e64255", marginTop: isMobile ? 8 : 0 }}>
            No arbitrary mastery percentages.
          </div>
        </footer>
      </main>
    </div>
  );
}

function CapabilityNav({
  active,
  onSelect,
  mobile,
}: {
  active: Category;
  onSelect: (category: Category) => void;
  mobile: boolean;
}) {
  if (mobile) {
    return (
      <nav className="relative z-10 grid grid-cols-4" style={{ borderBottom: "1px solid #f5e64222" }} aria-label="Capability groups">
        {CATEGORIES.map((category) => {
          const meta = categoryMeta[category];
          const selected = category === active;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className="flex flex-col items-center gap-1"
              style={{
                minHeight: 62,
                padding: "11px 4px 9px",
                color: selected ? meta.color : "#56566a",
                background: selected ? `${meta.color}0c` : "transparent",
                borderBottom: selected ? `2px solid ${meta.color}` : "2px solid transparent",
              }}
            >
              <i className={`hn hn-${meta.icon}`} style={{ fontSize: 16 }} />
              <span style={{ fontFamily: RAJDHANI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>{meta.stat}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="relative z-10 flex-shrink-0 flex flex-col"
      style={{ width: 188, borderRight: "1px solid #f5e64222", padding: "28px 0" }}
      aria-label="Capability groups"
    >
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#f5e64266", letterSpacing: "0.32em", padding: "0 22px", marginBottom: 18 }}>
        CAPABILITIES
      </div>
      {CATEGORIES.map((category) => {
        const meta = categoryMeta[category];
        const selected = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className="flex items-center gap-3 text-left transition-all"
            style={{
              padding: "16px 20px",
              color: selected ? meta.color : "#555568",
              background: selected ? `${meta.color}0c` : "transparent",
              borderLeft: selected ? `3px solid ${meta.color}` : "3px solid transparent",
            }}
          >
            <i className={`hn hn-${meta.icon}`} style={{ fontSize: 17 }} />
            <span>
              <span style={{ display: "block", fontFamily: RAJDHANI, fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1 }}>
                {meta.stat}
              </span>
              <span style={{ display: "block", fontFamily: MONO, fontSize: 8, color: selected ? "#aaaabc" : "#454558", letterSpacing: "0.07em", marginTop: 4 }}>
                {meta.label}
              </span>
            </span>
          </button>
        );
      })}

      <div className="mt-auto" style={{ padding: "18px 22px 0", borderTop: "1px solid #f5e64218" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: "#555568", letterSpacing: "0.16em" }}>PROOF SOURCES</div>
        <div style={{ fontFamily: RAJDHANI, fontSize: 13, color: "#aaaabc", lineHeight: 1.5, marginTop: 7 }}>
          Case studies<br />Experience records<br />Public work
        </div>
      </div>
    </nav>
  );
}

function CapabilityCard({
  capability,
  index,
  color,
  mobile,
}: {
  capability: EvidenceLinkedCapability;
  index: number;
  color: string;
  mobile: boolean;
}) {
  return (
    <article
      style={{
        border: `1px solid ${color}25`,
        background: "rgba(12,12,25,0.86)",
        boxShadow: `inset 3px 0 0 ${color}`,
        padding: mobile ? "16px" : "18px 20px",
      }}
    >
      <div className={mobile ? "" : "grid"} style={mobile ? undefined : { gridTemplateColumns: "minmax(0, 1fr) minmax(230px, 0.9fr)", gap: 22 }}>
        <div>
          <div className="flex items-start gap-3">
            <span style={{ fontFamily: MONO, fontSize: 9, color, opacity: 0.7, paddingTop: 3 }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 style={{ fontFamily: RAJDHANI, fontSize: 18, fontWeight: 700, color: "#f0f0f5", letterSpacing: "0.04em", margin: 0 }}>
                {capability.name}
              </h2>
              <p style={{ fontFamily: RAJDHANI, fontSize: 14, color: "#aaaabc", lineHeight: 1.45, margin: "6px 0 0" }}>
                {capability.claim}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5" style={{ marginTop: 13, marginLeft: 30 }}>
            {capability.methods.map((method) => (
              <span
                key={method}
                style={{
                  padding: "3px 7px",
                  border: `1px solid ${color}30`,
                  color: `${color}cc`,
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: "0.06em",
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: mobile ? 16 : 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: "#66667a", letterSpacing: "0.18em", marginBottom: 7 }}>
            EVIDENCE LOG
          </div>
          <div className="flex flex-col gap-1.5">
            {capability.evidence.map((item) => (
              <EvidenceItem key={`${item.signal}-${item.detail}`} item={item} color={color} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function EvidenceItem({ item, color }: { item: CapabilityEvidence; color: string }) {
  const content = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span style={{ fontFamily: RAJDHANI, fontSize: 13, fontWeight: 700, color: "#e6e6ec" }}>{item.signal}</span>
        <span style={{ fontFamily: MONO, fontSize: 7, color: `${color}aa`, letterSpacing: "0.1em", flexShrink: 0 }}>{item.source}</span>
      </span>
      <span style={{ display: "block", fontFamily: RAJDHANI, fontSize: 11, color: "#7f7f91", lineHeight: 1.35, marginTop: 2 }}>
        {item.detail}
      </span>
    </>
  );
  const style = {
    display: "block",
    width: "100%",
    padding: "8px 9px",
    border: `1px solid ${color}18`,
    background: `${color}06`,
    textAlign: "left" as const,
    textDecoration: "none",
  };

  if (item.projectId) {
    return (
      <button type="button" onClick={() => openProject(item.projectId!)} className="transition-all hover:brightness-125" style={style}>
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-125" style={style}>
        {content}
      </a>
    );
  }

  return <div style={style}>{content}</div>;
}
