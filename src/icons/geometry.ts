// Path builders for the 24×24 grid. Everything returns SVG path data.

type P = [number, number];

const n = (v: number) => String(Math.round(v * 100) / 100);
const pt = ([x, y]: P) => `${n(x)} ${n(y)}`;

/** Circle as two arcs. */
export const circle = (cx: number, cy: number, r: number) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

/** Rounded rectangle. */
export function rect(x: number, y: number, w: number, h: number, r = 0) {
  r = Math.min(r, w / 2, h / 2);
  const a = (dx: number, dy: number) => (r ? `a${n(r)} ${n(r)} 0 0 1 ${n(dx)} ${n(dy)}` : "");
  return `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}${a(r, r)}v${n(h - 2 * r)}${a(-r, r)}h${n(2 * r - w)}${a(-r, -r)}v${n(2 * r - h)}${a(r, -r)}Z`;
}

/** A point drawn by a round stroke cap. */
export const dot = (x: number, y: number) => `M${n(x)} ${n(y)}h.01`;

/** Closed polygon with every corner softened by a quadratic curve of radius r: the set's signature soft corner. */
export function poly(points: P[], r = 1.5) {
  const len = points.length;
  const cut = (from: P, to: P): P => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const t = Math.min(r / Math.hypot(dx, dy), 0.5);
    return [from[0] + dx * t, from[1] + dy * t];
  };
  const corners = points.map((p, i) => ({ p, a: cut(p, points[(i - 1 + len) % len]), b: cut(p, points[(i + 1) % len]) }));
  return `M${pt(corners[len - 1].b)}` + corners.map((c) => `L${pt(c.a)}Q${pt(c.p)} ${pt(c.b)}`).join("") + "Z";
}

/** Regular star or polygon with alternating radii, first point straight up. */
export function star(cx: number, cy: number, outer: number, inner: number, points: number, r = 1) {
  const pts: P[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const rad = i % 2 ? inner : outer;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return poly(pts, r);
}

/** Cog with trapezoid teeth. */
export function gear(cx: number, cy: number, outer: number, inner: number, teeth: number, r = 0.7) {
  const pts: P[] = [];
  const step = (2 * Math.PI) / teeth;
  const at = (a: number, rad: number): P => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    pts.push(at(a - step * 0.3, inner), at(a - step * 0.16, outer), at(a + step * 0.16, outer), at(a + step * 0.3, inner));
  }
  return poly(pts, r);
}

/** Four-point sparkle with gently pinched sides. */
export function sparkle(cx: number, cy: number, R: number) {
  const k = R * 0.16;
  return (
    `M${n(cx)} ${n(cy - R)}` +
    `Q${n(cx + k)} ${n(cy - k)} ${n(cx + R)} ${n(cy)}` +
    `Q${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + R)}` +
    `Q${n(cx - k)} ${n(cy + k)} ${n(cx - R)} ${n(cy)}` +
    `Q${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - R)}Z`
  );
}
