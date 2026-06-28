"use client";

import { useEffect, useRef } from "react";
import { createShaderQuad, webglSupported } from "@/lib/webgl/shaderQuad";
import { BOOT_FRAGMENT } from "@/lib/webgl/shaders/boot";

/* ──────────────────────────────────────────────────────────
   Boot backdrop (experiment: bootWebgl).

   A full-bleed WebGL canvas behind the boot loader. pointer-events
   none so taps fall through to the boot screen. Only ever mounts
   during the one-time cold boot, so the cost is transient.
   ────────────────────────────────────────────────────────── */
export default function BootShaderBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !webglSupported()) return;
    const quad = createShaderQuad({ canvas, fragment: BOOT_FRAGMENT, animate: true, dprCap: 1.5 });
    if (!quad) return;
    quad.start();
    return () => quad.destroy();
  }, []);

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
        zIndex: 0,
      }}
    />
  );
}
