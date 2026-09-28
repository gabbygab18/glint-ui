"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface GradualBlurProps {
  /** Edge the blur is anchored to. */
  position?: "top" | "bottom" | "left" | "right";
  /** Blur in px at the very edge. */
  strength?: number;
  /** Thickness of the blurred band in px. */
  height?: number;
  /** Stacked layers; more is smoother, fewer is cheaper. */
  layers?: number;
  /** Ramp the blur exponentially (natural falloff) instead of linearly. */
  exponential?: boolean;
  /** Also fade toward the background color at the edge. */
  fade?: boolean;
  className?: string;
}

export function GradualBlur({
  position = "bottom",
  strength = 12,
  height = 140,
  layers = 6,
  exponential = true,
  fade = true,
  className,
}: GradualBlurProps) {
  const vertical = position === "top" || position === "bottom";
  const n = Math.max(1, Math.round(layers));
  const dir = `to ${position}`;
  const box: CSSProperties = vertical
    ? { left: 0, right: 0, [position]: 0, height }
    : { top: 0, bottom: 0, [position]: 0, width: height };

  return (
    <div aria-hidden className={cn("pointer-events-none absolute z-10", className)} style={box}>
      {Array.from({ length: n }, (_, i) => {
        // Each layer ramps in over its own slice and stays on to the edge, so blur compounds toward it.
        const blur = exponential ? strength * 2 ** (i + 1 - n) : (strength * (i + 1)) / n;
        const from = (i / n) * 100;
        const to = ((i + 1) / n) * 100;
        const mask = `linear-gradient(${dir}, transparent ${from}%, #000 ${to}%)`;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: `blur(${blur.toFixed(2)}px)`,
              WebkitBackdropFilter: `blur(${blur.toFixed(2)}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${dir}, transparent 20%, color-mix(in oklab, var(--background) 70%, transparent))`,
          }}
        />
      )}
    </div>
  );
}
