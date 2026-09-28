"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes drift-wall-up{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-50%,0)}}
@keyframes drift-wall-down{from{transform:translate3d(0,-50%,0)}to{transform:translate3d(0,0,0)}}
.drift-wall-col{animation:var(--dw-name) var(--dw-dur) linear infinite;will-change:transform}
.drift-wall[data-pause="true"]:hover .drift-wall-col{animation-play-state:paused}
.drift-wall-tile{transition:transform .5s cubic-bezier(.2,.7,.2,1),filter .5s}
.drift-wall[data-pause="true"]:hover .drift-wall-tile{filter:saturate(.7) brightness(.8)}
.drift-wall[data-pause="true"] .drift-wall-tile:hover{transform:scale(1.06);filter:none;z-index:1}
@media (prefers-reduced-motion:reduce){.drift-wall-col{animation:none}}
`;

export interface DriftWallProps {
  images: string[];
  /** Number of image columns. */
  columns?: number;
  /** Drift speed in px per second. */
  speed?: number;
  /** Wall tilt in degrees. */
  tilt?: number;
  /** Px between tiles. */
  gap?: number;
  /** Freeze the wall while hovered. */
  pauseOnHover?: boolean;
  /** Fade the wall into the background at the edges. */
  fade?: boolean;
  className?: string;
}

// Rough tile height (px) used to turn speed into an animation duration.
const TILE = 300;

export function DriftWall({
  images,
  columns = 7,
  speed = 40,
  tilt = 16,
  gap = 16,
  pauseOnHover = true,
  fade = true,
  className,
}: DriftWallProps) {
  const cols = Math.max(1, Math.round(columns));
  const perCol = Math.max(4, Math.ceil(images.length / cols) + 2);

  return (
    <div
      className={cn("drift-wall relative h-full w-full overflow-hidden", className)}
      data-pause={pauseOnHover}
      style={{ perspective: 1600 }}
    >
      <style href="drift-wall" precedence="default">
        {css}
      </style>
      <div
        className="absolute left-1/2 top-1/2 flex"
        style={{
          gap,
          width: "150%",
          height: "220%",
          transform: `translate(-50%,-50%) rotateX(${tilt * 1.4}deg) rotateZ(${-tilt}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: cols }, (_, c) => {
          const list = Array.from({ length: perCol }, (_, j) => images[(j * cols + c) % images.length]);
          // Each column gets its own direction and pace so the wall feels alive.
          const pace = 1 + ((c * 7) % 5) * 0.18;
          const dur = speed > 0 ? (perCol * TILE) / (speed * pace) : 0;
          return (
            <div key={c} className="min-w-0 flex-1" style={{ marginTop: c % 2 ? -TILE / 2 : 0 }}>
              <div
                className="drift-wall-col flex flex-col"
                style={
                  {
                    // Margin (not flex gap) keeps -50% an exact loop point.
                    "--dw-name": dur ? (c % 2 ? "drift-wall-down" : "drift-wall-up") : "none",
                    "--dw-dur": `${dur}s`,
                  } as CSSProperties
                }
              >
                {[...list, ...list].map((src, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={j}
                    src={src}
                    alt=""
                    draggable={false}
                    style={{ marginBottom: gap }}
                    className="drift-wall-tile relative block aspect-[4/5] w-full rounded-xl bg-muted object-cover shadow-lg"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {fade && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, var(--background) 100%)",
          }}
        />
      )}
    </div>
  );
}
