"use client";

import { useCallback, useEffect, useState } from "react";
import { audienceProfiles, saveAudience, type AudienceId } from "@/lib/audience";
import { setHash } from "@/lib/deep-link";
import { PERSONNEL_BRIEF_EVENT } from "@/lib/personnel-brief";
import { useReaderMode } from "@/lib/reader-mode";

/* First-visit orientation, Ink edition — a small card, not a modal.

   It slides in a few seconds after the desktop appears, sits above the
   dock (above the Ask bar on phones), never dims the screen or takes
   focus, and one click on a choice acts immediately. The first impression
   stays the desktop itself.

   Same storage key and reopen event as the classic PersonnelBrief, so a
   visitor is briefed once across themes and About's "Open brief" button
   reopens whichever is mounted. */

const BRIEFED_KEY = "kros_personnel_brief_v2";
const DELAY_MS = 4000;

export default function InkBrief() {
  const [open, setOpen] = useState(false);
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
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(PERSONNEL_BRIEF_EVENT, reopen);
    return () => window.removeEventListener(PERSONNEL_BRIEF_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const go = (choice: AudienceId) => {
    saveAudience(choice);
    if (choice === "recruiter") openReader(true);
    if (choice === "collaborator") {
      setHash("projects", "underwriting");
      window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "projects" }));
    }
    dismiss();
  };

  return (
    <aside className="ink ink-brief ink-card" aria-labelledby="ink-brief-title" style={{ position: "fixed", zIndex: 9500, padding: "16px 16px 14px", boxShadow: "var(--ink-shadow)", animation: "ink-in .24s ease-out", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span className="ink-label ink-live">Incoming · personnel brief</span>
        <button type="button" onClick={dismiss} aria-label="Close brief" style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink-mute)" }}>
          ✕
        </button>
      </div>
      <h2 id="ink-brief-title" style={{ fontSize: 15, fontWeight: 600 }}>Who&apos;s visiting? I&apos;ll point you to the right place.</h2>
      <div style={{ display: "grid", gap: 6 }}>
        {audienceProfiles.map((a) => (
          <button
            key={a.id}
            type="button"
            data-tick
            onClick={() => go(a.id)}
            className="ink-brief-option"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left", padding: "10px 12px", borderRadius: 14, border: "1px solid var(--ink-line)" }}
          >
            <span style={{ minWidth: 0 }}>
              <span className="ink-label" style={{ color: "var(--ink-fg)" }}>{a.eyebrow}</span>
              <span className="ink-meta" style={{ display: "block", fontSize: 12, marginTop: 2, color: "var(--ink-soft)" }}>{a.actionDetail}</span>
            </span>
            <span aria-hidden style={{ color: "var(--ink-blue)" }}>→</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
