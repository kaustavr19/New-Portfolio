"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { audienceProfiles, saveAudience, type AudienceId } from "@/lib/audience";
import { setHash } from "@/lib/deep-link";
import { PERSONNEL_BRIEF_EVENT } from "@/lib/personnel-brief";
import { useReaderMode } from "@/lib/reader-mode";
import { StatTile } from "./ui";

/* First-visit orientation, Ink edition. Same storage key and reopen event
   as the classic PersonnelBrief, so a visitor is briefed once across themes
   and About's "Open brief" button reopens whichever is mounted. */

const BRIEFED_KEY = "kros_personnel_brief_v2";

const PROOF = [
  { value: "~40%", label: "Faster review · AI underwriting" },
  { value: "50+", label: "Designers on one system" },
  { value: "I/O 24", label: "Featured at Google I/O" },
];

export default function InkBrief() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<AudienceId | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { setOpen: openReader } = useReaderMode();

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(BRIEFED_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(BRIEFED_KEY) === "1" || window.location.hash) return;
    } catch {
      // show anyway
    }
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const reopen = () => {
      setChoice(null);
      setOpen(true);
    };
    window.addEventListener(PERSONNEL_BRIEF_EVENT, reopen);
    return () => window.removeEventListener(PERSONNEL_BRIEF_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const go = () => {
    if (choice) saveAudience(choice);
    if (choice === "recruiter") openReader(true);
    if (choice === "collaborator") {
      setHash("projects", "underwriting");
      window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "projects" }));
    }
    dismiss();
  };

  return (
    <div className="ink fixed inset-0 flex items-center justify-center" style={{ zIndex: 9500, background: "#000000cc", padding: 20 }} onMouseDown={(e) => e.target === e.currentTarget && dismiss()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ink-brief-title"
        className="ink-card ink-scroll"
        style={{ width: "min(640px, 100%)", maxHeight: "calc(100vh - 40px)", padding: 28, display: "flex", flexDirection: "column", gap: 22, position: "relative", animation: "ink-in .2s ease-out", outline: "none" }}
      >
        <span aria-hidden className="ink-glyph pulse" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <span className="ink-label ink-live">Incoming · personnel brief</span>
            <h2 id="ink-brief-title" className="ink-dot-900" style={{ fontSize: 40, lineHeight: 1, marginTop: 12 }}>{profile.name.toUpperCase()}</h2>
            <p className="ink-body" style={{ marginTop: 10 }}>{profile.bioShort}</p>
          </div>
          <button type="button" className="ink-pill" onClick={dismiss} aria-label="Close brief">✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {PROOF.map((p) => <StatTile key={p.label} value={p.value} label={p.label} size={26} />)}
        </div>
        <div>
          <span className="ink-label">Who&apos;s visiting?</span>
          <div role="radiogroup" aria-label="Who's visiting" style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {audienceProfiles.map((a) => {
              const on = choice === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setChoice(a.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, textAlign: "left", padding: "14px 16px", borderRadius: 16, border: `1px solid ${on ? "var(--ink-fg)" : "var(--ink-line)"}`, background: on ? "var(--ink-raised)" : "transparent" }}
                >
                  <span>
                    <span className="ink-label" style={{ color: on ? "var(--ink-fg)" : undefined }}>{a.eyebrow}</span>
                    <span style={{ display: "block", fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>{a.description}</span>
                  </span>
                  <span className={`ink-status ${on ? "live" : ""}`} aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="ink-label" onClick={dismiss} style={{ padding: "8px 0" }}>Skip — explore freely</button>
          <button type="button" className="ink-pill solid" onClick={go} disabled={!choice}>
            {audienceProfiles.find((a) => a.id === choice)?.action ?? "Choose one"} →
          </button>
        </div>
      </div>
    </div>
  );
}
