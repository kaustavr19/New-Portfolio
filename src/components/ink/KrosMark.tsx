/* The KR//OS monogram — one path, drawn in currentColor. Hook-free so it
   renders on the server pages, in OG images and in the OS. */

export const KROS_MARK_PATH =
  "M157.439 48.4248H26.0915L13.7002 29.8222L26.0915 13.7H204.526L216.918 21.141V37.2633L137.613 114.154L157.439 132.757L275.157 13.7L298.7 16.1803V37.2633L182.222 156.32L298.7 271.656V292.739L272.678 296.46L157.439 179.883L43.4393 292.739L29.8089 297.7L17.4176 287.779V109.193L31.048 95.5515L47.1567 109.193V241.892L133.896 156.32L104.157 125.316L97.9611 114.154L101.678 104.233L157.439 48.4248Z";

/* Tight bounds of the path (its own coordinate space). */
export const KROS_MARK_BOX = { x: 13.7, y: 13.7, w: 285, h: 284 };

export default function KrosMark({ size = 24, color = "currentColor", title }: { size?: number; color?: string; title?: string }) {
  const { x, y, w, h } = KROS_MARK_BOX;
  return (
    <svg width={size} height={size} viewBox={`${x} ${y} ${w} ${h}`} fill={color} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={KROS_MARK_PATH} />
    </svg>
  );
}
