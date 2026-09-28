"use client";

import { useEffect, useRef } from "react";

export interface DepthTextProps {
  text?: string;
  /** Number of stacked copies forming the extrusion. */
  layers?: number;
  /** Gap between copies, in px. */
  depth?: number;
  /** Maximum tilt toward the pointer, in degrees. */
  maxTilt?: number;
  /** Front face color. */
  color?: string;
  /** Color of the deepest layer. */
  depthColor?: string;
  className?: string;
}

export function DepthText({
  text = "DEPTH",
  layers = 20,
  depth = 3,
  maxTilt = 24,
  color = "#ecfccb",
  depthColor = "#1a2e05",
  className,
}: DepthTextProps) {
  const root = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const s = stack.current!;
    const area = el.parentElement ?? el;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let hovering = false;
    let raf = 0;
    let visible = true;

    const apply = () => (s.style.transform = `rotateX(${cur.x}deg) rotateY(${cur.y}deg)`);
    if (reduced) {
      cur.x = maxTilt * 0.3;
      cur.y = -maxTilt * 0.5;
      apply();
      return;
    }

    const loop = (now: number) => {
      if (!hovering) {
        // Idle sway so the extrusion reads even without a pointer.
        const t = now / 1000;
        target.y = Math.sin(t * 0.7) * maxTilt * 0.6;
        target.x = Math.cos(t * 0.5) * maxTilt * 0.3 + maxTilt * 0.15;
      }
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      apply();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      hovering = true;
      // Small bias so the extrusion still shows with the pointer dead center.
      target.y = nx * maxTilt - maxTilt * 0.2;
      target.x = -ny * maxTilt + maxTilt * 0.25;
    };
    const leave = () => (hovering = false);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    area.addEventListener("pointermove", move, { passive: true });
    area.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, [maxTilt]);

  const n = Math.max(1, Math.round(layers));
  return (
    <div ref={root} className={className} style={{ perspective: "1000px", display: "inline-block" }}>
      <span className="sr-only">{text}</span>
      <div ref={stack} aria-hidden style={{ position: "relative", transformStyle: "preserve-3d", willChange: "transform" }}>
        {Array.from({ length: n }, (_, k) => {
          const i = n - 1 - k; // back to front
          const mix = n > 1 ? Math.round(45 + (i / (n - 1)) * 55) : 0;
          return (
            <span
              key={i}
              style={{
                position: i === 0 ? "relative" : "absolute",
                inset: 0,
                display: "block",
                whiteSpace: "pre",
                transform: `translateZ(${-i * depth}px)`,
                color: i === 0 ? color : `color-mix(in oklab, ${depthColor} ${mix}%, ${color})`,
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
