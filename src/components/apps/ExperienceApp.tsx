"use client";

import { useState } from "react";
import { chapters, Mission } from "@/data/content";
import { useIsMobile } from "@/lib/use-is-mobile";

const CINZEL = "'Cinzel', serif";
const MONO = "'Share Tech Mono', monospace";
const BODY = "'Rajdhani', sans-serif";

/* ──────────────────────────────────────────────────────────
   ExperienceApp — RDR2 chapter chart treatment.

   Top fold: horizontal chapter timeline (mission boxes
   connected by arrows, grouped under CHAPTER 1 / 2 headers,
   "CURRENT" badge over the active mission).

   Bottom fold: LOG panel for the selected mission — objectives
   checklist, weapons-unlocked chips, and a Gold Awarded /
   In Progress badge.

   Mobile branch swaps the horizontal chart for a vertical
   timeline; same log panel sits below the active card.
   ────────────────────────────────────────────────────────── */

// Paper / RDR2 palette
const PAPER       = "#e8dcbe";
const PAPER_DEEP  = "#dcceab";
const INK         = "#1a1410";
const INK_SOFT    = "#5a4533";
const ACCENT      = "#8b2c1c";   // RDR2 red (current-mission, important)
const GOLD        = "#c89a3a";   // gold key / awarded
const LINE        = "#8b6a3a";   // arrows + dividers (warm brown)

// All missions flattened for the "find by id" lookup
const ALL_MISSIONS: Mission[] = chapters.flatMap((c) => c.missions);

// Default mission: the in-progress one if any, else the latest
const DEFAULT_MISSION_ID =
  ALL_MISSIONS.find((m) => m.status === "in_progress")?.id ??
  ALL_MISSIONS[ALL_MISSIONS.length - 1].id;

export default function ExperienceApp() {
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState(DEFAULT_MISSION_ID);
  const selected = ALL_MISSIONS.find((m) => m.id === selectedId) ?? ALL_MISSIONS[0];

  if (isMobile) {
    return <MobileLayout selectedId={selectedId} setSelectedId={setSelectedId} selected={selected} />;
  }
  return <DesktopLayout selectedId={selectedId} setSelectedId={setSelectedId} selected={selected} />;
}

/* ──────────────────────────────────────────────────────────
   DESKTOP
   ────────────────────────────────────────────────────────── */
function DesktopLayout({
  selectedId, setSelectedId, selected,
}: {
  selectedId: string;
  setSelectedId: (id: string) => void;
  selected: Mission;
}) {
  return (
    <div
      className="h-full overflow-auto rdr-paper"
      style={{ background: PAPER, color: INK }}
    >
      {/* Stitched top edge */}
      <div
        className="sticky top-0 h-1 pointer-events-none z-10"
        style={{
          background:
            `repeating-linear-gradient(90deg, ${LINE}88 0, ${LINE}88 8px, transparent 8px, transparent 14px)`,
        }}
      />

      {/* Header */}
      <div style={{ padding: "28px 36px 8px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, letterSpacing: "0.35em" }}>
          ARTHUR&apos;S JOURNAL
        </div>
        <div style={{ fontFamily: CINZEL, fontSize: 26, color: INK, fontWeight: 700, letterSpacing: "0.02em", marginTop: 2 }}>
          Career Progression
        </div>
      </div>

      {/* ── Chapter chart ── */}
      <div style={{ padding: "20px 36px 24px" }}>
        {chapters.map((chapter, ci) => (
          <div key={chapter.id} style={{ marginBottom: ci < chapters.length - 1 ? 32 : 0 }}>
            {/* Chapter header */}
            <ChapterHeader chapter={chapter} />

            {/* Mission boxes (horizontal flow) */}
            <div className="flex items-stretch flex-wrap" style={{ gap: 0, marginTop: 14 }}>
              {chapter.missions.map((mission, mi) => (
                <div key={mission.id} className="flex items-stretch">
                  <MissionBox
                    mission={mission}
                    selected={mission.id === selectedId}
                    onSelect={() => setSelectedId(mission.id)}
                  />
                  {mi < chapter.missions.length - 1 && <Arrow />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `repeating-linear-gradient(90deg, ${LINE}66 0, ${LINE}66 6px, transparent 6px, transparent 12px)`,
          margin: "8px 36px",
        }}
      />

      {/* ── LOG panel ── */}
      <div style={{ padding: "20px 36px 36px" }}>
        <LogPanel mission={selected} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MOBILE
   ────────────────────────────────────────────────────────── */
function MobileLayout({
  selectedId, setSelectedId, selected,
}: {
  selectedId: string;
  setSelectedId: (id: string) => void;
  selected: Mission;
}) {
  return (
    <div className="h-full overflow-auto rdr-paper" style={{ background: PAPER, color: INK }}>
      {/* Stitched top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none z-10"
        style={{
          background:
            `repeating-linear-gradient(90deg, ${LINE}88 0, ${LINE}88 8px, transparent 8px, transparent 14px)`,
        }}
      />

      {/* Header */}
      <div style={{ padding: "18px 18px 6px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, letterSpacing: "0.3em" }}>
          ARTHUR&apos;S JOURNAL
        </div>
        <div style={{ fontFamily: CINZEL, fontSize: 20, color: INK, fontWeight: 700, letterSpacing: "0.02em", marginTop: 2 }}>
          Career Progression
        </div>
      </div>

      {/* ── Vertical chapter chart ── */}
      <div style={{ padding: "12px 18px 18px" }}>
        {chapters.map((chapter, ci) => (
          <div key={chapter.id} style={{ marginBottom: ci < chapters.length - 1 ? 18 : 0 }}>
            <ChapterHeader chapter={chapter} mobile />
            <div className="flex flex-col" style={{ gap: 0, marginTop: 10 }}>
              {chapter.missions.map((mission, mi) => (
                <div key={mission.id}>
                  <MissionBox
                    mission={mission}
                    selected={mission.id === selectedId}
                    onSelect={() => setSelectedId(mission.id)}
                    mobile
                  />
                  {mi < chapter.missions.length - 1 && <ArrowDown />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `repeating-linear-gradient(90deg, ${LINE}66 0, ${LINE}66 6px, transparent 6px, transparent 12px)`,
          margin: "8px 18px",
        }}
      />

      {/* ── LOG panel ── */}
      <div style={{ padding: "16px 18px 28px" }}>
        <LogPanel mission={selected} mobile />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Subcomponents
   ────────────────────────────────────────────────────────── */

function ChapterHeader({ chapter, mobile = false }: { chapter: typeof chapters[number]; mobile?: boolean }) {
  return (
    <div className="flex items-baseline gap-3" style={{ borderBottom: `1px solid ${LINE}44`, paddingBottom: 6 }}>
      <div style={{ fontFamily: MONO, fontSize: mobile ? 8 : 9, color: INK_SOFT, letterSpacing: "0.4em" }}>
        CHAPTER {chapter.number}
      </div>
      <div style={{ fontFamily: CINZEL, fontSize: mobile ? 15 : 18, color: INK, fontWeight: 700, letterSpacing: "0.06em", flex: 1, lineHeight: 1.1 }}>
        {chapter.title}
      </div>
      <div style={{ fontFamily: MONO, fontSize: mobile ? 8 : 9, color: INK_SOFT, letterSpacing: "0.18em", flexShrink: 0 }}>
        {chapter.period} · {chapter.duration}
      </div>
    </div>
  );
}

function MissionBox({
  mission, selected, onSelect, mobile = false,
}: {
  mission: Mission;
  selected: boolean;
  onSelect: () => void;
  mobile?: boolean;
}) {
  const isCurrent = mission.status === "in_progress";

  return (
    <div className="relative flex flex-col items-stretch" style={{ minWidth: mobile ? "100%" : 184 }}>
      {/* CURRENT badge sits above the active mission box */}
      {isCurrent && (
        <div
          className="absolute"
          style={{
            top: -16,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 8,
            color: ACCENT,
            letterSpacing: "0.35em",
            fontWeight: 700,
          }}
        >
          ★ CURRENT
        </div>
      )}

      <button
        onClick={onSelect}
        className="text-left transition-all active:opacity-70"
        style={{
          padding: mobile ? "12px 14px" : "12px 14px",
          background: INK,
          color: "#f0e8d4",
          border: selected ? `3px solid ${GOLD}` : `3px solid transparent`,
          cursor: "pointer",
          outline: "none",
          minHeight: mobile ? "auto" : 76,
          width: "100%",
          boxShadow: selected ? `0 0 0 1px ${INK}, 4px 4px 0 ${LINE}66` : `4px 4px 0 ${LINE}33`,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <div style={{ fontFamily: CINZEL, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "#f0e8d4", lineHeight: 1.2 }}>
          {mission.title}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: "#c9b890", letterSpacing: "0.18em", marginTop: 6 }}>
          {mission.duration.toUpperCase()}
        </div>
        {/* Status pill */}
        <div className="flex items-center gap-1" style={{ marginTop: 8 }}>
          {mission.status === "complete" ? (
            <>
              <i className="hn hn-badge-check" style={{ color: GOLD, fontSize: 10 }} />
              <span style={{ fontFamily: MONO, fontSize: 8, color: GOLD, letterSpacing: "0.2em" }}>GOLD</span>
            </>
          ) : (
            <>
              <i className="hn hn-spinner" style={{ color: ACCENT, fontSize: 10 }} />
              <span style={{ fontFamily: MONO, fontSize: 8, color: ACCENT, letterSpacing: "0.2em" }}>IN PROGRESS</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center" style={{ width: 28, flexShrink: 0 }}>
      <div style={{ flex: 1, height: 2, background: LINE }} />
      <div
        style={{
          width: 0, height: 0,
          borderTop: `6px solid transparent`,
          borderBottom: `6px solid transparent`,
          borderLeft: `9px solid ${LINE}`,
        }}
      />
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="flex flex-col items-center" style={{ height: 22 }}>
      <div style={{ width: 2, flex: 1, background: LINE }} />
      <div
        style={{
          width: 0, height: 0,
          borderLeft: `6px solid transparent`,
          borderRight: `6px solid transparent`,
          borderTop: `9px solid ${LINE}`,
        }}
      />
    </div>
  );
}

function LogPanel({ mission, mobile = false }: { mission: Mission; mobile?: boolean }) {
  const isCurrent = mission.status === "in_progress";
  const doneCount = mission.objectives.filter((o) => o.done).length;
  const total = mission.objectives.length;

  return (
    <div
      style={{
        background: PAPER_DEEP,
        border: `2px solid ${INK}`,
        padding: mobile ? "18px 16px" : "24px 28px",
        boxShadow: `6px 6px 0 ${LINE}55`,
        position: "relative",
      }}
    >
      {/* Corner ornaments — small */}
      <div className="absolute" style={{ top: 6, left: 6, fontFamily: CINZEL, fontSize: 12, color: INK_SOFT }}>❦</div>
      <div className="absolute" style={{ top: 6, right: 6, fontFamily: CINZEL, fontSize: 12, color: INK_SOFT, transform: "scaleX(-1)" }}>❦</div>

      {/* LOG header */}
      <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, letterSpacing: "0.4em", marginBottom: 10, textAlign: "center" }}>
        ── LOG ──
      </div>

      {/* Mission title + meta */}
      <div style={{ borderBottom: `1px solid ${LINE}55`, paddingBottom: 12, marginBottom: 14 }}>
        <div style={{ fontFamily: CINZEL, fontSize: mobile ? 18 : 22, color: INK, fontWeight: 700, fontStyle: "italic", lineHeight: 1.25 }}>
          {mission.role}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ marginTop: 6 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, letterSpacing: "0.15em" }}>
            {mission.period}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: `${INK_SOFT}aa` }}>·</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, letterSpacing: "0.1em" }}>
            {mission.location}
          </span>
        </div>
      </div>

      {/* Objectives checklist */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, letterSpacing: "0.35em", marginBottom: 10 }}>
          CHECKLIST
        </div>
        <div className="flex flex-col" style={{ gap: 9 }}>
          {mission.objectives.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                style={{
                  width: 16, height: 16, flexShrink: 0, marginTop: 2,
                  border: `2px solid ${o.done ? GOLD : INK_SOFT}`,
                  background: o.done ? `${GOLD}33` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {o.done && <i className="hn hn-check" style={{ color: GOLD, fontSize: 10 }} />}
              </div>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: mobile ? 14 : 15,
                  fontWeight: 500,
                  color: o.done ? INK : INK_SOFT,
                  lineHeight: 1.5,
                  letterSpacing: "0.01em",
                  textDecoration: o.done ? "none" : "none",
                }}
              >
                {o.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weapons unlocked */}
      {mission.weapons.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, letterSpacing: "0.35em", marginBottom: 10 }}>
            WEAPONS UNLOCKED
          </div>
          <div className="flex flex-wrap gap-2">
            {mission.weapons.map((w) => (
              <span
                key={w}
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  padding: "4px 10px",
                  border: `1px solid ${ACCENT}`,
                  background: `${ACCENT}11`,
                  color: ACCENT,
                  letterSpacing: "0.08em",
                }}
              >
                <i className="hn hn-star" style={{ fontSize: 9, marginRight: 5 }} />
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Award row */}
      <div
        className="flex items-center gap-3"
        style={{
          borderTop: `1px dashed ${LINE}66`,
          paddingTop: 14,
          marginTop: 6,
        }}
      >
        {isCurrent ? (
          <>
            <div
              className="flex items-center justify-center"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: `2px solid ${ACCENT}`,
                background: `${ACCENT}1a`,
                flexShrink: 0,
              }}
            >
              <i className="hn hn-spinner" style={{ color: ACCENT, fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontFamily: CINZEL, fontSize: 14, color: ACCENT, fontWeight: 700, letterSpacing: "0.18em" }}>
                IN PROGRESS
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, letterSpacing: "0.1em", marginTop: 2 }}>
                {doneCount} of {total} objectives complete
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex items-center justify-center"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: `2px solid ${GOLD}`,
                background: `${GOLD}22`,
                flexShrink: 0,
              }}
            >
              <i className="hn hn-trophy" style={{ color: GOLD, fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontFamily: CINZEL, fontSize: 14, color: GOLD, fontWeight: 700, letterSpacing: "0.18em" }}>
                GOLD AWARDED
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, letterSpacing: "0.1em", marginTop: 2 }}>
                {doneCount} of {total} objectives complete
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
