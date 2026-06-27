/* ──────────────────────────────────────────────────────────
   Minimal full-screen fragment-shader runner. No dependencies.

   Shared foundation for the WebGL experiments: compiles a single
   fullscreen triangle + your fragment shader, feeds it `u_res`
   and `u_time`, and drives an optional RAF loop. Designed to be
   created once, started, and destroyed cleanly on unmount.

   Keep it lean — this is ~1.5kb, not Three.js.
   ────────────────────────────────────────────────────────── */

export type ShaderQuad = {
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

/** Cheap capability probe — used by effects to bail to the DOM fallback. */
export function webglSupported(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[webgl] shader compile failed:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function createShaderQuad(opts: {
  canvas: HTMLCanvasElement;
  fragment: string;
  /** Animate via RAF (true) or render a single static frame (false). */
  animate?: boolean;
  /** Device-pixel-ratio cap — overlays rarely need full retina. */
  dprCap?: number;
}): ShaderQuad | null {
  const { canvas, fragment, animate = true, dprCap = 1.5 } = opts;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    // Keep the buffer between composites so a frame is stable to read
    // (predictable blending; also lets headless capture see the output).
    preserveDrawingBuffer: true,
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[webgl] program link failed:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  // Fullscreen triangle (covers clip space with one tri, no index buffer).
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uTime = gl.getUniformLocation(prog, "u_time");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl!.viewport(0, 0, w, h);
  }

  let raf = 0;
  let running = false;
  const t0 = performance.now();

  function render(now: number) {
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    if (uRes) gl!.uniform2f(uRes, canvas.width, canvas.height);
    if (uTime) gl!.uniform1f(uTime, (now - t0) / 1000);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function loop(now: number) {
    if (!running) return;
    render(now);
    raf = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    start() {
      if (running) return;
      if (animate) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else {
        render(t0); // single static frame
      }
    },
    stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    destroy() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // NB: intentionally NOT calling WEBGL_lose_context here. Under React
      // StrictMode (dev) the effect mounts → cleans up → mounts again on the
      // SAME canvas; losing the context would poison the second mount. The
      // context is released when the canvas element unmounts anyway.
    },
  };
}
