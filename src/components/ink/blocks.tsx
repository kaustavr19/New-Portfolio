/* InkOS dossier blocks — every ProjectBlock kind, in Ink. Hook-free so the
   same renderer serves the OS windows and the server-rendered /work pages. */
import type { Figure, ProjectBlock, ProjectSection } from "@/data/content";
import { ListItemText } from "@/components/reader/blocks";
import { SectionHead, StatTile } from "./ui";

/* Screenshots render greyscale + dot mask (colour on hover/focus);
   wireframes invert to white-on-black. Click opens full size. */
export function InkFigure({ fig, sizes }: { fig: Figure; sizes: string }) {
  const wire = fig.tone === "wireframe";
  return (
    <a
      href={`${fig.src}.webp`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${fig.alt} (open full size)`}
      className={`ink-halftone ${wire ? "" : "dots"}`}
      style={{ display: "block", cursor: "zoom-in", ...(fig.peek ? { maxHeight: fig.peek } : {}) }}
    >
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
          className={wire ? "wire" : undefined}
        />
      </picture>
      {fig.peek && (
        <span aria-hidden className="ink-label" style={{ position: "absolute", insetInline: 0, bottom: 0, height: 120, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14, color: "var(--ink-fg)", background: "linear-gradient(to bottom, transparent, var(--ink-bg))" }}>
          Open full length ↗
        </span>
      )}
    </a>
  );
}

const COLS = { full: 1, "2up": 2, "3up": 3 } as const;

export function InkBlock({ block }: { block: ProjectBlock }) {
  switch (block.kind) {
    case "para":
      return <p className="ink-body" style={{ maxWidth: 720 }}>{block.text}</p>;
    case "subhead":
      return <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{block.text}</h4>;
    case "callout":
      return (
        <blockquote style={{ borderLeft: "2px solid var(--ink-fg)", padding: "2px 0 2px 16px", maxWidth: 720 }}>
          <span className="ink-label">{block.label}</span>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-strong)", marginTop: 6 }}>{block.text}</p>
        </blockquote>
      );
    case "stats":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {block.items.map((s) => (
            <StatTile key={s.label} value={s.value} label={s.sub ? `${s.label} · ${s.sub}` : s.label} size="m" />
          ))}
        </div>
      );
    case "pillars":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {block.items.map((p) => (
            <div key={p.title} className="ink-raised">
              <div className="ink-dot-900" style={{ fontSize: "var(--dot-s)" }}>{p.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-soft)", marginTop: 6 }}>{p.sub}</div>
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, maxWidth: 720 }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ display: "flex", gap: 12, fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)" }}>
              <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink-fg)", marginTop: 10, flexShrink: 0 }} />
              <span><ListItemText item={it} leadColor="var(--ink-fg)" /></span>
            </li>
          ))}
        </ul>
      );
    case "findings":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
          {block.items.map((f) => (
            <div key={f.label} style={{ borderLeft: "1px solid var(--ink-line-strong)", paddingLeft: 14 }}>
              <span className="ink-label" style={{ color: "var(--ink-fg)" }}>{f.label}</span>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 4 }}>{f.text}</p>
            </div>
          ))}
        </div>
      );
    case "figures": {
      const cols = COLS[block.layout];
      const sizes = cols === 1 ? "(max-width: 760px) 100vw, 900px" : `(max-width: 760px) ${Math.round(100 / cols)}vw, ${Math.round(900 / cols)}px`;
      return (
        <figure style={{ margin: "4px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 10, alignItems: "start" }}>
            {block.items.map((f) => (
              <div key={f.src}>
                <InkFigure fig={f} sizes={sizes} />
                {f.caption && <div className="ink-meta" style={{ marginTop: 6 }}>{f.caption}</div>}
              </div>
            ))}
          </div>
          {block.caption && <figcaption className="ink-meta" style={{ marginTop: 8 }}>{block.caption}</figcaption>}
        </figure>
      );
    }
    case "compare":
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th scope="col" className="ink-label" style={{ textAlign: "left", fontWeight: 400, padding: "10px 12px 10px 0", borderBottom: "1px solid var(--ink-line-strong)", width: "40%" }}>{block.headers[0]}</th>
                <th scope="col" className="ink-label ink-blue" style={{ textAlign: "left", fontWeight: 400, padding: "10px 0", borderBottom: "1px solid var(--ink-line-strong)" }}>{block.headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([a, b]) => (
                <tr key={a}>
                  <td style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid var(--ink-line)", color: "var(--ink-mute)", fontSize: 14, lineHeight: 1.5, verticalAlign: "top" }}>{a}</td>
                  <td style={{ padding: "10px 0", borderBottom: "1px solid var(--ink-line)", fontSize: 14, lineHeight: 1.5, verticalAlign: "top" }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "credits":
      return (
        <dl style={{ display: "grid", gridTemplateColumns: "minmax(140px, max-content) 1fr", gap: "8px 24px" }}>
          {block.items.map((c) => (
            <div key={c.name} style={{ display: "contents" }}>
              <dt style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</dt>
              <dd style={{ fontSize: 15, color: "var(--ink-soft)" }}>{c.role}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

/* Numbered sections; numbering is skipped when titles already carry one ("01 · …"). */
export function InkDossier({ sections, headingLevel = "h3" }: { sections: ProjectSection[]; headingLevel?: "h2" | "h3" }) {
  let n = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      {sections.map((sec) => {
        const numbered = /^\d+\s*·/.test(sec.title);
        const title = numbered ? sec.title.replace(/^(\d+)\s*·\s*/, "") : sec.title;
        const idx = numbered ? sec.title.match(/^\d+/)![0] : String(++n).padStart(2, "0");
        return (
          <section key={sec.title}>
            <SectionHead n={idx} as={headingLevel}>{title}</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sec.blocks.map((b, i) => <InkBlock key={i} block={b} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
