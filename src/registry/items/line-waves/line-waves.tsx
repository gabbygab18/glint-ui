"use client";

import { useEffect, useRef } from "react";

export interface LineWavesProps {
  /** Number of lines. */
  count?: number;
  /** Color of the top line; lines blend toward `colorB`. */
  colorA?: string;
  colorB?: string;
  /** Wave height in px. */
  amplitude?: number;
  /** Animation speed multiplier. */
  speed?: number;
  lineWidth?: number;
  /** Lines bulge away from the cursor. */
  interactive?: boolean;
  /** Bulge radius in px. */
  bulgeRadius?: number;
  className?: string;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function LineWaves({
  count = 36,
  colorA = "#22d3ee",
  colorB = "#a78bfa",
  amplitude = 48,
  speed = 1,
  lineWidth = 1,
  interactive = true,
  bulgeRadius = 140,
  className,
}: LineWavesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ count, a: hexToRgb(colorA), b: hexToRgb(colorB), amplitude, speed, lineWidth, interactive, bulgeRadius });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { count, a: hexToRgb(colorA), b: hexToRgb(colorB), amplitude, speed, lineWidth, interactive, bulgeRadius };
    redraw.current?.();
  }, [count, colorA, colorB, amplitude, speed, lineWidth, interactive, bulgeRadius]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const area = canvas.parentElement ?? canvas;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, on: 0, target: 0 };
    let w = 0;
    let h = 0;
    let t = 2;
    let raf = 0;
    let last = 0;

    const draw = (dt: number) => {
      const o = opts.current;
      t += dt * o.speed;
      mouse.on += (mouse.target - mouse.on) * (1 - Math.exp(-dt * 5));
      const bulge = o.interactive ? mouse.on : 0;
      const r2 = o.bulgeRadius * o.bulgeRadius;
      const soft = r2 * 0.05;
      const n = Math.max(2, Math.round(o.count));
      const step = 6;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = o.lineWidth;
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const c = o.a.map((v, k) => Math.round(v + (o.b[k] - v) * f));
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.55 + 0.35 * Math.sin(t * 0.7 + i * 0.4) ** 2})`;
        const y0 = ((i + 0.5) / n) * h;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          let y =
            y0 +
            o.amplitude *
              (Math.sin(x * 0.0055 + t * 0.8 + i * 0.21) * 0.55 +
                Math.sin(x * 0.012 - t * 0.55 + i * 0.09) * 0.3 +
                Math.sin(x * 0.0021 + t * 0.3 - i * 0.13) * 0.6);
          if (bulge > 0.001) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2 * 6) y += (dy / Math.sqrt(dy * dy + soft)) * Math.exp(-d2 / r2) * o.bulgeRadius * 0.7 * bulge;
          }
          if (x < 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      draw(last ? Math.min((now - last) / 1000, 0.1) : 0);
      last = now;
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.target = 1;
    };
    const onLeave = () => {
      mouse.target = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (e.isIntersecting && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    redraw.current = () => {
      if (!raf) draw(0);
    };
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = undefined;
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        maskImage: "linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)",
      }}
    />
  );
}
