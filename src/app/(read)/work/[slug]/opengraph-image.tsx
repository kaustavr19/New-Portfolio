import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { caseStudies, getCaseStudy } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study by Kaustav Roy";

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.id }));
}

const ACCENT = "#a4c639";
const BG = "#0a0a14";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getCaseStudy(slug);
  const fontsDir = join(process.cwd(), "src/app/opengraph-image-fonts");
  const [bebasNeue, shareTechMono] = await Promise.all([
    readFile(join(fontsDir, "BebasNeue-Regular.ttf")),
    readFile(join(fontsDir, "ShareTechMono-Regular.ttf")),
  ]);

  const name = p?.name ?? "Case study";
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
            "linear-gradient(rgba(164,198,57,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(164,198,57,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Share Tech Mono", fontSize: 24, color: ACCENT, letterSpacing: 6 }}>
          {`CASE STUDY · ${p?.status ?? ""}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Bebas Neue", fontSize: nameSize, color: "#ffffff", lineHeight: 0.95, letterSpacing: 2 }}>
            {name.toUpperCase()}
          </div>
          {p?.tagline && (
            <div style={{ display: "flex", fontFamily: "Share Tech Mono", fontSize: 30, color: "#c8c8d4", marginTop: 24 }}>
              {p.tagline}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Share Tech Mono", fontSize: 22, color: "#6a6a80", letterSpacing: 4 }}>
          <span>KAUSTAV ROY</span>
          <span style={{ color: "#4fc3f7" }}>KR//OS</span>
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
