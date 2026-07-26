"use client";

import type { ProjectBlock, ProjectSection } from "@/data/content";

const MONO = "'Share Tech Mono', monospace";
/* Reading mode's native font — plain, high-legibility, no extra webfont
   load, unlike the HUD's condensed/decorative type. */
export const READER_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* Plain-reader block — a dossier ProjectBlock rendered as ordinary prose. */
export function ReaderBlock({ block }: { block: ProjectBlock }) {
  switch (block.kind) {
    case "para":
      return <p style={{ fontFamily: READER_SANS, fontSize: 17, color: "#dcdcdc", lineHeight: 1.75 }}>{block.text}</p>;
    case "subhead":
      return <h4 style={{ fontFamily: READER_SANS, fontWeight: 600, fontSize: 18, color: "#fff", marginTop: 6 }}>{block.text}</h4>;
    case "callout":
      return (
        <blockquote style={{ borderLeft: "2px solid #ffffff33", paddingLeft: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#ffffff77", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>
            {block.label}
          </div>
          <p style={{ fontFamily: READER_SANS, fontSize: 17, color: "#e2e2e2", lineHeight: 1.7 }}>{block.text}</p>
        </blockquote>
      );
    case "stats":
      return (
        <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.9 }}>
          {block.items.map((s, i) => (
            <span key={s.label}>
              <strong style={{ color: "#fff" }}>{s.value}</strong> {s.label}
              {i < block.items.length - 1 ? "  ·  " : ""}
            </span>
          ))}
        </p>
      );
    case "pillars":
      return (
        <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.8, paddingLeft: 22 }}>
          {block.items.map((p) => (
            <li key={p.title}>
              <strong style={{ color: "#fff" }}>{p.title}</strong> — {p.sub}
            </li>
          ))}
        </ul>
      );
    case "list":
      return (
        <ul style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.8, paddingLeft: 22 }}>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "findings":
      return (
        <div className="flex flex-col gap-2.5">
          {block.items.map((f) => (
            <p key={f.label} style={{ fontFamily: READER_SANS, fontSize: 16, color: "#cfcfcf", lineHeight: 1.75 }}>
              <strong style={{ color: "#fff" }}>{f.label}.</strong> {f.text}
            </p>
          ))}
        </div>
      );
  }
}

/* Plain-reader dossier — ordinary article layout instead of HUD panels.
   Section labels stay in the mono HUD type for structural contrast against the serif body. */
export function ReaderDossier({ sections }: { sections: ProjectSection[] }) {
  return (
    <div className="flex flex-col gap-8" style={{ maxWidth: 680 }}>
      {sections.map((sec) => (
        <div key={sec.title}>
          <h3
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 13,
              color: "#ffffff88",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 12,
            }}
          >
            {sec.title}
          </h3>
          <div className="flex flex-col gap-3">
            {sec.blocks.map((b, i) => (
              <ReaderBlock key={i} block={b} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
