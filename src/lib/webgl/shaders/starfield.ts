/* GPU starfield — fragment shader (GLSL ES 1.0).

   A procedural deep-space sky: a drifting nebula + three parallax
   star layers that twinkle and scroll at different speeds for depth.
   Opaque (alpha 1) — a full replacement for the 2D desktop sky when
   the starfieldWebgl experiment is on.

   Palette matches the existing dark-navy desktop with faint cyan /
   violet nebula so it doesn't fight the OS chrome. */

export const STARFIELD_FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Smooth value noise.
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

// One star layer: a star per grid cell (some cells empty), twinkling.
float starLayer(vec2 uv, float density, float t) {
  vec2 g = uv * density;
  vec2 id = floor(g);
  vec2 gv = fract(g) - 0.5;
  float n = hash21(id);
  if (n < 0.74) return 0.0;                 // sparse — most cells empty
  vec2 off = (vec2(hash21(id + 1.7), hash21(id + 4.1)) - 0.5) * 0.7;
  float d = length(gv - off);
  float core = smoothstep(0.06, 0.0, d);
  float halo = smoothstep(0.22, 0.0, d) * 0.25;
  float tw = 0.55 + 0.45 * sin(t * 2.5 + n * 40.0);
  return (core + halo) * tw;
}

void main() {
  // aspect-correct, centred coords
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time;

  // Deep-space base.
  vec3 col = vec3(0.012, 0.02, 0.04);

  // Drifting nebula in cyan / violet.
  float n = fbm(uv * 1.6 + vec2(t * 0.01, t * 0.006));
  n = smoothstep(0.35, 1.0, n);
  col += mix(vec3(0.02, 0.05, 0.10), vec3(0.06, 0.01, 0.10), fbm(uv * 0.8)) * n * 0.7;

  // Three parallax star layers (closer = faster drift + bigger).
  vec2 drift = vec2(t * 0.004, t * 0.0016);
  float s = 0.0;
  s += starLayer(uv + drift * 1.0, 7.0, t) * 0.7;
  s += starLayer(uv + drift * 2.2, 13.0, t * 1.3) * 0.9;
  s += starLayer(uv + drift * 4.0, 22.0, t * 0.9) * 1.0;
  col += vec3(0.85, 0.92, 1.0) * s;

  // A few brighter accent stars tinted with OS hues.
  float a1 = starLayer(uv + drift * 1.5 + 10.0, 5.0, t * 0.7);
  col += vec3(0.3, 0.8, 1.0) * a1 * 0.8;     // cyan
  float a2 = starLayer(uv - drift * 1.5 + 30.0, 6.0, t * 0.9);
  col += vec3(1.0, 0.7, 0.2) * a2 * 0.6;     // amber

  // Gentle vignette to settle the edges.
  col *= smoothstep(1.5, 0.3, length(uv));

  gl_FragColor = vec4(col, 1.0);
}
`;
