/* CRT phosphor overlay — fragment shader (GLSL ES 1.0).

   This is an ADDITIVE overlay: it can't sample the DOM beneath it,
   so it sells the "old monitor" look with the artifacts a real CRT
   adds on top — scanlines, vignette, edge chromatic fringe, grain,
   and a slow flicker. Output is mostly black with a coverage alpha,
   so it darkens the content underneath via normal alpha blending.

   All intensities are deliberately restrained; bump the consts to
   taste. */

export const CRT_FRAGMENT = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 c  = uv - 0.5;

  // Scanlines — fine horizontal rows, slowly drifting.
  float scan = sin((gl_FragCoord.y * 1.5) - u_time * 1.5) * 0.5 + 0.5;
  float scanDark = scan * 0.16;

  // Vignette — darker toward the corners.
  float vig = smoothstep(0.85, 0.30, length(c * vec2(1.0, 1.1)));
  float vigDark = (1.0 - vig) * 0.38;

  // Edge chromatic fringe — faint magenta toward left/right edges.
  float edge = smoothstep(0.40, 0.50, abs(c.x));
  vec3 fringe = vec3(0.06, 0.0, 0.07) * edge;

  // Animated grain.
  float g = hash(uv * u_res * 0.5 + fract(u_time)) - 0.5;
  float grain = g * 0.05;

  // Slow brightness flutter.
  float flick = (sin(u_time * 8.0) * 0.5 + 0.5) * 0.012;

  float dark = clamp(scanDark + vigDark + flick, 0.0, 0.6);

  // Faint cyan phosphor in the lit scan rows + edge fringe + grain.
  vec3 tint = vec3(0.0, 0.018, 0.026) * scan + fringe + vec3(grain);

  gl_FragColor = vec4(tint, dark);
}
`;
