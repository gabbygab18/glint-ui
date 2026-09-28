"use client";

import { useEffect, useRef } from "react";

export interface ThreadsProps {
  /** Number of threads. */
  count?: number;
  /** Color of the first thread. */
  color?: string;
  /** Color of the last thread; the rest blend between. */
  accentColor?: string;
  /** Wave height multiplier. */
  amplitude?: number;
  /** Wind speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** How strongly threads bend toward the cursor, 0 to disable. */
  attraction?: number;
  /** Stroke width in px. */
  thickness?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = (hex || "#000").replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function Threads({
  count = 32,
  color = "#22d3ee",
  accentColor = "#c084fc",
  amplitude = 1,
  speed = 1,
  attraction = 1,
  thickness = 1,
  className,
}: ThreadsProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ count, color, accentColor, amplitude, speed, attraction, thickness });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { count, color, accentColor, amplitude, speed, attraction, thickness };
    redraw.current?.();
  }, [count, color, accentColor, amplitude, speed, attraction, thickness]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Smoothed pointer; `a` fades the pull in and out as the cursor enters and leaves.
    const m = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let time = 12;
    let last = 0;

    const draw = () => {
      const o = opts.current;
      const n = Math.max(1, Math.round(o.count));
      const a = rgb(o.color);
      const b = rgb(o.accentColor);
      const step = 6;
      const radius = Math.max(w, h) * 0.18;
      const pull = o.attraction * m.a * 0.6;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = o.thickness;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < n; i++) {
        const k = n === 1 ? 0.5 : i / (n - 1);
        const phase = k * Math.PI * 2;
        const c = a.map((v, j) => Math.round(v + (b[j] - v) * k));
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(${c},0)`);
        g.addColorStop(0.2, `rgba(${c},0.55)`);
        g.addColorStop(0.5, `rgba(${c},0.9)`);
        g.addColorStop(0.8, `rgba(${c},0.55)`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.strokeStyle = g;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const u = x / Math.max(w, 1);
          // A loose twisted bundle: each thread orbits the shared wave with its own phase.
          const wave =
            Math.sin(u * 4.2 + time * 0.55) * 0.5 +
            Math.sin(u * 7.3 - time * 0.4 + 1.3) * 0.25 +
            Math.sin(u * 2.1 + time * 0.23) * 0.35;
          const spread = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(u * 2.6 - time * 0.3));
          const orbit = Math.sin(phase + u * 5.5 + time * 0.45) * spread;
          const flutter = Math.sin(u * 13 + time * 1.7 + i * 0.9) * 0.08 * spread;
          let y = h * 0.5 + h * 0.13 * o.amplitude * (wave + orbit * 0.9 + flutter);
          if (pull > 0) {
            const dx = (x - m.x) / radius;
            const dy = (y - m.y) / (radius * 1.8);
            y += (m.y - y) * pull * Math.exp(-dx * dx - dy * dy);
          }
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      m.a += (m.ta - m.a) * 0.05;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.tx = e.clientX - r.left;
      m.ty = e.clientY - r.top;
      if (m.ta === 0) {
        m.x = m.tx;
        m.y = m.ty;
      }
      m.ta = 1;
    };
    const onLeave = () => {
      m.ta = 0;
    };

    const target = canvas.parentElement ?? canvas;
    target.addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);
    redraw.current = draw;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      redraw.current = null;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
