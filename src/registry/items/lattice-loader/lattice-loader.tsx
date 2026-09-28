"use client";

import type { CSSProperties } from "react";

export interface LatticeLoaderProps {
  /** Overall size in px. */
  size?: number;
  /** Nodes per edge (2-4). */
  grid?: number;
  /** Node color. */
  color?: string;
  /** Node shape. */
  variant?: "cubes" | "dots";
  /** Seconds per pulse wave. */
  duration?: number;
  /** Screen-reader text. */
  label?: string;
  className?: string;
}

const css = `
@keyframes lattice-loader-pulse{0%,100%{transform:scale(.4)}35%{transform:scale(1)}60%{transform:scale(.6)}}
@keyframes lattice-loader-sway{0%,100%{transform:rotateX(-32deg) rotateY(32deg)}50%{transform:rotateX(-26deg) rotateY(58deg)}}
@media (prefers-reduced-motion:reduce){.lattice-loader-anim{animation:none!important}}`;

const faces = [
  { t: "rotateY(0deg)", shade: 0 },
  { t: "rotateY(90deg)", shade: 22 },
  { t: "rotateY(180deg)", shade: 34 },
  { t: "rotateY(-90deg)", shade: 22 },
  { t: "rotateX(90deg)", shade: -18 },
  { t: "rotateX(-90deg)", shade: 45 },
];

export function LatticeLoader({
  size = 72,
  grid = 3,
  color = "#a3e635",
  variant = "cubes",
  duration = 1.4,
  label = "Loading",
  className,
}: LatticeLoaderProps) {
  const g = Math.min(4, Math.max(2, Math.round(grid)));
  const gap = size / (g + 0.4);
  const node = gap * (variant === "cubes" ? 0.56 : 0.5);
  const half = node / 2;
  const nodes: { x: number; y: number; z: number; k: number }[] = [];
  for (let x = 0; x < g; x++)
    for (let y = 0; y < g; y++)
      for (let z = 0; z < g; z++) nodes.push({ x, y, z, k: x + (g - 1 - y) + z });
  const maxK = 3 * (g - 1);

  const shade = (s: number) =>
    s < 0 ? `color-mix(in oklab, ${color} ${100 + s}%, white)` : `color-mix(in oklab, ${color} ${100 - s}%, black)`;

  return (
    <div
      role="status"
      className={`inline-grid place-items-center ${className ?? ""}`}
      style={{ width: size * 1.5, height: size * 1.5, perspective: size * 8 }}
    >
      <style href="lattice-loader" precedence="default">
        {css}
      </style>
      <div
        aria-hidden
        className="lattice-loader-anim relative"
        style={{
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: "rotateX(-32deg) rotateY(45deg)",
          animation: `lattice-loader-sway ${duration * 4}s ease-in-out infinite`,
        }}
      >
        {nodes.map(({ x, y, z, k }) => {
          const pos: CSSProperties = {
            position: "absolute",
            transformStyle: "preserve-3d",
            transform: `translate3d(${(x - (g - 1) / 2) * gap}px, ${(y - (g - 1) / 2) * gap}px, ${(z - (g - 1) / 2) * gap}px)`,
          };
          // A wave that travels diagonally from one corner of the lattice to the opposite one.
          const pulse: CSSProperties = {
            position: "absolute",
            left: -half,
            top: -half,
            width: node,
            height: node,
            transformStyle: "preserve-3d",
            animation: `lattice-loader-pulse ${duration}s ${(k / maxK) * duration * 0.7 - duration}s cubic-bezier(.45,0,.3,1) infinite`,
          };
          return (
            <div key={`${x}${y}${z}`} style={pos}>
              <div className="lattice-loader-anim" style={pulse}>
                {variant === "cubes" ? (
                  faces.map((f) => (
                    <span
                      key={f.t}
                      className="absolute inset-0"
                      style={{
                        background: shade(f.shade),
                        transform: `${f.t} translateZ(${half}px)`,
                        backfaceVisibility: "hidden",
                        boxShadow: "inset 0 0 0 0.5px rgb(255 255 255/.25)",
                      }}
                    />
                  ))
                ) : (
                  // Counter-rotate so the sphere always faces the viewer.
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      transform: "rotateY(-45deg) rotateX(32deg)",
                      background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${color} 55%, white), ${color} 55%, color-mix(in oklab, ${color} 55%, black))`,
                      boxShadow: `0 0 ${node}px -${half / 2}px ${color}`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
