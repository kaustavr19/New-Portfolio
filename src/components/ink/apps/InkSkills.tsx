"use client";

import { useState } from "react";
import { capabilityGroups, projects, skills } from "@/data/content";
import { setHash } from "@/lib/deep-link";
import { SectionHead, SegBar } from "../ui";

type Group = keyof typeof capabilityGroups;

const GROUPS: { id: Group; label: string; summary: string }[] = [
  { id: "intelligence", label: "AI systems", summary: "Designing intelligent systems people can understand, question, and overrule." },
  { id: "technical", label: "Product systems", summary: "Turning complex products into coherent workflows, systems, and information." },
  { id: "cool", label: "Delivery", summary: "Researching, aligning, and shipping across specialist teams and constraints." },
  { id: "body", label: "Build lab", summary: "Using code and reusable tooling to move ideas from claims to working proof." },
];

function openProject(id: string) {
  setHash("projects", id);
  window.dispatchEvent(new Event("hashchange"));
  window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "projects" }));
}

export default function InkSkills() {
  const [group, setGroup] = useState<Group>("intelligence");
  const meta = GROUPS.find((g) => g.id === group)!;

  return (
    <div className="ink-app ink-app-scroll">
      <div style={{ padding: "clamp(20px, 3cqi, 36px)", display: "flex", flexDirection: "column", gap: 28 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
          <div>
            <span className="ink-label">Capability map · evidence-linked</span>
            <h3 className="ink-dot-900" style={{ fontSize: "clamp(30px, 5cqi, 44px)", lineHeight: 1, marginTop: 8, textTransform: "uppercase" }}>{meta.label}</h3>
            <p className="ink-body" style={{ marginTop: 8, maxWidth: 560 }}>{meta.summary}</p>
          </div>
          <div className="ink-seg" role="tablist" aria-label="Capability groups" style={{ flexWrap: "wrap", borderRadius: 22 }}>
            {GROUPS.map((g) => (
              <button key={g.id} type="button" role="tab" aria-selected={g.id === group} onClick={() => setGroup(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {capabilityGroups[group].map((c, i) => (
            <article key={c.name} className="ink-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span className="ink-dot" style={{ fontSize: 15, color: "var(--ink-dim)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="ink-label">{c.evidence.length} proof points</span>
              </div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 600 }}>{c.name}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 6 }}>{c.claim}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.methods.map((m) => (
                  <span key={m} className="ink-label" style={{ border: "1px solid var(--ink-line)", borderRadius: 999, padding: "4px 10px", color: "var(--ink-soft)" }}>{m}</span>
                ))}
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                {c.evidence.map((e) => {
                  const proj = e.projectId ? projects.find((p) => p.id === e.projectId) : undefined;
                  const body = (
                    <>
                      <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <b className="ink-dot" style={{ fontSize: 15 }}>{e.signal}</b>
                        <span className="ink-label" style={{ fontSize: 9 }}>{e.source}</span>
                      </span>
                      <span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: "var(--ink-mute)", marginTop: 4 }}>{e.detail}</span>
                      {(proj || e.href) && <span className="ink-meta ink-blue" style={{ display: "block", marginTop: 6 }}>{proj ? `${proj.name} →` : "Source ↗"}</span>}
                    </>
                  );
                  const style = { display: "block", width: "100%", textAlign: "left" as const, background: "var(--ink-raised)", borderRadius: 14, padding: "12px 14px", textDecoration: "none" };
                  return (
                    <li key={e.signal}>
                      {proj ? (
                        <button type="button" style={style} onClick={() => openProject(proj.id)}>{body}</button>
                      ) : e.href ? (
                        <a href={e.href} target="_blank" rel="noopener noreferrer" style={style}>{body}</a>
                      ) : (
                        <div style={style}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>

        <section>
          <SectionHead as="h4">Toolkit</SectionHead>
          <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "4px 32px" }}>
            {skills.technical.map((s) => (
              <li key={s.name} style={{ display: "grid", gridTemplateColumns: "140px minmax(0, 1fr) 30px", alignItems: "center", gap: 12, padding: "6px 0" }}>
                <span style={{ fontSize: 13.5 }}>{s.name}</span>
                <SegBar value={s.level} segments={20} label={s.name} />
                <span className="ink-dot" style={{ fontSize: 14, textAlign: "right" }}>{s.level}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
