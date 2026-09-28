"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const css = `
[data-glare-hover]>[data-glare]{position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:1;
background:linear-gradient(var(--glare-angle),transparent calc(50% - var(--glare-size)/2),var(--glare-color) 50%,transparent calc(50% + var(--glare-size)/2));
background-size:250% 250%;background-repeat:no-repeat;background-position:100% 100%;
transition:background-position var(--glare-duration) cubic-bezier(.3,.7,.3,1)}
[data-glare-hover]:hover>[data-glare],[data-glare-hover]:focus-within>[data-glare]{background-position:0 0}
[data-glare-once]:not(:hover):not(:focus-within)>[data-glare]{transition:none}
@media (prefers-reduced-motion: reduce){[data-glare-hover]>[data-glare]{transition:none}}
`;

export interface GlareHoverProps {
  children: ReactNode;
  /** Angle of the glare band in degrees. */
  angle?: number;
  color?: string;
  /** Peak opacity of the glare, 0–1. */
  opacity?: number;
  /** Band width, % of the sweep. */
  size?: number;
  /** Ms for one sweep. */
  duration?: number;
  /** Sweep only on enter; skip the return sweep on leave. */
  playOnce?: boolean;
  className?: string;
}

export function GlareHover({
  children,
  angle = -45,
  color = "#ffffff",
  opacity = 0.5,
  size = 20,
  duration = 800,
  playOnce = false,
  className,
}: GlareHoverProps) {
  return (
    <div
      data-glare-hover=""
      data-glare-once={playOnce ? "" : undefined}
      className={cn("relative inline-block overflow-hidden", className)}
      style={
        {
          "--glare-angle": `${angle}deg`,
          "--glare-color": `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`,
          "--glare-size": `${size}%`,
          "--glare-duration": `${duration}ms`,
        } as CSSProperties
      }
    >
      <style href="glare-hover" precedence="default">
        {css}
      </style>
      {children}
      <div data-glare="" aria-hidden />
    </div>
  );
}
