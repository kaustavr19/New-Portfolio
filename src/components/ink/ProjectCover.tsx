import type { Project } from "@/data/content";
import { buildCover, COVER_COLS, COVER_ROWS } from "@/lib/cover";

/* A project's generated dot-matrix cover (see lib/cover). Hook-free, so it
   renders on the server pages and in the OS alike. Colours come from the
   InkOS palette, so it follows light / dark. Decorative: the project's name
   is always printed next to it. */
export default function ProjectCover({
  project,
  radius = 16,
  style,
}: {
  project: Pick<Project, "id" | "name" | "type" | "status" | "completion">;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const P = 10;
  const h = P / 2;
  const { dots, marker } = buildCover(project);
  const pid = `cover-grid-${project.id}`;
  const mx = marker.c * P + h, my = marker.r * P + h;
  return (
    <svg
      viewBox={`0 0 ${COVER_COLS * P} ${COVER_ROWS * P}`}
      aria-hidden
      focusable="false"
      style={{ display: "block", width: "100%", height: "auto", borderRadius: radius, background: "var(--ink-sunken)", ...style }}
    >
      <defs>
        <pattern id={pid} width={P} height={P} patternUnits="userSpaceOnUse">
          <circle cx={h} cy={h} r={P * 0.11} style={{ fill: "var(--ink-dot)" }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
      {dots.map((d) => (
        <circle
          key={`${d.c},${d.r}`}
          cx={d.c * P + h}
          cy={d.r * P + h}
          r={P * (d.tone === "soft" ? 0.2 : 0.36)}
          className={d.tone === "live" ? "ink-workdot live" : undefined}
          style={{ fill: d.tone === "live" ? "var(--ink-red)" : "var(--ink-fg)", opacity: d.tone === "soft" ? 0.35 : 1 }}
        />
      ))}
      {marker.kind === "consulting" ? (
        <circle cx={mx} cy={my} r={P * 0.8} style={{ fill: "none", stroke: "var(--ink-fg)", strokeWidth: P * 0.22 }} />
      ) : (
        <circle cx={mx} cy={my} r={P * (marker.kind === "main" ? 0.9 : 0.45)} style={{ fill: "var(--ink-fg)" }} />
      )}
    </svg>
  );
}
