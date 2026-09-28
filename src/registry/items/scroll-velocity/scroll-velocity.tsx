"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ScrollVelocityProps {
  /** One marquee row per string. Rows alternate direction. */
  texts: string[];
  /** Drift speed in px per second while not scrolling. */
  baseVelocity?: number;
  /** How much scroll speed adds to the drift. */
  velocityFactor?: number;
  /** Lean rows in the direction of travel when moving fast. */
  skew?: boolean;
  /** Draw every other row as outlined text. */
  outlineAlternate?: boolean;
  /** Glyph between repeats. Empty for none. */
  separator?: string;
  /** Element that scrolls. Defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

// ponytail: fixed repeat count; very short text in a very wide box could show a gap. Measure and add copies if that matters.
const COPIES = 8;

export function ScrollVelocity({
  texts,
  baseVelocity = 60,
  velocityFactor = 0.4,
  skew = true,
  outlineAlternate = true,
  separator = "✦",
  scrollContainerRef,
  className,
}: ScrollVelocityProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tracks = Array.from(el.querySelectorAll<HTMLElement>("[data-track]"));
    const scroller = scrollContainerRef?.current ?? null;
    const getScroll = () => (scroller ? scroller.scrollTop : window.scrollY);
    const x = tracks.map(() => 0);
    let raf = 0;
    let last = 0;
    let lastScroll = getScroll();
    let v = 0; // smoothed scroll velocity, px/s
    let dir = 1; // flips with scroll direction

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!dt) return;
      const s = getScroll();
      v += ((s - lastScroll) / dt - v) * (1 - Math.exp(-dt * 8));
      lastScroll = s;
      if (Math.abs(v) > 20) dir = Math.sign(v);
      tracks.forEach((t, i) => {
        const w = (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        if (!w) return;
        const rowDir = i % 2 ? -1 : 1;
        const speed = rowDir * (baseVelocity * dir + v * velocityFactor);
        x[i] = (((x[i] + speed * dt) % w) + w) % w;
        const lean = skew ? Math.max(-12, Math.min(12, -speed * 0.012)) : 0;
        t.style.transform = `translate3d(${-x[i]}px,0,0) skewX(${lean.toFixed(2)}deg)`;
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      lastScroll = getScroll();
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [baseVelocity, velocityFactor, skew, scrollContainerRef, texts.length]);

  return (
    <div ref={root} className={cn("w-full overflow-hidden", className)}>
      <span className="sr-only">{texts.join(". ")}</span>
      {texts.map((text, i) => (
        <div key={i} aria-hidden className="overflow-hidden whitespace-nowrap py-[0.08em] leading-none">
          <div
            data-track
            className="inline-flex will-change-transform"
            style={
              outlineAlternate && i % 2
                ? { WebkitTextFillColor: "transparent", WebkitTextStroke: "0.025em currentColor" }
                : undefined
            }
          >
            {Array.from({ length: COPIES }, (_, k) => (
              <span key={k} className="inline-flex items-center">
                {text}
                {separator && (
                  <span className="mx-[0.35em] text-[0.5em] opacity-40" style={{ WebkitTextStroke: "0" }}>
                    {separator}
                  </span>
                )}
                {!separator && <span className="w-[0.5em]" />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
