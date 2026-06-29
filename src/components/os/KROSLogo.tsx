"use client";

import { useEffect, useState } from "react";
import { sampleAccent } from "@/lib/palette";
import { useDeviant } from "@/lib/deviant";
import { KRMarkPaths } from "./KRMark";

/* Transform that fits the KR monogram into the 240×240 logo box,
   centred above the //OS divider. (mark is 495.54×407.4) */
const MARK_TRANSFORM = "translate(64.25, 50) scale(0.225)";

export default function KROSLogo({
  size = 200,
  opacity = 1,
}: {
  size?: number;
  opacity?: number;
}) {
  const { deviant } = useDeviant();

  // Drift the primary accent in sync with DesktopBg's palette cycle.
  const [accent, setAccent] = useState(deviant ? "#ff3c8c" : "#4fc3f7");
  useEffect(() => {
    setAccent(sampleAccent(performance.now(), deviant));
    const id = setInterval(() => setAccent(sampleAccent(performance.now(), deviant)), 1000);
    return () => clearInterval(id);
  }, [deviant]);

  // Subtle glitch slice — only when deviant; fires every 3-6 s for ~80 ms
  const [glitchY, setGlitchY] = useState<number | null>(null);
  useEffect(() => {
    if (!deviant) { setGlitchY(null); return; }
    let cancelled = false;
    const fire = () => {
      if (cancelled) return;
      // Pick a random horizontal slice band
      setGlitchY(20 + Math.floor(Math.random() * 200));
      setTimeout(() => { if (!cancelled) setGlitchY(null); }, 80 + Math.random() * 60);
      // Schedule next fire
      setTimeout(fire, 3000 + Math.random() * 3500);
    };
    const t = setTimeout(fire, 1500 + Math.random() * 1500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [deviant]);

  const bracketWidth = deviant ? 4 : 3;
  // Detroit accents for deviant text — keep //DEVIANT visible against red
  const wordmark = deviant ? "//DEVIANT" : "//OS";
  const versionTag = deviant ? "BARRIER BROKEN" : "v2.077";
  // Wordmark font-size shrinks slightly when text is longer
  const wordmarkFontSize = deviant ? 16 : 26;
  const wordmarkColor = deviant ? "#ff3c8c" : "#f5e642";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block" }}
    >
      <defs>
        <filter id="kros-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="kros-glow-sm" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer subtle rect */}
      <rect x="18" y="18" width="204" height="204" stroke={accent} strokeWidth="0.5" opacity="0.18" />

      {/* Corner brackets — thicker in deviant mode */}
      <path d="M 18 66 L 18 18 L 66 18" stroke={accent} strokeWidth={bracketWidth} strokeLinecap="square" />
      <path d="M 174 18 L 222 18 L 222 66" stroke={accent} strokeWidth={bracketWidth} strokeLinecap="square" />
      <path d="M 222 174 L 222 222 L 174 222" stroke={accent} strokeWidth={bracketWidth} strokeLinecap="square" />
      <path d="M 66 222 L 18 222 L 18 174" stroke={accent} strokeWidth={bracketWidth} strokeLinecap="square" />

      {/* Corner dots */}
      <circle cx="18" cy="18" r="4" fill={accent} filter="url(#kros-glow-sm)" />
      <circle cx="222" cy="18" r="4" fill={accent} filter="url(#kros-glow-sm)" />
      <circle cx="222" cy="222" r="4" fill={accent} filter="url(#kros-glow-sm)" />
      <circle cx="18" cy="222" r="4" fill={accent} filter="url(#kros-glow-sm)" />

      {/* Side tick marks */}
      <line x1="18" y1="80" x2="32" y2="80" stroke={accent} strokeWidth="1" opacity="0.35" />
      <line x1="208" y1="80" x2="222" y2="80" stroke={accent} strokeWidth="1" opacity="0.35" />
      <line x1="18" y1="160" x2="32" y2="160" stroke={accent} strokeWidth="1" opacity="0.35" />
      <line x1="208" y1="160" x2="222" y2="160" stroke={accent} strokeWidth="1" opacity="0.35" />

      {/* Deviant warning glyph — pulsing red ⚠ in top-right */}
      {deviant && (
        <g transform="translate(200, 36)">
          <polygon
            points="0,-10 10,8 -10,8"
            fill="none"
            stroke="#ff3c8c"
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#kros-glow-sm)"
          >
            <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />
          </polygon>
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#ff3c8c" strokeWidth="2" />
          <circle cx="0" cy="6" r="1" fill="#ff3c8c" />
        </g>
      )}

      {/* KR — custom monogram, colour-driven by the palette accent */}
      <g>
        <g transform={MARK_TRANSFORM} filter="url(#kros-glow)">
          <KRMarkPaths fill={accent} />
        </g>
        {/* Glitch slice overlay — only renders when glitchY is set */}
        {glitchY !== null && (
          <g transform={`translate(${Math.random() < 0.5 ? -3 : 3}, 0)`} opacity="0.6">
            <clipPath id="kros-glitch-clip">
              <rect x="40" y={glitchY} width="160" height="8" />
            </clipPath>
            <g transform={MARK_TRANSFORM} clipPath="url(#kros-glitch-clip)">
              <KRMarkPaths fill="#ff3c8c" />
            </g>
          </g>
        )}
      </g>

      {/* Divider */}
      <line x1="48" y1="148" x2="192" y2="148" stroke={accent} strokeWidth="0.75" opacity="0.4" />

      {/* //OS or //DEVIANT — fixed signature accent */}
      <text
        x="120"
        y="178"
        textAnchor="middle"
        fill={wordmarkColor}
        fontFamily="'Share Tech Mono', monospace"
        fontSize={wordmarkFontSize}
        letterSpacing="3"
        filter="url(#kros-glow-sm)"
      >
        {wordmark}
      </text>

      {/* Version tag / BARRIER BROKEN */}
      <text
        x="120"
        y="206"
        textAnchor="middle"
        fill={accent}
        fontFamily="'Share Tech Mono', monospace"
        fontSize="9"
        opacity="0.55"
        letterSpacing="4"
      >
        {versionTag}
      </text>
    </svg>
  );
}
