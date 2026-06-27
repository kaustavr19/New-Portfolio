"use client";

import dynamic from "next/dynamic";
import { useExperiments } from "@/lib/experiments";

/* ──────────────────────────────────────────────────────────
   ExperimentLayer — the single mount point for WebGL experiments.

   Each effect is dynamically imported and rendered ONLY when its
   flag is on, so a visitor with every flag off downloads none of
   this code. Add future phases (skills3d, bootWebgl, starfield)
   here the same way.
   ────────────────────────────────────────────────────────── */

const CrtOverlay = dynamic(() => import("./CrtOverlay"), { ssr: false });

export default function ExperimentLayer() {
  const { crtShader } = useExperiments();
  return <>{crtShader && <CrtOverlay />}</>;
}
