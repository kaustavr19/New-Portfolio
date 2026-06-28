/* GPU starfield — fragment shader (GLSL ES 1.0).

   Deep-space sky with art-directed hero objects:
     · sparse parallax stars + restrained drifting nebulae
     · procedurally-textured solar-system planets (Earth, Mars,
       Jupiter w/ red spot, ringed Saturn), lit with a terminator
     · an Interstellar "Gargantua"-style black hole: a flat accretion
       disc whose lensed far side arcs up and over the shadow, plus a
       photon ring, Doppler-brightened, and background light bending.

   Opaque (alpha 1); replaces the 2D desktop sky when starfieldWebgl is on. */

export const STARFIELD_FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

const vec3 LIGHT = normalize(vec3(-0.55, 0.42, 0.72)); // global sun

float sq(float x) { return x * x; }

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

float starLayer(vec2 uv, float density, float t) {
  vec2 g = uv * density;
  vec2 id = floor(g);
  vec2 gv = fract(g) - 0.5;
  float n = hash21(id);
  if (n < 0.86) return 0.0;
  vec2 off = (vec2(hash21(id + 1.7), hash21(id + 4.1)) - 0.5) * 0.7;
  float d = length(gv - off);
  float core = smoothstep(0.055, 0.0, d);
  float halo = smoothstep(0.20, 0.0, d) * 0.22;
  float tw = 0.55 + 0.45 * sin(t * 2.5 + n * 40.0);
  return (core + halo) * tw;
}

vec3 nebula(vec2 uv, vec2 c, float r, vec3 col, float t) {
  float fall = exp(-dot((uv - c) / r, (uv - c) / r));
  float tex = fbm((uv - c) * 3.0 + vec2(t * 0.01, -t * 0.006));
  return col * fall * (0.35 + 0.65 * tex);
}

/* ── Procedural planet surfaces (sampled in lon/lat) ── */
vec3 earthTex(float lon, float lat, float t) {
  vec2 uv = vec2(lon * 0.5, lat);
  float land = fbm(uv * 2.6 + 3.0);
  float isLand = smoothstep(0.50, 0.57, land);
  vec3 ocean = vec3(0.03, 0.14, 0.34);
  float veg = fbm(uv * 4.5 + 10.0);
  vec3 landCol = mix(vec3(0.14, 0.34, 0.12), vec3(0.45, 0.38, 0.22), veg);
  vec3 surf = mix(ocean, landCol, isLand);
  float ice = smoothstep(1.15, 1.4, abs(lat));      // polar caps
  surf = mix(surf, vec3(0.92, 0.96, 1.0), ice);
  float cl = smoothstep(0.55, 0.78, fbm(uv * 3.0 + vec2(t * 0.02, 0.0)));
  surf = mix(surf, vec3(1.0), cl * 0.55);            // clouds
  return surf;
}

vec3 marsTex(float lon, float lat) {
  vec2 uv = vec2(lon * 0.5, lat);
  float n = fbm(uv * 3.2 + 5.0);
  vec3 c = mix(vec3(0.50, 0.22, 0.12), vec3(0.72, 0.40, 0.24), n);
  c = mix(c, vec3(0.35, 0.15, 0.10), smoothstep(0.6, 0.75, fbm(uv * 6.0))); // maria
  float ice = smoothstep(1.3, 1.45, abs(lat));
  c = mix(c, vec3(0.9, 0.9, 0.95), ice);
  return c;
}

vec3 jupiterTex(float lon, float lat, float t) {
  float band = sin(lat * 13.0 + fbm(vec2(lon, lat * 6.0)) * 2.2);
  vec3 c = mix(vec3(0.80, 0.66, 0.46), vec3(0.60, 0.42, 0.28), 0.5 + 0.5 * band);
  c *= 0.86 + 0.14 * fbm(vec2(lon * 3.0 + t * 0.05, lat * 9.0));   // turbulence
  vec2 spot = vec2(lon + 0.8, lat + 0.32);                          // great red spot
  float rs = exp(-dot(spot * vec2(2.2, 4.5), spot * vec2(2.2, 4.5)) * 5.0);
  c = mix(c, vec3(0.72, 0.26, 0.16), rs * 0.85);
  return c;
}

vec3 saturnTex(float lat) {
  float band = sin(lat * 11.0);
  return mix(vec3(0.86, 0.78, 0.55), vec3(0.72, 0.63, 0.42), 0.5 + 0.5 * band);
}

/* Render one planet as a shaded sphere. kind: 0 Earth,1 Mars,2 Jupiter,3 Saturn. */
vec3 renderPlanet(vec2 uv, vec2 c, float R, float spin, int kind, float t, out float mask) {
  vec2 p = (uv - c) / R;
  float d2 = dot(p, p);
  mask = smoothstep(1.0, 0.94, d2);
  if (d2 > 1.0) return vec3(0.0);
  float z = sqrt(max(1.0 - d2, 0.0));
  vec3 n = vec3(p.x, p.y, z);
  float lon = atan(n.x, n.z) + spin;
  float lat = asin(clamp(n.y, -1.0, 1.0));
  vec3 albedo;
  if (kind == 0) albedo = earthTex(lon, lat, t);
  else if (kind == 1) albedo = marsTex(lon, lat);
  else if (kind == 2) albedo = jupiterTex(lon, lat, t);
  else albedo = saturnTex(lat);
  float lam = max(dot(n, LIGHT), 0.0);
  vec3 col = albedo * (0.07 + 0.98 * lam);            // ambient + diffuse
  col += vec3(0.4, 0.6, 1.0) * 0.12 * pow(1.0 - z, 3.0) * lam; // atmospheric rim
  return col;
}

/* Background sky — the part that gets gravitationally lensed. */
vec3 scene(vec2 uv, float t) {
  vec3 col = vec3(0.012, 0.02, 0.04);
  col += nebula(uv, vec2(-0.50, 0.12), 0.42, vec3(0.55, 0.18, 0.42), t) * 0.55;
  col += nebula(uv, vec2(0.55, -0.20), 0.40, vec3(0.55, 0.30, 0.12), t) * 0.50;
  col += nebula(uv, vec2(0.12, 0.40), 0.30, vec3(0.10, 0.40, 0.34), t) * 0.45;
  vec2 drift = vec2(t * 0.004, t * 0.0016);
  float s = 0.0;
  s += starLayer(uv + drift * 1.0, 5.0, t) * 0.8;
  s += starLayer(uv + drift * 2.4, 9.0, t * 1.3) * 1.0;
  col += vec3(0.85, 0.92, 1.0) * s;
  col += vec3(0.3, 0.8, 1.0) * starLayer(uv + drift * 1.6 + 10.0, 4.0, t * 0.7) * 0.8;
  col += vec3(1.0, 0.7, 0.2) * starLayer(uv - drift * 1.6 + 30.0, 4.5, t * 0.9) * 0.6;
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time;

  // ── Black hole (Gargantua) with background lensing ──
  vec2 bh = vec2(-0.46, 0.06) + vec2(sin(t * 0.05) * 0.008, cos(t * 0.04) * 0.006);
  float R = 0.05;
  vec2 q = uv - bh;
  float r = length(q);
  vec2 dir = q / max(r, 1e-4);
  float bend = (R * R * 1.7) / max(r, 0.012);
  vec3 col = scene(uv - dir * bend, t);            // lensed background

  // Shadow + photon ring.
  float shadow = smoothstep(R, R * 0.93, r);
  col *= (1.0 - shadow);
  float pr = smoothstep(0.010, 0.0, abs(r - R * 1.05));
  col += vec3(1.0, 0.9, 0.72) * pr * 1.7;

  // Accretion disc: lensed ring (arc over/under) + flat horizontal disc.
  float ang = atan(q.y, q.x);
  float ring = exp(-sq((r - R * 1.5) / (R * 0.62)));   // lensed halo (arcs over/under)
  float horiz = exp(-sq(q.y / (R * 0.42)))
              * smoothstep(R * 3.4, R * 1.2, r) * smoothstep(R * 1.0, R * 1.25, r);
  float disc = ring * 1.25 + horiz;
  disc *= 0.82 + 0.18 * fbm(vec2(ang * 2.5, r * 22.0) + vec2(t * 0.12, 0.0)); // slow turbulence, no spokes
  disc *= 1.0 + 0.6 * clamp(-q.x / max(r, 1e-4), -1.0, 1.0);                  // Doppler beaming
  disc = max(disc, 0.0) * (1.0 - shadow);
  vec3 hot = mix(vec3(1.0, 0.96, 0.88), vec3(1.0, 0.48, 0.13), smoothstep(R * 1.1, R * 3.0, r));
  col += hot * disc * 1.25;

  // ── Planets ──
  float m; vec3 pc;

  // Jupiter (largest).
  pc = renderPlanet(uv, vec2(0.50, -0.32), 0.082, t * 0.08, 2, t, m); col = mix(col, pc, m);

  // Saturn — rings behind, then the planet.
  vec2 satC = vec2(0.62, 0.30);
  vec2 rp = (uv - satC) * vec2(1.0, 2.7);
  float rr = length(rp);
  float rings = smoothstep(0.020, 0.0, abs(rr - 0.150)) * 0.55
              + smoothstep(0.014, 0.0, abs(rr - 0.120)) * 0.40;  // outer + inner band
  col += vec3(0.82, 0.74, 0.52) * rings;
  pc = renderPlanet(uv, satC, 0.066, t * 0.05, 3, t, m); col = mix(col, pc, m);

  // Earth.
  pc = renderPlanet(uv, vec2(-0.42, -0.34), 0.052, t * 0.06, 0, t, m); col = mix(col, pc, m);

  // Mars (small).
  pc = renderPlanet(uv, vec2(0.16, 0.40), 0.034, t * 0.05, 1, t, m); col = mix(col, pc, m);

  col *= smoothstep(1.55, 0.35, length(uv));
  gl_FragColor = vec4(col, 1.0);
}
`;
