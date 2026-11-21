import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { KROS_MARK_BOX, KROS_MARK_PATH } from "@/components/ink/KrosMark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Kaustav Roy — KR//OS";

const ACCENT = "#f2f2f2";
const BG = "#000000";

/* Same static path data as KRMarkPaths (src/components/os/KRMark.tsx) —
   duplicated rather than imported because that component is hook-driven
   (useDeviant, palette-drift state) and Satori (the renderer behind
   ImageResponse) can't execute hooks or SVG <filter>/<animate> elements. */
function KRMonogram({ fill }: { fill: string }) {
  const { x, y, w, h } = KROS_MARK_BOX;
  return (
    <svg width={120} height={120} viewBox={`${x} ${y} ${w} ${h}`} fill="none">
      <path d={KROS_MARK_PATH} fill={fill} />
    </svg>
  );
}

export default async function OpengraphImage() {
  const fontsDir = join(process.cwd(), "src/app/opengraph-image-fonts");
  const [bebasNeue, shareTechMono] = await Promise.all([
    readFile(join(fontsDir, "BebasNeue-Regular.ttf")),
    readFile(join(fontsDir, "ShareTechMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.14) 1.6px, transparent 1.6px)",
          backgroundSize: "24px 24px",
        }}
      >
        <KRMonogram fill={ACCENT} />
        <div
          style={{
            display: "flex",
            fontFamily: "Bebas Neue",
            fontSize: 42,
            color: ACCENT,
            letterSpacing: 8,
            marginTop: 18,
          }}
        >
          {"//OS"}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Bebas Neue",
            fontSize: 96,
            color: "#ffffff",
            letterSpacing: 4,
            marginTop: 8,
            lineHeight: 1,
          }}
        >
          KAUSTAV ROY
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Share Tech Mono",
            fontSize: 26,
            color: "#cfcfcf",
            letterSpacing: 2,
            marginTop: 20,
          }}
        >
          Design × AI × Enterprise UX
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Share Tech Mono",
            fontSize: 16,
            color: "#8c8c8c",
            letterSpacing: 3,
            marginTop: 36,
          }}
        >
          v2.077
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
