"use client";

import { Fragment, useEffect, useRef } from "react";

export interface VariableProximityProps {
  text: string;
  /** Px from the pointer where letters start reacting. */
  radius?: number;
  /** Shape of the response curve from the pointer outwards. */
  falloff?: "linear" | "exponential" | "gaussian";
  /** Weight far from the pointer. Use a variable font for smooth steps. */
  fromWeight?: number;
  /** Weight right under the pointer. */
  toWeight?: number;
  /** Scale right under the pointer. */
  scale?: number;
  /** Tint letters toward this color near the pointer. Empty to disable. */
  activeColor?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
}

const curves = {
  linear: (t: number) => 1 - t,
  exponential: (t: number) => (Math.exp(-4 * t) - Math.exp(-4)) / (1 - Math.exp(-4)),
  gaussian: (t: number) => Math.exp(-(t * t) / 0.18),
};

export function VariableProximity({
  text,
  radius = 140,
  falloff = "gaussian",
  fromWeight = 400,
  toWeight = 900,
  scale = 1.15,
  activeColor = "#bef264",
  as: Tag = "p",
  className,
}: VariableProximityProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const area = el?.parentElement ?? el;
    if (!el || !area || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-letter]"));
    const level = letters.map(() => 0);
    const curve = curves[falloff] ?? curves.gaussian;
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;

    const tick = () => {
      const rects = letters.map((l) => l.getBoundingClientRect());
      let moving = false;
      letters.forEach((l, i) => {
        const r = rects[i];
        const d = pointer ? Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2)) : Infinity;
        const target = d < radius ? curve(d / radius) : 0;
        level[i] += (target - level[i]) * 0.2;
        if (Math.abs(target - level[i]) > 0.002) moving = true;
        const p = level[i];
        l.style.fontWeight = String(Math.round(fromWeight + (toWeight - fromWeight) * p));
        l.style.transform = p > 0.001 ? `scale(${(1 + (scale - 1) * p).toFixed(3)})` : "";
        l.style.color = activeColor && p > 0.001 ? `color-mix(in oklab, ${activeColor} ${(p * 100).toFixed(1)}%, currentColor)` : "";
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

    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      letters.forEach((l) => {
        l.style.fontWeight = "";
        l.style.transform = "";
        l.style.color = "";
      });
    };
  }, [text, radius, falloff, fromWeight, toWeight, scale, activeColor]);

  const words = text.split(" ");
  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((c, i) => (
              <span
                key={i}
                data-letter
                style={{ display: "inline-block", fontWeight: fromWeight, transformOrigin: "50% 70%" }}
              >
                {c}
              </span>
            ))}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
