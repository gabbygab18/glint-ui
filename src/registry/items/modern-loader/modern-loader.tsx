"use client";

import type { CSSProperties } from "react";

export interface ModernLoaderProps {
  /** Px. */
  size?: number;
  /** Gradient stops of the arc, tail to head. */
  colors?: string[];
  /** Ring thickness in px. */
  thickness?: number;
  /** Speed multiplier. */
  speed?: number;
  /** Announced to screen readers. */
  label?: string;
  className?: string;
}

// A conic gradient masked down to a ring (the mask follows border-radius, so the
// ring morphs with it) spins while its shape breathes between circle and squircle.
const css = `
.mldr-ring{padding:var(--t);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor}
.mldr-a{animation:mldr-spin calc(var(--d)*1.1s) linear infinite,mldr-morph calc(var(--d)*3.2s) ease-in-out infinite}
.mldr-b{animation:mldr-spin calc(var(--d)*1.6s) linear infinite reverse,mldr-morph calc(var(--d)*3.2s) ease-in-out infinite reverse}
.mldr-glow{animation:mldr-spin calc(var(--d)*4s) linear infinite,mldr-morph calc(var(--d)*3.2s) ease-in-out infinite}
.mldr-core{animation:mldr-morph calc(var(--d)*1.6s) ease-in-out infinite,mldr-breathe calc(var(--d)*1.6s) ease-in-out infinite}
@keyframes mldr-spin{to{transform:rotate(1turn)}}
@keyframes mldr-morph{0%,100%{border-radius:50%}25%{border-radius:42% 58% 55% 45%/48% 42% 58% 52%}50%{border-radius:32%}75%{border-radius:58% 42% 45% 55%/52% 58% 42% 48%}}
@keyframes mldr-breathe{0%,100%{transform:scale(.7) rotate(0)}50%{transform:scale(1) rotate(90deg)}}
@media (prefers-reduced-motion:reduce){.mldr-a,.mldr-b,.mldr-glow,.mldr-core{animation:none}}
`;

export function ModernLoader({
  size = 96,
  colors = ["#22d3ee", "#a855f7", "#f43f5e"],
  thickness = 6,
  speed = 1,
  label = "Loading",
  className,
}: ModernLoaderProps) {
  const stops = colors.length ? colors : ["currentColor"];
  const head = stops[stops.length - 1];
  const arc = `conic-gradient(from 0deg, transparent 0turn, ${stops.map((c, i) => `${c} ${0.2 + (0.8 * (i + 1)) / stops.length}turn`).join(", ")})`;
  const back = `conic-gradient(from 180deg, transparent 0turn, ${[...stops].reverse().join(", ")}, transparent)`;
  const style = { width: size, height: size, "--d": 1 / Math.max(0.1, speed), "--t": `${thickness}px` } as CSSProperties;

  return (
    <span role="status" className={`relative inline-grid shrink-0 place-items-center ${className ?? ""}`} style={style}>
      <style href="modern-loader" precedence="default">
        {css}
      </style>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="mldr-glow absolute inset-[8%] opacity-50 blur-xl" style={{ background: arc }} />
      <span aria-hidden className="mldr-ring mldr-a absolute inset-0" style={{ background: arc }} />
      <span aria-hidden className="mldr-a absolute inset-0">
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{ width: thickness, height: thickness, background: head, boxShadow: `0 0 ${thickness * 2}px ${thickness / 2}px ${head}` }}
        />
      </span>
      <span
        aria-hidden
        className="mldr-ring mldr-b absolute inset-[22%] opacity-80"
        style={{ background: back, "--t": `${Math.max(2, thickness * 0.6)}px` } as CSSProperties}
      />
      <span
        aria-hidden
        className="mldr-core absolute inset-[40%]"
        style={{ background: `linear-gradient(135deg, ${stops.join(", ")})` }}
      />
    </span>
  );
}
