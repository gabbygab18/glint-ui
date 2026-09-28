"use client";

import type { ReactNode } from "react";

// @property makes the angle animatable. Browsers without it show a static border.
const css = `
@property --glow-border-angle{syntax:"<angle>";initial-value:0deg;inherits:false}
@keyframes glow-border-spin{to{--glow-border-angle:360deg}}
`;

export interface GlowBorderProps {
  children: ReactNode;
  color?: string;
  /** Seconds per rotation. */
  speed?: number;
  /** Border width in px. */
  thickness?: number;
  radius?: number;
  background?: string;
  className?: string;
}

export function GlowBorder({
  children,
  color = "#c6ff3d",
  speed = 4,
  thickness = 1,
  radius = 16,
  background = "#0a0a0a",
  className,
}: GlowBorderProps) {
  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        padding: thickness,
        borderRadius: radius,
        background: `conic-gradient(from var(--glow-border-angle), transparent 0 65%, ${color} 85%, transparent 100%), rgba(255,255,255,.08)`,
        animation: `glow-border-spin ${speed}s linear infinite`,
      }}
    >
      <style href="glow-border" precedence="default">
        {css}
      </style>
      <div style={{ borderRadius: radius - thickness, background, height: "100%" }}>{children}</div>
    </div>
  );
}
