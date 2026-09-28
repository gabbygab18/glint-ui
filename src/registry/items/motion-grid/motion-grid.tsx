"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MotionGridProps {
  rows?: number;
  cols?: number;
  /** Px between tiles. */
  gap?: number;
  /** Ms of delay per tile of distance from the origin. */
  stagger?: number;
  /** Ms each tile takes to complete its wave. */
  duration?: number;
  /** Color tiles flash as the wave passes. */
  accent?: string;
  /** Launch waves from random tiles on its own every few seconds. */
  autoplay?: boolean;
  className?: string;
}

export function MotionGrid({
  rows = 9,
  cols = 15,
  gap = 6,
  stagger = 45,
  duration = 900,
  accent = "#c6ff3d",
  autoplay = true,
  className,
}: MotionGridProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const tiles = Array.from(el.children) as HTMLElement[];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    // Read the resting tile color once, before any wave can tint it.
    const base = tiles.length ? getComputedStyle(tiles[0]).backgroundColor : "transparent";

    const wave = (r0: number, c0: number) => {
      if (reduced) return;
      tiles.forEach((tile, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const d = Math.hypot(r - r0, c - c0);
        const spin = (r + c) % 2 ? 90 : -90;
        tile.animate(
          [
            { transform: "scale(1) rotate(0deg)", background: base, opacity: 1 },
            { transform: `scale(0.4) rotate(${spin}deg)`, background: accent, opacity: 0.7, offset: 0.3 },
            { transform: `scale(1.12) rotate(${spin}deg)`, background: accent, opacity: 1, offset: 0.62 },
            { transform: `scale(1) rotate(${spin}deg)`, background: base },
          ],
          { duration, delay: d * stagger, easing: "cubic-bezier(.4,0,.2,1)" },
        );
      });
    };

    const onClick = (e: MouseEvent) => {
      const i = tiles.indexOf(e.target as HTMLElement);
      if (i >= 0) wave(Math.floor(i / cols), i % cols);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      wave((rows - 1) / 2, (cols - 1) / 2);
    };
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);

    if (autoplay && !reduced) {
      const auto = () => {
        if (document.visibilityState === "visible") wave(Math.floor(Math.random() * rows), Math.floor(Math.random() * cols));
        timer = window.setTimeout(auto, 3200 + Math.hypot(rows, cols) * stagger);
      };
      timer = window.setTimeout(auto, 600);
    }
    return () => {
      clearTimeout(timer);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
      tiles.forEach((t) => t.getAnimations().forEach((a) => a.cancel()));
    };
  }, [rows, cols, stagger, duration, accent, autoplay]);

  return (
    <div
      ref={root}
      tabIndex={0}
      role="button"
      aria-label="Motion grid: click a tile or press Enter to send a wave"
      className={cn("grid cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
    >
      {Array.from({ length: rows * cols }, (_, i) => (
        <div key={i} className="aspect-square rounded-[22%] bg-muted" style={{ willChange: "transform" }} />
      ))}
    </div>
  );
}
