import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCaseStudy, longformProjects } from "@/lib/site";
import { coverSvg } from "@/lib/cover";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study by Kaustav Roy";

export function generateStaticParams() {
  return longformProjects.map((p) => ({ slug: p.id }));
}

const ACCENT = "#ff3b30";
const BG = "#000000";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getCaseStudy(slug);

  // Public work ships its own 1200×630 crop of the live site instead of the text card.
  if (p?.type === "consulting") {
    const og = await readFile(join(process.cwd(), "public", p.id, "og.png")).catch(() => null);
    if (og) return new Response(new Uint8Array(og), { headers: { "Content-Type": "image/png" } });
  }
  const fontsDir = join(process.cwd(), "src/app/opengraph-image-fonts");
  const [bebasNeue, shareTechMono] = await Promise.all([
    readFile(join(fontsDir, "BebasNeue-Regular.ttf")),
    readFile(join(fontsDir, "ShareTechMono-Regular.ttf")),
  ]);

  const name = p?.name ?? "Case study";
  const cover = p
    ? `data:image/svg+xml;base64,${Buffer.from(
        coverSvg(p, { lit: "#f2f2f2", live: ACCENT, soft: "#f2f2f259", grid: "#ffffff1c", marker: "#f2f2f2" }, 9),
      ).toString("base64")}`
    : null;
  // Long names ("Cogentiq Agent Compose — Realignment") step the size down to stay on two lines
  const nameSize = name.length > 28 ? 84 : 110;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: BG,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.14) 1.6px, transparent 1.6px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Share Tech Mono", fontSize: 24, color: ACCENT, letterSpacing: 6 }}>
          {`${p?.type === "consulting" ? "CONSULTING" : "CASE STUDY"} · ${p?.status ?? ""}`}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontFamily: "Bebas Neue", fontSize: cover ? Math.round(nameSize * 0.82) : nameSize, color: "#ffffff", lineHeight: 0.95, letterSpacing: 2 }}>
              {name.toUpperCase()}
            </div>
            {p?.tagline && (
              <div style={{ display: "flex", fontFamily: "Share Tech Mono", fontSize: 28, color: "#cfcfcf", marginTop: 24 }}>
                {p.tagline}
              </div>
            )}
          </div>
          {/* The project's generated dot-matrix cover (lib/cover). */}
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} width={432} height={243} alt="" style={{ borderRadius: 18, background: "#1d1d1d" }} />
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Share Tech Mono", fontSize: 22, color: "#8c8c8c", letterSpacing: 4 }}>
          <span>KAUSTAV ROY</span>
          <span style={{ color: "#7ab2ff" }}>KR//OS</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bebas Neue", data: bebasNeue, style: "normal", weight: 400 },
        { name: "Share Tech Mono", data: shareTechMono, style: "normal", weight: 400 },
      ],
    }
  );
}
