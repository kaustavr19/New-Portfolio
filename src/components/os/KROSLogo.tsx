export default function KROSLogo({
  size = 200,
  opacity = 1,
}: {
  size?: number;
  opacity?: number;
}) {
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
      <rect x="18" y="18" width="204" height="204" stroke="#4fc3f7" strokeWidth="0.5" opacity="0.18" />

      {/* Corner brackets — TL */}
      <path d="M 18 66 L 18 18 L 66 18" stroke="#4fc3f7" strokeWidth="3" strokeLinecap="square" />
      {/* Corner brackets — TR */}
      <path d="M 174 18 L 222 18 L 222 66" stroke="#4fc3f7" strokeWidth="3" strokeLinecap="square" />
      {/* Corner brackets — BR */}
      <path d="M 222 174 L 222 222 L 174 222" stroke="#4fc3f7" strokeWidth="3" strokeLinecap="square" />
      {/* Corner brackets — BL */}
      <path d="M 66 222 L 18 222 L 18 174" stroke="#4fc3f7" strokeWidth="3" strokeLinecap="square" />

      {/* Corner dots */}
      <circle cx="18" cy="18" r="4" fill="#4fc3f7" filter="url(#kros-glow-sm)" />
      <circle cx="222" cy="18" r="4" fill="#4fc3f7" filter="url(#kros-glow-sm)" />
      <circle cx="222" cy="222" r="4" fill="#4fc3f7" filter="url(#kros-glow-sm)" />
      <circle cx="18" cy="222" r="4" fill="#4fc3f7" filter="url(#kros-glow-sm)" />

      {/* Side tick marks */}
      <line x1="18" y1="80" x2="32" y2="80" stroke="#4fc3f7" strokeWidth="1" opacity="0.35" />
      <line x1="208" y1="80" x2="222" y2="80" stroke="#4fc3f7" strokeWidth="1" opacity="0.35" />
      <line x1="18" y1="160" x2="32" y2="160" stroke="#4fc3f7" strokeWidth="1" opacity="0.35" />
      <line x1="208" y1="160" x2="222" y2="160" stroke="#4fc3f7" strokeWidth="1" opacity="0.35" />

      {/* KR — main wordmark */}
      <text
        x="120"
        y="134"
        textAnchor="middle"
        fill="#4fc3f7"
        fontFamily="'Orbitron', monospace"
        fontSize="80"
        fontWeight="700"
        filter="url(#kros-glow)"
        letterSpacing="-2"
      >
        KR
      </text>

      {/* Divider */}
      <line x1="48" y1="148" x2="192" y2="148" stroke="#4fc3f7" strokeWidth="0.75" opacity="0.4" />

      {/* //OS */}
      <text
        x="120"
        y="178"
        textAnchor="middle"
        fill="#f5e642"
        fontFamily="'Share Tech Mono', monospace"
        fontSize="26"
        letterSpacing="5"
        filter="url(#kros-glow-sm)"
      >
        //OS
      </text>

      {/* Version tag */}
      <text
        x="120"
        y="206"
        textAnchor="middle"
        fill="#4fc3f7"
        fontFamily="'Share Tech Mono', monospace"
        fontSize="9"
        opacity="0.38"
        letterSpacing="4"
      >
        v2.077
      </text>
    </svg>
  );
}
