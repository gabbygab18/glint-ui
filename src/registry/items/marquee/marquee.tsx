"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MarqueeProps {
  items: ReactNode[];
  /** Scroll speed in px per second. */
  speed?: number;
  /** Speed while hovered, px per second. 0 glides to a stop; the change is eased, never abrupt. */
  hoverSpeed?: number;
  direction?: "left" | "right";
  /** Px between items. */
  gap?: number;
  /** Grow the hovered item. */
  scaleOnHover?: boolean;
  /** Fade out both edges. */
  fadeEdges?: boolean;
  /** Accessible name for the list. */
  ariaLabel?: string;
  className?: string;
}

export function Marquee({
  items,
  speed = 60,
  hoverSpeed = 0,
  direction = "left",
  gap = 48,
  scaleOnHover = true,
  fadeEdges = true,
  ariaLabel = "Logos",
  className,
}: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLUListElement>(null);
  // Enough copies to cover the container twice, so the loop never shows a gap.
  const [copies, setCopies] = useState(2);
  const hovered = useRef(false);

  useEffect(() => {
    const el = root.current!;
    const measure = () => {
      const w = first.current?.offsetWidth ?? 0;
      if (w > 0) setCopies(Math.max(2, Math.ceil(el.clientWidth / w) + 1));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (first.current) ro.observe(first.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sign = direction === "left" ? -1 : 1;
    let offset = 0;
    let velocity = speed;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let stopped = false;

    const frame = (now: number) => {
      const t = track.current;
      const w = first.current?.offsetWidth ?? 0;
      if (stopped || !t) return void (raf = 0);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Ease toward the target speed so hover slows down and speeds up smoothly.
      const target = hovered.current ? hoverSpeed : speed;
      velocity += (target - velocity) * Math.min(1, dt * 6);
      if (w > 0) {
        offset = (offset + sign * velocity * dt) % w;
        if (offset > 0) offset -= w; // keep in [-w, 0)
        t.style.transform = `translate3d(${offset}px,0,0)`;
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf && visible && !stopped && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(el);
    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed, hoverSpeed, direction]);

  const fade = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";

  return (
    <div
      ref={root}
      role="region"
      aria-label={ariaLabel}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      onFocus={() => (hovered.current = true)}
      onBlur={() => (hovered.current = false)}
      className={className}
      style={{
        overflow: "hidden",
        // Room above and below so scaled items are not clipped.
        paddingBlock: scaleOnHover ? 12 : 0,
        maskImage: fadeEdges ? fade : undefined,
        WebkitMaskImage: fadeEdges ? fade : undefined,
      }}
    >
      <div ref={track} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
        {Array.from({ length: copies }, (_, copy) => (
          <ul
            key={copy}
            ref={copy === 0 ? first : undefined}
            aria-hidden={copy > 0 || undefined}
            style={{ display: "flex", alignItems: "center", flexShrink: 0, gap, margin: 0, padding: `0 ${gap}px 0 0`, listStyle: "none" }}
          >
            {items.map((item, i) => (
              <li
                key={i}
                style={{ flexShrink: 0 }}
                className={
                  scaleOnHover
                    ? "transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:scale-[1.18] motion-reduce:transition-none"
                    : undefined
                }
              >
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
