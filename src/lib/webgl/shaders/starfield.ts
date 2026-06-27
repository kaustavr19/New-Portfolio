/* GPU starfield — fragment shader (GLSL ES 1.0).

   A procedural deep-space sky, art-directed with hero objects:
     · sparse parallax star layers + drifting nebula clouds
     · a few shaded planets (one ringed, Saturn-style)
     · a gravitational-lensing black hole that warps the background
       stars/nebula around it (event horizon + photon ring + disc)

   Prominent but restrained — it stays a backdrop behind the OS chrome.
   Opaque (alpha 1); replaces the 2D desktop sky when starfieldWebgl is on. */

export const STARFIELD_FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

const vec2 LIGHT = vec2(-0.55, 0.45); // global "sun" direction for planets

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

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
  for (int i = 0; i < 4; i++) { v += amp * vnoise(p); p *= 2.0; amp *= 0.5; }
  return v;
}

// Sparse star layer — most cells empty, occasional twinkling star.
float starLayer(vec2 uv, float density, float t) {
  vec2 g = uv * density;
  vec2 id = floor(g);
  vec2 gv = fract(g) - 0.5;
  float n = hash21(id);
  if (n < 0.86) return 0.0;                 // sparser than before
  vec2 off = (vec2(hash21(id + 1.7), hash21(id + 4.1)) - 0.5) * 0.7;
  float d = length(gv - off);
  float core = smoothstep(0.055, 0.0, d);
  float halo = smoothstep(0.20, 0.0, d) * 0.22;
  float tw = 0.55 + 0.45 * sin(t * 2.5 + n * 40.0);
  return (core + halo) * tw;
}

// A soft, fbm-textured nebula cloud.
vec3 nebula(vec2 uv, vec2 c, float r, vec3 col, float t) {
  float fall = exp(-dot((uv - c) / r, (uv - c) / r));
  float tex = fbm((uv - c) * 3.0 + vec2(t * 0.01, -t * 0.006));
  return col * fall * (0.35 + 0.65 * tex);
}

// Background sky — the part that gets gravitationally lensed.
vec3 scene(vec2 uv, float t) {
  vec3 col = vec3(0.012, 0.02, 0.04);

  // Restrained nebula clouds (Orion-pink, Carina-orange, Helix-teal).
  col += nebula(uv, vec2(-0.50, 0.12), 0.42, vec3(0.55, 0.18, 0.42), t) * 0.55;
  col += nebula(uv, vec2(0.55, -0.20), 0.40, vec3(0.55, 0.30, 0.12), t) * 0.5;
  col += nebula(uv, vec2(0.12, 0.40), 0.30, vec3(0.10, 0.40, 0.34), t) * 0.45;

  // Sparse parallax stars.
  vec2 drift = vec2(t * 0.004, t * 0.0016);
  float s = 0.0;
  s += starLayer(uv + drift * 1.0, 5.0, t) * 0.8;
  s += starLayer(uv + drift * 2.4, 9.0, t * 1.3) * 1.0;
  col += vec3(0.85, 0.92, 1.0) * s;

  // A few tinted accent stars.
  col += vec3(0.3, 0.8, 1.0) * starLayer(uv + drift * 1.6 + 10.0, 4.0, t * 0.7) * 0.8;
  col += vec3(1.0, 0.7, 0.2) * starLayer(uv - drift * 1.6 + 30.0, 4.5, t * 0.9) * 0.6;

  return col;
}

// Shaded planet disc. Returns colour; writes coverage to mask.
vec3 planet(vec2 uv, vec2 c, float R, vec3 base, out float mask) {
  vec2 p = (uv - c) / R;
  float d2 = dot(p, p);
  mask = smoothstep(1.0, 0.93, d2);
  if (d2 > 1.0) { return vec3(0.0); }
  float z = sqrt(max(1.0 - d2, 0.0));
  vec3 nrm = vec3(p, z);
  float lam = max(dot(nrm, vec3(LIGHT, 0.55)), 0.0);
  vec3 col = base * (0.16 + 0.95 * lam);
  col += base * 0.35 * pow(1.0 - z, 3.0);   // rim light
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time;

  // ── Black hole (drifts slowly), with gravitational lensing ──
  vec2 bh = vec2(-0.46, 0.08) + vec2(sin(t * 0.05) * 0.01, cos(t * 0.04) * 0.008);
  float R = 0.052;                          // event-horizon radius
  vec2 toBh = uv - bh;
  float r = length(toBh);
  vec2 dir = toBh / max(r, 1e-4);
  float bend = (R * R * 1.6) / max(r, 0.012);   // light deflection
  vec2 luv = uv - dir * bend;                    // sample the warped background

  vec3 col = scene(luv, t);

  // Event horizon — pure black core with a soft edge.
  float horizon = smoothstep(R, R * 0.92, r);
  col *= (1.0 - horizon);

  // Accretion disc — glowing swirling band just outside the ring.
  float ang = atan(toBh.y, toBh.x);
  float band = smoothstep(R * 2.6, R * 1.18, r) * smoothstep(R * 1.05, R * 1.2, r);
  float swirl = 0.55 + 0.45 * sin(ang * 3.0 - t * 2.2 + r * 26.0);
  vec3 discCol = mix(vec3(1.0, 0.55, 0.15), vec3(1.0, 0.95, 0.8), swirl);
  col += discCol * band * swirl * 1.1;

  // Photon ring — thin bright circle at the horizon edge.
  float ring = smoothstep(0.012, 0.0, abs(r - R * 1.12));
  col += vec3(1.0, 0.88, 0.65) * ring * 1.6;

  // ── Planets (foreground, not lensed) ──
  float m;
  vec3 pc;

  // Saturn (ringed).
  vec2 satC = vec2(0.60, 0.26) + vec2(sin(t * 0.03) * 0.006, 0.0);
  // ring first (behind upper half), squashed ellipse
  vec2 rp = (uv - satC) * vec2(1.0, 2.6);
  float rr = length(rp);
  float satRing = smoothstep(0.018, 0.0, abs(rr - 0.135)) * 0.55;
  col += vec3(0.85, 0.78, 0.55) * satRing;
  pc = planet(uv, satC, 0.07, vec3(0.96, 0.85, 0.47), m);
  col = mix(col, pc, m);

  // Neptune (small, blue).
  pc = planet(uv, vec2(0.50, -0.34), 0.045, vec3(0.25, 0.45, 0.85), m);
  col = mix(col, pc, m);

  // Mars (tiny, red).
  pc = planet(uv, vec2(0.30, 0.40), 0.030, vec3(0.78, 0.35, 0.22), m);
  col = mix(col, pc, m);

  // Settle the edges.
  col *= smoothstep(1.55, 0.35, length(uv));

  gl_FragColor = vec4(col, 1.0);
}
`;
