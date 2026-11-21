"use client";

import { useEffect, useRef, useState } from "react";
import { projects, type Project, type ProjectType } from "@/data/content";
import { parseHash, setHash } from "@/lib/deep-link";
import { isGated } from "@/lib/site";
import { InkDossier } from "../blocks";
import { SectionHead, SegBar, StatTile } from "../ui";

const TABS: { type: ProjectType; label: string; kicker: string }[] = [
  { type: "main", label: "Main", kicker: "Story" },
  { type: "consulting", label: "Contracts", kicker: "Outside engagements" },
  { type: "side", label: "Side", kicker: "Built on the side" },
];

function fromHash(): Project | undefined {
  const t = parseHash();
  if (t?.app !== "projects" || !t.subId) return undefined;
  return projects.find((p) => p.id === t.subId);
}

const isLive = (p: Project) => p.status === "IN PROGRESS";

function Brief({ p }: { p: Project }) {
  const gated = isGated(p);
  const passed = p.completion >= 100;
  const hasPage = p.type !== "side";
  const done = p.objectives?.filter((o) => o.done).length ?? 0;

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <h3 className="ink-dot-900" style={{ fontSize: "clamp(30px, 6cqi, 48px)", lineHeight: 0.95, textTransform: "uppercase", overflowWrap: "anywhere" }}>{p.name}</h3>
          <p style={{ fontSize: 17, marginTop: 12 }}>{p.tagline}</p>
          {p.role && <p className="ink-meta" style={{ marginTop: 8, letterSpacing: ".03em" }}>{p.role}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }} aria-label={`Difficulty ${p.stars} of 5`}>
            <span className="ink-label" style={{ marginRight: 6 }}>Difficulty</span>
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: i < p.stars ? "var(--ink-fg)" : "transparent", border: i < p.stars ? 0 : "1.5px solid var(--ink-dim)" }} />
            ))}
            <span className="ink-meta" style={{ marginLeft: 10 }}>{p.year}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          {p.featured && <span className="ink-pill">★ Featured</span>}
          {p.live && <a className="ink-pill solid" href={p.live.href} target="_blank" rel="noopener noreferrer">● Live ↗</a>}
          {hasPage && <a className="ink-pill action" href={`/work/${p.id}`}>Read case study →</a>}
          {p.github && <a className="ink-pill action" href={p.github} target="_blank" rel="noopener noreferrer">View repo ↗</a>}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div className="ink-raised" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span className="ink-dot-900" style={{ fontSize: 26 }}>{passed ? "MISSION PASSED" : "MISSION ACTIVE"}</span>
            {p.medal ? (
              <span className="ink-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid var(--ink-fg)", display: "grid", placeItems: "center" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ink-fg)" }} />
                </span>
                {p.medal}
              </span>
            ) : (
              !passed && <span className="ink-label ink-live">In progress</span>
            )}
          </div>
          <SegBar value={p.completion} segments={40} live={!passed} height={12} label="Completion" />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="ink-label">Completion</span>
            <span className="ink-dot" style={{ fontSize: 20 }}>{p.completion}%</span>
          </div>
        </div>
        {p.intel && p.intel.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {p.intel.map((s) => <StatTile key={s.label} value={s.value} label={s.label} />)}
          </div>
        )}
      </div>

      <section>
        <SectionHead as="h4">Mission brief</SectionHead>
        <p className="ink-body" style={{ maxWidth: 760 }}>{p.summary ?? p.description}</p>
      </section>

      {gated ? (
        <section style={{ position: "relative" }}>
          <SectionHead as="h4">Dossier</SectionHead>
          <div className="ink-redact" aria-hidden>
            {[100, 84, 100, 62, 92, 74].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}
          </div>
          <div className="ink-card" role="note" style={{ position: "absolute", right: 0, top: 30, maxWidth: 400, display: "flex", gap: 14, background: "var(--ink-bg)", borderColor: "var(--ink-line-strong)" }}>
            <span aria-hidden style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", border: "1.5px solid var(--ink-red)", display: "grid", placeItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ink-red)" }} />
            </span>
            <div>
              <span className="ink-label ink-red">Classified · active engagement</span>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-soft)", marginTop: 6 }}>{p.classified}</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {p.objectives && p.objectives.length > 0 && (
            <section>
              <SectionHead as="h4">{`Objectives · ${done} of ${p.objectives.length}`}</SectionHead>
              <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "8px 28px" }}>
                {p.objectives.map((o) => (
                  <li key={o.text} style={{ display: "flex", gap: 12, fontSize: 14, lineHeight: 1.45, color: o.done ? "var(--ink-soft)" : "var(--ink-mute)" }}>
                    <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, marginTop: 3, flexShrink: 0, background: o.done ? "var(--ink-fg)" : "transparent", border: o.done ? 0 : "1.5px solid var(--ink-dim)" }} />
                    <span>{o.text}{!o.done && <span className="sr-only"> (in progress)</span>}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {p.dossier && p.dossier.length > 0 && <InkDossier sections={p.dossier} headingLevel="h3" />}
          {p.debrief && (
            <section>
              <SectionHead as="h4">Debrief</SectionHead>
              <p className="ink-body" style={{ maxWidth: 760 }}>{p.debrief}</p>
            </section>
          )}
          {p.classified && <p className="ink-meta" style={{ border: "1px dashed var(--ink-line-strong)", borderRadius: 14, padding: "12px 16px" }}>{p.classified}</p>}
        </>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} aria-label="Topics">
        {p.tags.map((t) => <span key={t} className="ink-label" style={{ border: "1px solid var(--ink-line)", borderRadius: 999, padding: "5px 11px", color: "var(--ink-soft)" }}>{t}</span>)}
      </div>
    </article>
  );
}

export default function InkProjects() {
  const initial = fromHash();
  const [tab, setTab] = useState<ProjectType>(initial?.type ?? "main");
  const [selected, setSelected] = useState<string>(initial?.id ?? projects.find((p) => p.type === "main")!.id);
  const panelRef = useRef<HTMLDivElement>(null);
  const visible = projects.filter((p) => p.type === tab);
  const project = visible.find((p) => p.id === selected) ?? visible[0];

  useEffect(() => {
    setHash("projects", project.id);
  }, [project.id]);
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [project.id]);
  useEffect(() => {
    const on = () => {
      const p = fromHash();
      if (p) {
        setTab(p.type);
        setSelected(p.id);
      }
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const meta = TABS.find((t) => t.type === tab)!;

  return (
    <div className="ink-app ink-projects" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "14px 12px", borderBottom: "1px solid var(--ink-line)", flexShrink: 0 }}>
        <div className="ink-seg" role="tablist" aria-label="Mission type">
          {TABS.map((t) => (
            <button
              key={t.type}
              type="button"
              role="tab"
              aria-selected={tab === t.type}
              onClick={() => {
                setTab(t.type);
                setSelected(projects.find((p) => p.type === t.type)!.id);
              }}
            >
              {t.label} <b>{projects.filter((p) => p.type === t.type).length}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="ink-projects-body" style={{ flex: 1, minHeight: 0 }}>
        <nav aria-label={`${meta.label} missions`} className="ink-projects-rail ink-scroll">
          <div className="ink-projects-railhead">
            <span className="ink-label">{meta.kicker}</span>
            <div className="ink-dot-900" style={{ fontSize: 28, marginTop: 4 }}>
              {String(visible.length).padStart(2, "0")} MISSION{visible.length === 1 ? "" : "S"}
            </div>
          </div>
          <ul style={{ listStyle: "none", display: "contents" }}>
            {visible.map((p, i) => {
              const on = p.id === project.id;
              return (
                <li key={p.id} style={{ display: "contents" }}>
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => setSelected(p.id)}
                    className="ink-projects-item"
                    style={{ background: on ? "var(--ink-raised)" : "transparent", outline: on ? "1px solid var(--ink-line-strong)" : "none" }}
                  >
                    <span className="ink-dot" style={{ fontSize: 17, color: on ? "var(--ink-fg)" : "var(--ink-dim)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ minWidth: 0, textAlign: "left" }}>
                      <span style={{ display: "block", fontSize: 14, lineHeight: 1.3, color: on ? "var(--ink-fg)" : "var(--ink-soft)" }}>{p.name}</span>
                      <span className="ink-label" style={{ display: "block", fontSize: 9.5, marginTop: 3 }}>
                        {p.status}{p.featured ? " · Featured" : ""}
                      </span>
                    </span>
                    <span className={`ink-status ${isLive(p) ? "live" : ""}`} aria-label={isLive(p) ? "active" : "complete"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div ref={panelRef} className="ink-scroll" style={{ minHeight: 0, padding: "clamp(20px, 3cqi, 36px)" }}>
          <Brief key={project.id} p={project} />
        </div>
      </div>
    </div>
  );
}
