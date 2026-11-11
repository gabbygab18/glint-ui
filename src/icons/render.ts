import { ICONS, type IconDef } from "./data";

export const VARIANTS = ["line", "duo", "solid"] as const;
export type Variant = (typeof VARIANTS)[number];

export interface RenderOptions {
  variant?: Variant;
  stroke?: number;
  /** Mask id for Solid icons; must be unique per page when the same icon renders twice with different settings. */
  id?: string;
}

export const BY_NAME = new Map(ICONS.map((i) => [i.name, i]));

// A path's leading "m" is absolute only while it stands alone; once joined it would be relative to the previous
// path's end. Rewrite "m x y …" as "M x y l …" so layers can be concatenated into one d attribute.
const NUM = "-?(?:\\d+\\.?\\d*|\\.\\d+)";
const LEAD = new RegExp(`^m\\s*(${NUM})[\\s,]*(${NUM})\\s*`);
const absolute = (p: string) => p.replace(LEAD, (_, x: string, y: string, ...rest) => {
  const after = p.slice(rest[0] + _.length);
  return `M${x} ${y}${/^[-.\d]/.test(after) ? "l" : ""}`;
});
const join = (paths: string[] = []) => paths.map(absolute).join("");

/** Inner SVG markup for one icon. One code path feeds the React component, copy and download. */
export function renderInner(def: IconDef, { variant = "line", stroke = 2, id = `bi-${def.name}` }: RenderOptions = {}) {
  const sw = `stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  const S = join(def.s);
  const L = join(def.l);
  const K = join(def.k);

  if (variant === "solid" && S) {
    const lines = L ? `<path d="${L}" fill="none" stroke="currentColor" ${sw}/>` : "";
    const fill = `<path d="${S}" fill="currentColor" stroke="currentColor" ${sw}/>${lines}`;
    if (!K) return fill;
    return (
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">` +
      `<rect width="24" height="24" fill="#fff"/><path d="${K}" fill="none" stroke="#000" ${sw}/></mask>` +
      `<g mask="url(#${id})">${fill}</g>`
    );
  }

  const tint = variant === "duo" && S ? `<path d="${S}" fill="currentColor" opacity=".22"/>` : "";
  return `${tint}<path d="${S + L + K}" fill="none" stroke="currentColor" ${sw}/>`;
}

export function toSvg(def: IconDef, opts: RenderOptions & { size?: number; color?: string } = {}) {
  const { size = 24, color } = opts;
  let inner = renderInner(def, opts);
  if (color) inner = inner.replaceAll("currentColor", color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${inner}</svg>`;
}

export const pascal = (name: string) => name.replace(/(^|-)(\w)/g, (_, __, ch: string) => ch.toUpperCase());

/** A self-contained React component for one icon. */
export function toJsx(def: IconDef, opts: RenderOptions & { color?: string } = {}) {
  const inner = renderInner(def, { ...opts, id: `${def.name}-cut` })
    .replace(/ (stroke|fill)-(\w)(\w+)=/g, (_, a: string, b: string, rest: string) => ` ${a}${b.toUpperCase()}${rest}=`)
    .replaceAll("currentColor", opts.color ?? "currentColor")
    .replace(/></g, ">\n      <");
  return `export function ${pascal(def.name)}Icon({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
      ${inner}
    </svg>
  );
}`;
}

/** Every icon as <symbol>s in one file, used as <svg><use href="sprite.svg#home"/></svg>. */
export function toSprite(opts: RenderOptions = {}) {
  const symbols = ICONS.map((d) => `<symbol id="${d.name}" viewBox="0 0 24 24">${renderInner(d, { ...opts, id: `${d.name}-cut` })}</symbol>`);
  return `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`;
}
