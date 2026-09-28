"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface TextPressureProps {
  text: string;
  /** Weight at rest. Use a variable font for smooth steps. */
  minWeight?: number;
  /** Weight right under the cursor. */
  maxWeight?: number;
  /** Px around the cursor that applies pressure. */
  radius?: number;
  /** Extra vertical stretch at full pressure (0.4 = 40% taller). */
  stretch?: number;
  /** Fade letters that feel no pressure. */
  alpha?: boolean;
  /** 0-1, how quickly letters catch up with the cursor. */
  smoothing?: number;
  className?: string;
}

export function TextPressure({
  text,
  minWeight = 300,
  maxWeight = 900,
  radius = 280,
  stretch = 0.35,
  alpha = false,
  smoothing = 0.16,
  className,
}: TextPressureProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const area = el?.parentElement ?? el;
    if (!el || !area || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-letter]"));
    const level = letters.map(() => 0);
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;

    const tick = () => {
      // Read every rect first, then write, so each frame costs one layout.
      const rects = letters.map((l) => l.getBoundingClientRect());
      let moving = false;
      letters.forEach((l, i) => {
        const r = rects[i];
        const d = pointer ? Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2)) : Infinity;
        const target = d < radius ? 0.5 + 0.5 * Math.cos((Math.PI * d) / radius) : 0;
        level[i] += (target - level[i]) * smoothing;
        if (Math.abs(target - level[i]) > 0.002) moving = true;
        const p = level[i];
        l.style.fontWeight = String(Math.round(minWeight + (maxWeight - minWeight) * p));
        l.style.transform = `scaleY(${(1 + stretch * p).toFixed(3)})`;
        if (alpha) l.style.opacity = (0.3 + 0.7 * p).toFixed(3);
      });
      raf = moving || pointer ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };

    letters.forEach((l) => {
      l.style.fontWeight = String(minWeight);
      l.style.transform = "";
      l.style.opacity = alpha ? "0.3" : "";
    });
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, [text, minWeight, maxWeight, radius, stretch, alpha, smoothing]);

  return (
    <div ref={ref} className={cn("flex w-full select-none justify-between leading-none", className)}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((c, i) => (
        <span
          key={i}
          data-letter
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre", fontWeight: minWeight, transformOrigin: "50% 100%", willChange: "transform" }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}
