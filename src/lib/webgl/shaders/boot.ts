/* Boot backdrop — fragment shader (GLSL ES 1.0).

   A synthwave-style infinite grid receding to a glowing horizon,
   tinted across the OS accent palette. Opaque (alpha 1) — it's a
   full-screen background that the boot loader sits on top of.

   This is the Phase-3 "WebGL boot moment" prototype: heavy, but it
   only ever runs during the one-time cold boot. */

export const BOOT_FRAGMENT = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / u_res.y;

  // Base sky gradient.
  vec3 col = mix(vec3(0.03, 0.01, 0.06), vec3(0.0, 0.03, 0.08), uv.y);

  // Horizon glow band at p.y = 0.
  float hor = exp(-abs(p.y) * 7.0);
  col += mix(vec3(0.0, 0.7, 1.0), vec3(1.0, 0.1, 0.6), uv.x) * hor * 0.45;

  // Receding floor grid (below the horizon).
  if (p.y < 0.0) {
    float d = -p.y;                       // distance below horizon
    float z = 0.16 / d;                   // perspective depth
    float wx = p.x * z * 6.0;
    float wz = z * 6.0 + u_time * 2.2;    // scroll toward viewer
    vec2 gr = abs(fract(vec2(wx, wz)) - 0.5);
    float lines = max(smoothstep(0.06, 0.0, gr.x), smoothstep(0.06, 0.0, gr.y));
    float fade = smoothstep(0.0, 0.45, d) * exp(-z * 0.45);
    col += mix(vec3(0.0, 0.85, 1.0), vec3(1.0, 0.15, 0.7), uv.x) * lines * fade * 1.2;
  }

  // A few drifting stars above the horizon.
  if (p.y > 0.0) {
    vec2 sp = floor(uv * vec2(60.0, 40.0));
    float s = fract(sin(dot(sp, vec2(41.3, 289.1))) * 9123.7);
    float tw = step(0.985, s) * (0.6 + 0.4 * sin(u_time * 3.0 + s * 30.0));
    col += vec3(0.8, 0.9, 1.0) * tw * smoothstep(0.0, 0.6, p.y);
  }

  // Scanlines + vignette to match the OS CRT vibe.
  float scan = sin(gl_FragCoord.y * 1.5) * 0.5 + 0.5;
  col *= 0.86 + 0.14 * scan;
  col *= smoothstep(1.5, 0.25, length(p));

  gl_FragColor = vec4(col, 1.0);
}
`;
