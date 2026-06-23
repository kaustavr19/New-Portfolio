"use client";

import { useState } from "react";
import { chapters, Mission } from "@/data/content";
import { useIsMobile } from "@/lib/use-is-mobile";

/* Serif swap: Cinzel had thin strokes that got spindly at body sizes;
   EB Garamond is the closer match to the actual RDR2 in-game journal
   typeface and far more readable at heading + body sizes. */
const SERIF = "'EB Garamond', 'Cinzel', serif";
const MONO = "'Share Tech Mono', monospace";
const BODY = "'EB Garamond', 'Cinzel', serif";

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
const PAPER         = "#e8dcbe";
const PAPER_DEEP    = "#dcceab";
const INK           = "#1a1410";
const INK_SOFT      = "#5a4533";
const ACCENT        = "#9a2410";   // deeper saturated red for use on cream paper
const ACCENT_BRIGHT = "#f08056";   // bright coral for use on dark (black) backgrounds
const ACCENT_FILL   = "#a8230f";   // solid badge fill — IN PROGRESS award badge gets white text on this
const GOLD          = "#c89a3a";   // gold key / awarded
const LINE          = "#8b6a3a";   // arrows + dividers (warm brown)

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
        <div style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, letterSpacing: "0.35em" }}>
          ARTHUR&apos;S JOURNAL
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, color: INK, fontWeight: 700, letterSpacing: "0.01em", marginTop: 4, lineHeight: 1.1 }}>
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
        <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.3em" }}>
          ARTHUR&apos;S JOURNAL
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: INK, fontWeight: 700, letterSpacing: "0.01em", marginTop: 4, lineHeight: 1.1 }}>
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
    <div
      className={mobile ? "flex flex-col gap-1" : "flex items-baseline gap-3"}
      style={{ borderBottom: `1px solid ${LINE}55`, paddingBottom: 8 }}
    >
      <div className="flex items-baseline gap-3" style={{ flex: mobile ? undefined : 1 }}>
        <div style={{ fontFamily: MONO, fontSize: mobile ? 10 : 12, color: INK_SOFT, letterSpacing: "0.4em" }}>
          CHAPTER {chapter.number}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: mobile ? 20 : 24, color: INK, fontWeight: 700, letterSpacing: "0.04em", flex: 1, lineHeight: 1.1 }}>
          {chapter.title}
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: mobile ? 10 : 11, color: INK_SOFT, letterSpacing: "0.16em", flexShrink: 0 }}>
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
      {/* CURRENT badge sits above the active mission box.
          Solid red fill + white text — RDR2 wanted-poster style.
          (Much higher contrast than the previous dark-red-on-cream.) */}
      {isCurrent && (
        <div
          className="absolute"
          style={{
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 10,
            color: "#fff5e6",
            background: ACCENT_FILL,
            letterSpacing: "0.32em",
            fontWeight: 700,
            padding: "3px 10px",
            border: `1px solid ${INK}`,
            boxShadow: `2px 2px 0 ${INK}88`,
            whiteSpace: "nowrap",
            zIndex: 5,
          }}
        >
          ★ CURRENT
        </div>
      )}

      <button
        onClick={onSelect}
        className="text-left transition-all active:opacity-70"
        style={{
          padding: mobile ? "14px 16px" : "14px 16px",
          background: INK,
          color: "#f0e8d4",
          border: selected ? `3px solid ${GOLD}` : `3px solid transparent`,
          cursor: "pointer",
          outline: "none",
          minHeight: mobile ? "auto" : 86,
          width: "100%",
          boxShadow: selected ? `0 0 0 1px ${INK}, 4px 4px 0 ${LINE}66` : `4px 4px 0 ${LINE}33`,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, letterSpacing: "0.04em", color: "#f0e8d4", lineHeight: 1.15 }}>
          {mission.title}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#d4c3a0", letterSpacing: "0.18em", marginTop: 8 }}>
          {mission.duration.toUpperCase()}
        </div>
        {/* Status pill */}
        <div className="flex items-center gap-1" style={{ marginTop: 8 }}>
          {mission.status === "complete" ? (
            <>
              <i className="hn hn-badge-check" style={{ color: GOLD, fontSize: 12 }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.22em", fontWeight: 700 }}>GOLD</span>
            </>
          ) : (
            <>
              <i className="hn hn-spinner" style={{ color: ACCENT_BRIGHT, fontSize: 12 }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: ACCENT_BRIGHT, letterSpacing: "0.22em", fontWeight: 700 }}>IN PROGRESS</span>
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
      {/* Corner ornaments */}
      <div className="absolute" style={{ top: 6, left: 8, fontFamily: SERIF, fontSize: 16, color: INK_SOFT }}>❦</div>
      <div className="absolute" style={{ top: 6, right: 8, fontFamily: SERIF, fontSize: 16, color: INK_SOFT, transform: "scaleX(-1)" }}>❦</div>

      {/* LOG header */}
      <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.4em", marginBottom: 12, textAlign: "center" }}>
        ── LOG ──
      </div>

      {/* Mission title + meta */}
      <div style={{ borderBottom: `1px solid ${LINE}55`, paddingBottom: 14, marginBottom: 16 }}>
        <div style={{ fontFamily: SERIF, fontSize: mobile ? 22 : 28, color: INK, fontWeight: 700, fontStyle: "italic", lineHeight: 1.2 }}>
          {mission.role}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ marginTop: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, letterSpacing: "0.14em" }}>
            {mission.period}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: `${INK_SOFT}aa` }}>·</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, letterSpacing: "0.1em" }}>
            {mission.location}
          </span>
        </div>
      </div>

      {/* Objectives checklist */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.35em", marginBottom: 12 }}>
          CHECKLIST
        </div>
        <div className="flex flex-col" style={{ gap: 11 }}>
          {mission.objectives.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                style={{
                  width: 18, height: 18, flexShrink: 0, marginTop: 3,
                  border: `2px solid ${o.done ? GOLD : INK_SOFT}`,
                  background: o.done ? `${GOLD}33` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {o.done && <i className="hn hn-check" style={{ color: GOLD, fontSize: 12 }} />}
              </div>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: mobile ? 16 : 17,
                  fontWeight: 400,
                  color: o.done ? INK : `${INK_SOFT}cc`,
                  lineHeight: 1.4,
                  letterSpacing: "0.005em",
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
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.35em", marginBottom: 12 }}>
            WEAPONS UNLOCKED
          </div>
          <div className="flex flex-wrap gap-2">
            {mission.weapons.map((w) => (
              <span
                key={w}
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: "5px 12px",
                  border: `1px solid ${ACCENT}`,
                  background: `${ACCENT}11`,
                  color: ACCENT,
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                <i className="hn hn-star" style={{ fontSize: 11, marginRight: 6 }} />
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Award row */}
      <div
        className="flex items-center gap-4"
        style={{
          borderTop: `1px dashed ${LINE}66`,
          paddingTop: 16,
          marginTop: 6,
        }}
      >
        {isCurrent ? (
          <>
            {/* Wanted-poster style: solid red panel + white text. Much
                higher contrast than the previous dark-red on cream. */}
            <div
              className="flex flex-col items-center justify-center"
              style={{
                padding: "8px 14px",
                background: ACCENT_FILL,
                border: `2px solid ${INK}`,
                color: "#fff5e6",
                flexShrink: 0,
                boxShadow: `3px 3px 0 ${INK}77`,
                minWidth: 88,
              }}
            >
              <i className="hn hn-spinner" style={{ color: "#fff5e6", fontSize: 18 }} />
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#fff5e6", letterSpacing: "0.25em", marginTop: 3, fontWeight: 700 }}>ACTIVE</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: ACCENT, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.1 }}>
                IN PROGRESS
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, letterSpacing: "0.08em", marginTop: 4 }}>
                {doneCount} of {total} objectives complete
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex items-center justify-center"
              style={{
                width: 52, height: 52, borderRadius: "50%",
                border: `2px solid ${GOLD}`,
                background: `${GOLD}26`,
                flexShrink: 0,
              }}
            >
              <i className="hn hn-trophy" style={{ color: GOLD, fontSize: 24 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: GOLD, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.1 }}>
                GOLD AWARDED
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: INK_SOFT, letterSpacing: "0.08em", marginTop: 4 }}>
                {doneCount} of {total} objectives complete
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
