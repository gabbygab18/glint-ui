"use client";

import type { PointerEvent, ReactNode } from "react";

export interface GlassCardProps {
  children?: ReactNode;
  /** Backdrop blur in px. */
  blur?: number;
  /** White tint of the glass, 0-1. */
  tint?: number;
  /** Film grain strength, 0-1. */
  noise?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Pointer-follow sheen and edge light. */
  highlight?: boolean;
  className?: string;
}

// Static grain tile (feTurbulence), tiled over the glass.
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const css = `
.glass-card{--gx:30%;--gy:0%;--ga:210deg;--gi:.55}
.glass-card-edge{padding:1px;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.glass-card-sheen{opacity:0;transition:opacity .5s ease}
.glass-card:hover .glass-card-sheen{opacity:1}
.glass-card:hover{--gi:1}
`;

export function GlassCard({ children, blur = 18, tint = 0.1, noise = 0.25, radius = 28, highlight = true, className }: GlassCardProps) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!highlight) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    // Edge light points from the card's center toward the pointer.
    const a = (Math.atan2(y - r.height / 2, x - r.width / 2) * 180) / Math.PI + 90;
    el.style.setProperty("--gx", `${x}px`);
    el.style.setProperty("--gy", `${y}px`);
    el.style.setProperty("--ga", `${a}deg`);
  };

  return (
    <div
      onPointerMove={onMove}
      className={`glass-card relative isolate overflow-hidden text-white ${className ?? ""}`}
      style={{
        borderRadius: radius,
        background: `linear-gradient(145deg, rgba(255,255,255,${tint * 1.6}), rgba(255,255,255,${tint * 0.4}))`,
        backdropFilter: `blur(${blur}px) saturate(1.7)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.7)`,
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,.45)",
          "inset 0 -1px 0 rgba(255,255,255,.08)",
          // Faint chromatic fringe along the sides, like light splitting in thick glass.
          "inset 1.5px 0 0 rgba(255,150,220,.18)",
          "inset -1.5px 0 0 rgba(130,210,255,.2)",
          "0 30px 60px -20px rgba(0,0,0,.45)",
          "0 10px 20px -10px rgba(0,0,0,.25)",
        ].join(","),
      }}
    >
      <style href="glass-card" precedence="default">
        {css}
      </style>
      {noise > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay"
          style={{ backgroundImage: grain, opacity: noise }}
        />
      )}
      {highlight && (
        <>
          <div
            aria-hidden
            className="glass-card-sheen pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(380px circle at var(--gx) var(--gy), rgba(255,255,255,.22), rgba(255,255,255,.06) 40%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="glass-card-edge pointer-events-none absolute inset-0"
            style={{
              borderRadius: radius,
              background:
                "conic-gradient(from var(--ga), rgba(255,255,255,var(--gi)), rgba(255,255,255,.12) 18%, rgba(255,255,255,.04) 50%, rgba(255,255,255,.12) 82%, rgba(255,255,255,var(--gi)))",
            }}
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
