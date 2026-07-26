"use client";

import { setHash } from "@/lib/deep-link";

const MONO = "'Share Tech Mono', monospace";
const SANS = "'Rajdhani', sans-serif";

function openContact() {
  setHash("contact");
  window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "contact" }));
}

export default function ContactCTA({
  accent,
  eyebrow = "NEXT STEP",
  title = "Have a problem worth untangling?",
  body = "If this work maps to something your team is building, send the context. A role description, rough brief, or difficult workflow is enough to start.",
  tone = "dark",
}: {
  accent: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  tone?: "dark" | "paper";
}) {
  const paper = tone === "paper";
  const foreground = paper ? "#1a1410" : "#f0f0f5";
  const muted = paper ? "#5a4533" : "#9b9bad";

  return (
    <section
      style={{
        padding: "20px",
        border: `1px solid ${accent}55`,
        background: paper ? "rgba(255,255,255,0.16)" : `${accent}08`,
        boxShadow: `inset 3px 0 0 ${accent}`,
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 8, color: accent, letterSpacing: "0.24em" }}>
        {eyebrow}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: foreground, marginTop: 7 }}>
        {title}
      </div>
      <p style={{ fontFamily: SANS, fontSize: 14, color: muted, lineHeight: 1.5, margin: "7px 0 15px", maxWidth: 620 }}>
        {body}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openContact}
          className="transition-all hover:brightness-125"
          style={{
            padding: "8px 12px",
            border: `1px solid ${accent}`,
            background: `${accent}16`,
            color: paper ? "#1a1410" : accent,
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          START A CONVERSATION
        </button>
        <a
          href="/Kaustav_Roy_CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="transition-all hover:brightness-125"
          style={{
            padding: "8px 12px",
            border: `1px solid ${paper ? "#5a453366" : "#ffffff26"}`,
            color: muted,
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: "0.14em",
            textDecoration: "none",
          }}
        >
          RESUME.PDF
        </a>
      </div>
    </section>
  );
}
