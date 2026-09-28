"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface MasonryItem {
  src: string;
  /** Height / width of the image, e.g. 1.5 for a portrait photo. */
  ratio: number;
  alt?: string;
  href?: string;
}

export interface MasonryProps {
  items: MasonryItem[];
  /** Columns are as many as fit at this minimum width, in px. */
  minColumnWidth?: number;
  /** Px between tiles. */
  gap?: number;
  /** Seconds between each tile's entrance. */
  stagger?: number;
  /** Where tiles fly in from. */
  animateFrom?: "bottom" | "top" | "left" | "right" | "center";
  /** Tiles start blurred and come into focus. */
  blurToFocus?: boolean;
  /** Image zoom on hover (1 disables). */
  hoverScale?: number;
  className?: string;
}

const OFFSETS = {
  bottom: { x: 0, y: 80 },
  top: { x: 0, y: -80 },
  left: { x: -80, y: 0 },
  right: { x: 80, y: 0 },
  center: { x: 0, y: 0 },
};

export function Masonry({
  items,
  minColumnWidth = 220,
  gap = 16,
  stagger = 0.05,
  animateFrom = "bottom",
  blurToFocus = true,
  hoverScale = 1.08,
  className,
}: MasonryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current!);
    return () => ro.disconnect();
  }, []);

  // Shortest-column-first placement. Recomputed on resize; tiles glide to their new slots.
  const { tiles, height } = useMemo(() => {
    if (!width) return { tiles: [], height: 0 };
    const cols = Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
    const colW = (width - gap * (cols - 1)) / cols;
    const heights = new Array<number>(cols).fill(0);
    const tiles = items.map((item) => {
      const col = heights.indexOf(Math.min(...heights));
      const h = colW * item.ratio;
      const tile = { x: col * (colW + gap), y: heights[col], w: colW, h };
      heights[col] += h + gap;
      return tile;
    });
    return { tiles, height: Math.max(0, Math.max(...heights) - gap) };
  }, [items, width, gap, minColumnWidth]);

  const from = OFFSETS[animateFrom];

  return (
    <div ref={ref} className={`relative w-full ${className ?? ""}`} style={{ height }}>
      {tiles.map((t, i) => {
        const item = items[i];
        const Tag = item.href ? "a" : "div";
        return (
          <div
            key={item.src + i}
            className="absolute left-0 top-0"
            style={{
              width: t.w,
              height: t.h,
              transform: `translate3d(${t.x}px, ${t.y}px, 0)`,
              transition: reduce ? undefined : "transform .7s cubic-bezier(.2,.8,.2,1), width .7s cubic-bezier(.2,.8,.2,1), height .7s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <motion.div
              className="size-full"
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      x: from.x,
                      y: from.y,
                      scale: animateFrom === "center" ? 0.6 : 0.92,
                      filter: blurToFocus ? "blur(12px)" : "blur(0px)",
                    }
              }
              animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: Math.min(i, 30) * stagger }}
            >
              <Tag
                {...(item.href ? { href: item.href } : {})}
                className="group relative block size-full overflow-hidden rounded-xl bg-muted shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt ?? ""}
                  loading="lazy"
                  draggable={false}
                  className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[var(--hs)] group-focus-visible:scale-[var(--hs)]"
                  style={{ ["--hs" as string]: hoverScale }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                {item.alt && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-3 left-3 translate-y-2 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {item.alt}
                  </span>
                )}
              </Tag>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
