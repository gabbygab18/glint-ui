"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface GlassSurfaceProps {
  children?: ReactNode;
  /** Corner radius in px. */
  radius?: number;
  /** Width of the refracting rim in px. */
  bezel?: number;
  /** Strength of the rim refraction in px. */
  refraction?: number;
  /** Px of chromatic split at the rim. */
  aberration?: number;
  /** Backdrop blur in px. */
  blur?: number;
  /** Backdrop saturation multiplier. */
  saturation?: number;
  /** Opacity of the white tint, 0 to 1. */
  tint?: number;
  className?: string;
}

/**
 * Displacement map for a rounded rectangle: neutral gray inside, and along a
 * `bezel`-wide rim a vector pointing inward, strongest right at the edge.
 * Rendered at half resolution; the filter stretches it back up.
 */
function rimMap(w: number, h: number, radius: number, bezel: number) {
  const s = 0.5;
  const cw = Math.max(1, Math.round(w * s));
  const ch = Math.max(1, Math.round(h * s));
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(cw, ch);
  const hx = w / 2;
  const hy = h / 2;
  const r = Math.min(radius, hx, hy);
  // Signed distance to the rounded box (negative inside).
  const sdf = (x: number, y: number) => {
    const qx = Math.abs(x - hx) - (hx - r);
    const qy = Math.abs(y - hy) - (hy - r);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const x = (i + 0.5) / s;
      const y = (j + 0.5) / s;
      const depth = -sdf(x, y);
      let dx = 0;
      let dy = 0;
      if (depth < bezel) {
        const t = 1 - Math.max(depth, 0) / bezel;
        // Circular bevel profile: flat inside, steep at the very edge.
        const k = 1 - Math.sqrt(1 - t * t);
        const nx = sdf(x + 1, y) - sdf(x - 1, y);
        const ny = sdf(x, y + 1) - sdf(x, y - 1);
        const len = Math.hypot(nx, ny) || 1;
        dx = (-nx / len) * k;
        dy = (-ny / len) * k;
      }
      const p = (j * cw + i) * 4;
      img.data[p] = 128 + dx * 127;
      img.data[p + 1] = 128 + dy * 127;
      img.data[p + 2] = 128;
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

const channel = (r: number, g: number, b: number) => `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;

export function GlassSurface({
  children,
  radius = 28,
  bezel = 26,
  refraction = 70,
  aberration = 3,
  blur = 2,
  saturation = 1.6,
  tint = 0.06,
  className,
}: GlassSurfaceProps) {
  const [measureRef, { width, height }] = useMeasure();
  const surface = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGFEImageElement>(null);
  const id = `glass-surface-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    if (!width || !height) return;
    const el = surface.current!;
    // SVG filters inside backdrop-filter only work in Chromium; elsewhere we
    // fall back to plain frosted glass instead of losing the backdrop entirely.
    const chromium = /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent) && !/Firefox\//.test(navigator.userAgent);
    const base = `blur(${blur}px) saturate(${saturation})`;
    const apply = (v: string) => {
      el.style.setProperty("backdrop-filter", v);
      el.style.setProperty("-webkit-backdrop-filter", v);
    };
    if (!chromium) return apply(`blur(${Math.max(blur, 10)}px) saturate(${saturation})`);
    apply(base);
    // Chromium caches the backdrop filter, so attach it only once the map image
    // has decoded, and re-attach whenever the filter changes.
    const url = rimMap(width, height, radius, bezel);
    const img = new Image();
    let alive = true;
    img.onload = () => {
      if (!alive) return;
      mapRef.current?.setAttribute("href", url);
      requestAnimationFrame(() => alive && apply(`url(#${id}) ${base}`));
    };
    img.src = url;
    return () => {
      alive = false;
    };
  }, [id, width, height, radius, bezel, refraction, aberration, blur, saturation]);

  return (
    <div
      ref={(el) => {
        surface.current = el;
        measureRef(el);
      }}
      className={cn("relative isolate", className)}
      style={{
        borderRadius: radius,
        background: `rgba(255,255,255,${tint})`,
        boxShadow: [
          "inset 1.5px 1.5px 0 -0.5px rgba(255,255,255,.65)",
          "inset -1px -1px 0 -0.5px rgba(255,255,255,.35)",
          "inset 0 0 18px rgba(255,255,255,.12)",
          "0 18px 50px -12px rgba(0,0,0,.45)",
        ].join(","),
      }}
    >
      {/* soft specular sheen across the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          background: "linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(255,255,255,.08))",
        }}
      />
      <div className="relative">{children}</div>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={id} filterUnits="userSpaceOnUse" x="0" y="0" width={width} height={height} colorInterpolationFilters="sRGB">
          <feImage ref={mapRef} x="0" y="0" width={width} height={height} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction} xChannelSelector="R" yChannelSelector="G" result="dr" />
          <feColorMatrix in="dr" values={channel(1, 0, 0)} result="r" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction + aberration} xChannelSelector="R" yChannelSelector="G" result="dg" />
          <feColorMatrix in="dg" values={channel(0, 1, 0)} result="g" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={refraction + aberration * 2} xChannelSelector="R" yChannelSelector="G" result="db" />
          <feColorMatrix in="db" values={channel(0, 0, 1)} result="b" />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" />
        </filter>
      </svg>
    </div>
  );
}
