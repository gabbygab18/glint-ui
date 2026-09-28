"use client";

import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassIconItem {
  icon: ReactNode;
  label: string;
  /** Backplate color. */
  color?: string;
  onClick?: () => void;
}

export interface GlassIconsProps {
  items: GlassIconItem[];
  /** Tile size in px. */
  size?: number;
  /** Max pointer tilt of the glass in degrees. */
  tilt?: number;
  /** Show the label under a hovered tile. */
  showLabels?: boolean;
  className?: string;
}

const PALETTE = ["#3b82f6", "#a855f7", "#f43f5e", "#6366f1", "#f59e0b", "#10b981"];
const EASE = "cubic-bezier(.34,1.4,.5,1)";

export function GlassIcons({ items, size = 72, tilt = 18, showLabels = true, className }: GlassIconsProps) {
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--gi-rx", `${-py * tilt * 2}deg`);
    el.style.setProperty("--gi-ry", `${px * tilt * 2}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty("--gi-rx", "0deg");
    e.currentTarget.style.setProperty("--gi-ry", "0deg");
  };

  return (
    <div className={cn("flex flex-wrap items-start justify-center", className)} style={{ gap: size * 0.5, paddingBottom: size * 0.45 }}>
      {items.map((it, i) => {
        const color = it.color ?? PALETTE[i % PALETTE.length];
        return (
          <button
            key={it.label}
            type="button"
            aria-label={it.label}
            onClick={it.onClick}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="group relative shrink-0 rounded-[28%] outline-none [perspective:500px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            style={{ width: size, height: size }}
          >
            {/* colored backplate */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-[28%] shadow-[0_12px_28px_-10px_rgba(0,0,0,.6)] [transform:translate3d(-7%,-7%,0)_rotate(15deg)_scale(.92)] group-hover:[transform:translate3d(-14%,-12%,0)_rotate(26deg)_scale(.92)] group-focus-visible:[transform:translate3d(-14%,-12%,0)_rotate(26deg)_scale(.92)]"
              style={{
                background: `linear-gradient(145deg, color-mix(in oklab, ${color} 80%, white), ${color} 45%, color-mix(in oklab, ${color} 65%, black))`,
                transition: `transform .5s ${EASE}`,
              }}
            />
            {/* frosted glass front */}
            <span
              aria-hidden
              className="absolute inset-0 grid place-items-center rounded-[28%] border border-white/25 text-white backdrop-blur-md backdrop-saturate-150 [transform:translate3d(0,0,0)] group-hover:[transform:translate3d(5%,5%,30px)_rotateX(var(--gi-rx,0deg))_rotateY(var(--gi-ry,0deg))] group-focus-visible:[transform:translate3d(5%,5%,30px)]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,.3), rgba(255,255,255,.08) 55%, rgba(255,255,255,.14))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), inset 0 -1px 0 rgba(255,255,255,.1)",
                transition: `transform .45s ${EASE}`,
              }}
            >
              <span className="grid size-[44%] place-items-center drop-shadow-[0_2px_6px_rgba(0,0,0,.25)] [&>svg]:size-full">
                {it.icon}
              </span>
            </span>
            {showLabels && (
              <span className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 translate-y-1 whitespace-nowrap text-sm font-medium text-foreground opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                {it.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
