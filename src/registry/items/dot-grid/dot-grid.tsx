"use client";

import { useEffect, useRef } from "react";

export interface DotGridProps {
  /** Px between dots. */
  gap?: number;
  dotSize?: number;
  baseColor?: string;
  activeColor?: string;
  /** Px radius around the cursor that lights up. */
  proximity?: number;
  className?: string;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function DotGrid({
  gap = 24,
  dotSize = 2,
  baseColor = "#3f3f46",
  activeColor = "#c6ff3d",
  proximity = 120,
  className,
}: DotGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const base = hexToRgb(baseColor);
    const active = hexToRgb(activeColor);
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let raf = 0;

    // Draws only on resize and pointer movement; a still grid costs nothing.
    const draw = () => {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          const t = Math.max(0, 1 - d / proximity);
          const c = base.map((b, i) => Math.round(b + (active[i] - b) * t));
          ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize * (1 + t * 0.8), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      schedule();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [gap, dotSize, baseColor, activeColor, proximity]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
