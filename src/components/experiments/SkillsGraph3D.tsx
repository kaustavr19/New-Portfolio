"use client";

import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Geometry, Program, Mesh, Vec3, Orbit } from "ogl";
import { skills } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { webglSupported } from "@/lib/webgl/shaderQuad";

/* ──────────────────────────────────────────────────────────
   Skills as an orbitable 3D node graph (experiment: skills3d).

   Layout: a central hub → 4 category nodes on a ring → each
   category's skills scattered on a small sphere around it.
   Node size ∝ skill level. Drag to orbit; gentle auto-spin.

   `active` (the category selected in the left nav) brightens its
   cluster and dims the rest, so the existing nav still drives this.

   OGL only (~10kb). Auto-degrades: no WebGL → renders a notice and
   the parent keeps the DOM list. Reduced motion → no auto-spin.
   ────────────────────────────────────────────────────────── */

type Category = "intelligence" | "technical" | "cool" | "body";

const CATS: Category[] = ["intelligence", "technical", "cool", "body"];

// RGB 0..1 per category (matches SkillsApp neon palette).
const CAT_RGB: Record<Category, [number, number, number]> = {
  intelligence: [0.0, 1.0, 1.0], // cyan
  technical: [0.96, 0.9, 0.26], // yellow
  cool: [1.0, 0.0, 0.56], // magenta
  body: [0.66, 0.33, 0.97], // purple
};

const HUB_RGB: [number, number, number] = [0.85, 0.9, 1.0];

type Node = {
  pos: [number, number, number];
  rgb: [number, number, number];
  size: number;
  cat: number; // -1 hub, 0..3 category index
};

/* Deterministic layout — no physics, just placed geometry. */
function buildGraph() {
  const nodes: Node[] = [];
  const edges: number[] = []; // flat [x,y,z, x,y,z, ...] line segments

  // Hub
  nodes.push({ pos: [0, 0, 0], rgb: HUB_RGB, size: 26, cat: -1 });

  const RING = 3.4;
  CATS.forEach((cat, ci) => {
    // Category node on a ring, tilted so it reads as 3D.
    const a = (ci / CATS.length) * Math.PI * 2;
    const tilt = (ci % 2 === 0 ? 1 : -1) * 0.8;
    const cx = Math.cos(a) * RING;
    const cy = tilt;
    const cz = Math.sin(a) * RING;
    const catIdx = nodes.length;
    nodes.push({ pos: [cx, cy, cz], rgb: CAT_RGB[cat], size: 20, cat: ci });
    edges.push(0, 0, 0, cx, cy, cz); // hub → category

    // Skills on a small fibonacci sphere around the category node.
    const items = skills[cat];
    const n = items.length;
    items.forEach((s, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.25;
      const sx = cx + r * Math.sin(phi) * Math.cos(theta);
      const sy = cy + r * Math.cos(phi);
      const sz = cz + r * Math.sin(phi) * Math.sin(theta);
      nodes.push({
        pos: [sx, sy, sz],
        rgb: CAT_RGB[cat],
        size: 6 + (s.level / 100) * 9, // bigger node = higher level
        cat: ci,
      });
      edges.push(cx, cy, cz, sx, sy, sz); // category → skill
    });
  });

  return { nodes, edges };
}

const NODE_VERT = `
attribute vec3 position;
attribute vec3 color;
attribute float size;
attribute float cat;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uActive;
uniform float uDpr;
varying vec3 vColor;
varying float vDim;
void main() {
  vColor = color;
  // hub (cat<0) always bright; otherwise dim unless it's the active cluster
  vDim = (cat < 0.0 || abs(cat - uActive) < 0.5) ? 1.0 : 0.5;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  // perspective-attenuated point size
  gl_PointSize = size * uDpr * (8.0 / -mv.z);
}
`;

const NODE_FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vDim;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float glow = smoothstep(0.5, 0.15, d);
  vec3 col = vColor * (0.55 + 0.65 * core);
  float a = (glow * 0.85 + core * 0.15) * vDim;
  gl_FragColor = vec4(col, a);
}
`;

const EDGE_VERT = `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const EDGE_FRAG = `
precision mediump float;
uniform vec3 uColor;
void main() { gl_FragColor = vec4(uColor, 0.24); }
`;

export default function SkillsGraph3D({ active }: { active: Category }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number>(CATS.indexOf(active));
  const { motionReduced } = useA11y();

  // Keep the shader's active-cluster uniform in sync without re-mounting.
  useEffect(() => {
    activeRef.current = CATS.indexOf(active);
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !webglSupported()) return;

    const renderer = new Renderer({
      alpha: true,
      dpr: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      // Stable buffer: predictable for readback and headless capture.
      preserveDrawingBuffer: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    host.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const camera = new Camera(gl, { fov: 40 });
    camera.position.set(0, 1.5, 11);
    const controls = new Orbit(camera, {
      element: host,
      target: new Vec3(0, 0, 0),
      enablePan: false,
      enableZoom: true,
      maxDistance: 20,
      minDistance: 5,
      ease: 0.12,
      inertia: 0.7,
    });

    const scene = new Transform();

    const { nodes, edges } = buildGraph();

    // Node geometry (drawn as GL_POINTS).
    const count = nodes.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const cats = new Float32Array(count);
    nodes.forEach((nd, i) => {
      positions.set(nd.pos, i * 3);
      colors.set(nd.rgb, i * 3);
      sizes[i] = nd.size;
      cats[i] = nd.cat;
    });
    const nodeGeo = new Geometry(gl, {
      position: { size: 3, data: positions },
      color: { size: 3, data: colors },
      size: { size: 1, data: sizes },
      cat: { size: 1, data: cats },
    });
    const nodeProg = new Program(gl, {
      vertex: NODE_VERT,
      fragment: NODE_FRAG,
      uniforms: {
        uActive: { value: activeRef.current },
        uDpr: { value: Math.min(window.devicePixelRatio, 2) },
      },
      transparent: true,
      depthTest: false,
    });
    const nodeMesh = new Mesh(gl, { geometry: nodeGeo, program: nodeProg, mode: gl.POINTS });
    nodeMesh.setParent(scene);

    // Edge geometry (GL_LINES).
    const edgeGeo = new Geometry(gl, { position: { size: 3, data: new Float32Array(edges) } });
    const edgeProg = new Program(gl, {
      vertex: EDGE_VERT,
      fragment: EDGE_FRAG,
      uniforms: { uColor: { value: new Float32Array([0.6, 0.7, 0.9]) } },
      transparent: true,
      depthTest: false,
    });
    const edgeMesh = new Mesh(gl, { geometry: edgeGeo, program: edgeProg, mode: gl.LINES });
    edgeMesh.setParent(scene);

    function resize() {
      const w = host!.clientWidth;
      const h = host!.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let raf = 0;
    function frame() {
      if (!motionReduced) scene.rotation.y += 0.0016; // gentle auto-spin
      nodeProg.uniforms.uActive.value = activeRef.current;
      controls.update();
      renderer.render({ scene, camera });
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.remove();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, [motionReduced]);

  if (typeof window !== "undefined" && !webglSupported()) {
    return null; // parent falls back to the DOM list
  }

  return (
    <div
      ref={hostRef}
      style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "none" }}
      aria-hidden
    />
  );
}
