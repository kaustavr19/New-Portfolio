"use client";

import { useEffect, useRef } from "react";
import { useA11y } from "@/lib/a11y";
import { createShaderQuad, webglSupported } from "@/lib/webgl/shaderQuad";
import { CRT_FRAGMENT } from "@/lib/webgl/shaders/crt";

/* ──────────────────────────────────────────────────────────
   CRT phosphor overlay (experiment: crtShader).

   A fixed, pointer-transparent full-screen canvas above the whole
   OS. Runs the CRT fragment shader. Auto-degrades:
     · no WebGL        → renders nothing (DOM is untouched)
     · reduced motion  → a single static frame, no animation
   ────────────────────────────────────────────────────────── */
export default function CrtOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { motionReduced } = useA11y();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !webglSupported()) return;

    const quad = createShaderQuad({
      canvas,
      fragment: CRT_FRAGMENT,
      animate: !motionReduced,
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
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        // Above everything, including the taskbar and a11y menu.
        zIndex: 2147483000,
      }}
    />
  );
}
