"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SHAPES = {
  arrow: {
    hot: [3, 2],
    body: <path d="M3 2v18.5l5.2-4.7 3.4 7.2 3.2-1.5-3.3-7h7.2z" strokeWidth="1.3" strokeLinejoin="round" />,
  },
  ghost: {
    hot: [12, 12],
    body: (
      <>
        <path d="M12 2.5a8 8 0 0 0-8 8v11l2.7-2 2.6 2 2.7-2 2.6 2 2.7-2 2.7 2v-11a8 8 0 0 0-8-8z" strokeWidth="1.2" />
        <circle cx="9.3" cy="10.5" r="1.4" fill="#0a0a0a" stroke="none" />
        <circle cx="14.7" cy="10.5" r="1.4" fill="#0a0a0a" stroke="none" />
      </>
    ),
  },
  dot: { hot: [12, 12], body: <circle cx="12" cy="12" r="6" strokeWidth="1.2" /> },
};

export interface GhostCursorProps {
  children?: ReactNode;
  /** Color of the live cursor. */
  color?: string;
  /** Tint of the trailing ghosts. */
  ghostColor?: string;
  /** Number of ghost copies. */
  count?: number;
  /** Frames of delay between consecutive ghosts. */
  spacing?: number;
  /** Cursor size in px. */
  size?: number;
  shape?: keyof typeof SHAPES;
  /** Hide the native cursor inside the container. */
  hideCursor?: boolean;
  className?: string;
}

export function GhostCursor({
  children,
  color = "#ffffff",
  ghostColor = "#a78bfa",
  count = 6,
  spacing = 4,
  size = 28,
  shape = "arrow",
  hideCursor = true,
  className,
}: GhostCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const { hot, body } = SHAPES[shape] ?? SHAPES.arrow;

  useEffect(() => {
    const root = rootRef.current!;
    const layer = layerRef.current!;
    const els = Array.from(layer.children) as HTMLElement[];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const len = count * spacing + 1;
    const hx = (hot[0] / 24) * size;
    const hy = (hot[1] / 24) * size;
    let hist: { x: number; y: number }[] = [];
    const target = { x: 0, y: 0 };
    let inside = false;
    let raf = 0;

    const loop = (now: number) => {
      hist.unshift({ ...target });
      if (hist.length > len) hist.length = len;
      const t = now / 1000;
      // Index 0 is the live cursor; ghosts read older positions and drift a little, like smoke.
      els.forEach((el, i) => {
        const p = hist[Math.min(hist.length - 1, (count - i) * spacing)];
        const g = count - i;
        const drift = reduced ? 0 : g * 1.6;
        const x = p.x - hx + Math.sin(t * 2.1 + g) * drift;
        const y = p.y - hy + Math.cos(t * 1.7 + g * 1.3) * drift - (reduced ? 0 : g * 2.2);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 - g * 0.035})`;
      });
      const settled = hist.every((p) => p.x === target.x && p.y === target.y);
      raf = inside || !settled ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      if (!inside) {
        inside = true;
        layer.style.opacity = "1";
        if (!hist.length || reduced) hist = [{ ...target }];
      }
      if (reduced) hist = [{ ...target }];
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      inside = false;
      layer.style.opacity = "0";
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [count, spacing, size, hot]);

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      data-ghost-cursor-hide={hideCursor ? "" : undefined}
    >
      <style href="ghost-cursor" precedence="default">
        {`[data-ghost-cursor-hide],[data-ghost-cursor-hide] *{cursor:none!important}`}
      </style>
      {children}
      <div
        ref={layerRef}
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, transition: "opacity .3s" }}
      >
        {Array.from({ length: count + 1 }, (_, i) => {
          const g = count - i;
          const live = g === 0;
          return (
            <svg
              key={i}
              viewBox="0 0 24 24"
              width={size}
              height={size}
              fill={live ? color : ghostColor}
              stroke={live ? "#000" : ghostColor}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                willChange: "transform",
                opacity: live ? 1 : 0.75 * (1 - g / (count + 1)),
                filter: live ? "drop-shadow(0 2px 4px rgba(0,0,0,.5))" : `blur(${g * 0.5}px)`,
                mixBlendMode: live ? undefined : "screen",
              }}
            >
              {body}
            </svg>
          );
        })}
      </div>
    </div>
  );
}
