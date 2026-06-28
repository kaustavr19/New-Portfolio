/* CRT phosphor overlay — fragment shader (GLSL ES 1.0).

   Additive overlay (can't sample the DOM): sells the "old monitor"
   look with the artifacts a real CRT adds on top — scanlines,
   vignette, edge chromatic fringe, grain, flicker, and an
   occasional slow roll-bar that sweeps down the screen.

   Tunables live up top as #defines so intensity is easy to dial. */

export const CRT_FRAGMENT = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

// ── Intensity knobs ─────────────────────────────────────────
#define SCAN_STRENGTH   0.26   // horizontal scanline darkening
#define VIGNETTE        0.52   // corner falloff
#define GRAIN           0.07   // animated noise
#define FLICKER         0.018  // global brightness flutter
#define FRINGE          0.09   // edge chromatic aberration
// Roll-bar (the occasional sweeping band)
#define ROLL_PERIOD     8.0    // seconds between possible rolls
#define ROLL_CHANCE     0.50   // fraction of windows that actually roll
#define ROLL_DURATION   1.7    // seconds for one sweep top→bottom
#define ROLL_WIDTH      0.07   // band thickness (uv)
#define ROLL_BRIGHT     0.22   // how much the band lightens

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 c  = uv - 0.5;

  // Scanlines — fine rows, slowly drifting.
  float scan = sin((gl_FragCoord.y * 1.6) - u_time * 1.8) * 0.5 + 0.5;
  float scanDark = scan * SCAN_STRENGTH;

  // Vignette — darker toward the corners.
  float vig = smoothstep(0.88, 0.28, length(c * vec2(1.0, 1.12)));
  float vigDark = (1.0 - vig) * VIGNETTE;

  // Edge chromatic fringe — faint magenta toward left/right edges.
  float edge = smoothstep(0.40, 0.50, abs(c.x));
  vec3 fringe = vec3(0.06, 0.0, 0.07) * edge * (FRINGE / 0.09);

  // Animated grain.
  float g = hash(uv * u_res * 0.5 + fract(u_time)) - 0.5;
  float grain = g * GRAIN;

  // Slow brightness flutter.
  float flick = (sin(u_time * 8.0) * 0.5 + 0.5) * FLICKER;

  // ── Occasional roll-bar ──────────────────────────────────
  // Each ROLL_PERIOD window, a per-window hash decides whether a
  // band sweeps top→bottom over ROLL_DURATION seconds. Sparse.
  float cyc   = floor(u_time / ROLL_PERIOD);
  float local = u_time - cyc * ROLL_PERIOD;
  float active = step(1.0 - ROLL_CHANCE, hash(vec2(cyc, 3.17)));
  float p = local / ROLL_DURATION;                 // 0..1 during the sweep
  float inSweep = step(0.0, p) * step(p, 1.0);
  float by = 1.0 - p;                               // band centre, top→bottom
  float band = smoothstep(ROLL_WIDTH, 0.0, abs(uv.y - by));
  // soft bright leading edge
  band += smoothstep(ROLL_WIDTH * 0.35, 0.0, abs(uv.y - by - 0.012)) * 0.6;
  band *= active * inSweep;

  float dark = clamp(scanDark + vigDark + flick, 0.0, 0.62);
  // The band lightens its area: less darkening there + a white lift.
  dark = mix(dark, dark * 0.25, clamp(band, 0.0, 1.0));

  vec3 tint = vec3(0.0, 0.02, 0.028) * scan + fringe + vec3(grain);
  tint += vec3(0.55, 0.6, 0.7) * band * ROLL_BRIGHT;

  float a = clamp(dark + band * 0.10, 0.0, 0.7);
  gl_FragColor = vec4(tint, a);
}
`;
