/* No "use client": these are hook-free, so the same blocks render in the
   OS (client) and in the server-rendered /work pages. */
import type { Figure, ListItem, ProjectBlock, ProjectSection } from "@/data/content";

const MONO = "'Share Tech Mono', monospace";
/* Reading mode's native font — plain, high-legibility, no extra webfont
   load, unlike the HUD's condensed/decorative type. */
export const READER_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ── Shared by the reader and the OS dossier ── */

export function ListItemText({ item, leadColor = "#fff" }: { item: ListItem; leadColor?: string }) {
  if (typeof item === "string") return <>{item}</>;
  return (
    <>
      <strong style={{ color: leadColor }}>{item.lead}</strong> {item.text}
    </>
  );
}

/* One screenshot: AVIF → WebP → PNG, intrinsic size set so there's no layout
   shift, lazy-loaded, and wrapped in a link to the full-size image (no
   lightbox on the site, so "zoom" is opening it in a new tab). */
export function FigureImage({ fig, sizes }: { fig: Figure; sizes: string }) {
  return (
    <a
      href={`${fig.src}.webp`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${fig.alt} (open full size)`}
      style={{
        display: "block",
        position: "relative",
        border: "1px solid #ffffff1f",
        background: "#111",
        cursor: "zoom-in",
        ...(fig.peek ? { maxHeight: fig.peek, overflow: "hidden" } : {}),
      }}
    >
      {fig.peek && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: 140,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 14,
            background: "linear-gradient(to bottom, transparent, #0a0a0aee)",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "#fff",
          }}
        >
          OPEN FULL LENGTH ↗
        </span>
      )}
      <picture>
        <source srcSet={`${fig.src}.avif`} type="image/avif" sizes={sizes} />
        <source srcSet={`${fig.src}.webp`} type="image/webp" sizes={sizes} />
        <img
          src={`${fig.src}.png`}
          alt={fig.alt}
          width={fig.width}
          height={fig.height}
          loading="lazy"
          decoding="async"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </picture>
    </a>
  );
}

const COLS = { full: 1, "2up": 2, "3up": 3 } as const;

export function Figures({ block, captionColor = "#ffffff88" }: { block: Extract<ProjectBlock, { kind: "figures" }>; captionColor?: string }) {
  const cols = COLS[block.layout];
  const sizes = cols === 1 ? "(max-width: 760px) 100vw, 720px" : `(max-width: 760px) ${Math.round(100 / cols)}vw, ${Math.round(720 / cols)}px`;
  return (
    <figure style={{ margin: "6px 0" }}>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, alignItems: "start" }}>
        {block.items.map((f) => (
          <div key={f.src}>
            <FigureImage fig={f} sizes={sizes} />
            {f.caption && (
              <div style={{ fontFamily: MONO, fontSize: 11, color: captionColor, letterSpacing: "0.04em", marginTop: 6, lineHeight: 1.5 }}>{f.caption}</div>
            )}
          </div>
        ))}
      </div>
      {block.caption && (
        <figcaption style={{ fontFamily: MONO, fontSize: 11, color: captionColor, letterSpacing: "0.04em", marginTop: 8, lineHeight: 1.5 }}>
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function CompareTable({
  block,
  font = READER_SANS,
  accent = "#a4c639",
}: {
  block: Extract<ProjectBlock, { kind: "compare" }>;
  font?: string;
  accent?: string;
}) {
  const th: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 600,
    color: "#ffffff88",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid #ffffff33",
  };
  const td: React.CSSProperties = { fontFamily: font, fontSize: 15, lineHeight: 1.55, padding: "10px 12px", borderBottom: "1px solid #ffffff14", verticalAlign: "top" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th scope="col" style={{ ...th, width: "40%" }}>{block.headers[0]}</th>
            <th scope="col" style={{ ...th, color: accent }}>{block.headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map(([before, after]) => (
            <tr key={before}>
              <td style={{ ...td, color: "#ffffff99" }}>{before}</td>
              <td style={{ ...td, color: "#e8e8e8" }}>{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Credits({ block, font = READER_SANS }: { block: Extract<ProjectBlock, { kind: "credits" }>; font?: string }) {
  return (
    <dl className="grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: "minmax(140px, max-content) 1fr" }}>
      {block.items.map((c) => (
        <div key={c.name} style={{ display: "contents" }}>
          <dt style={{ fontFamily: font, fontSize: 16, fontWeight: 600, color: "#fff" }}>{c.name}</dt>
          <dd style={{ fontFamily: font, fontSize: 16, color: "#cfcfcf", lineHeight: 1.5 }}>{c.role}</dd>
        </div>
      ))}
    </dl>
  );
}

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
            <li key={i}>
              <ListItemText item={it} />
            </li>
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
    case "figures":
      return <Figures block={block} />;
    case "compare":
      return <CompareTable block={block} />;
    case "credits":
      return <Credits block={block} />;
  }
}

/* Plain-reader dossier — ordinary article layout instead of HUD panels.
   Section labels stay in the mono HUD type for structural contrast against the serif body.
   Figures need the full column, so the text measure is capped per block instead. */
export function ReaderDossier({ sections }: { sections: ProjectSection[] }) {
  return (
    <div className="flex flex-col gap-8">
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
              <div key={i} style={b.kind === "figures" || b.kind === "compare" ? undefined : { maxWidth: 680 }}>
                <ReaderBlock block={b} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
