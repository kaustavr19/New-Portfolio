"use client";

import { useEffect, useRef } from "react";
import { useA11y } from "@/lib/a11y";
import { createShaderQuad, webglSupported } from "@/lib/webgl/shaderQuad";
import { STARFIELD_FRAGMENT } from "@/lib/webgl/shaders/starfield";

/* ──────────────────────────────────────────────────────────
   GPU starfield (experiment: starfieldWebgl).

   A full-bleed WebGL canvas that covers the 2D DesktopBg when the
   flag is on. Sits behind the desktop logo + icons (mounted right
   after DesktopBg in the DOM). pointer-events none.

   Auto-degrades: no WebGL → renders nothing (2D sky stays visible
   underneath). Reduced motion → a single static frame.
   ────────────────────────────────────────────────────────── */
export default function StarfieldWebgl() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { motionReduced } = useA11y();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !webglSupported()) return;
    const quad = createShaderQuad({
      canvas,
      fragment: STARFIELD_FRAGMENT,
      animate: !motionReduced,
      dprCap: 1.5,
    });
    if (!quad) return;
    quad.start();
    return () => quad.destroy();
  }, [motionReduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
