"use client";

import type { CSSProperties } from "react";

const css = `@keyframes meteor-fall{0%{transform:rotate(var(--meteor-angle)) translateX(0);opacity:1}70%{opacity:1}100%{transform:rotate(var(--meteor-angle)) translateX(-900px);opacity:0}}`;

export interface MeteorsProps {
  count?: number;
  color?: string;
  /** Travel direction in degrees. */
  angle?: number;
  className?: string;
}

// Deterministic pseudo-random so server and client render the same meteors.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function Meteors({ count = 20, color = "#e4e4e7", angle = 215, className }: MeteorsProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <style href="meteors" precedence="default">
        {css}
      </style>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={
            {
              "--meteor-angle": `${angle}deg`,
              position: "absolute",
              top: `${rand(i, 1) * 40 - 10}%`,
              left: `${rand(i, 2) * 110}%`,
              width: 2,
              height: 2,
              borderRadius: 9999,
              background: color,
              boxShadow: `0 0 0 1px ${color}22`,
              animation: `meteor-fall ${3 + rand(i, 3) * 6}s linear ${rand(i, 4) * 6}s infinite`,
              opacity: 0,
            } as CSSProperties
          }
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "100%",
              width: 60 + rand(i, 5) * 60,
              height: 1,
              transform: "translateY(-50%)",
              background: `linear-gradient(90deg, ${color}, transparent)`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
