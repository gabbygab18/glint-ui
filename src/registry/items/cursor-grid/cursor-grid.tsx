"use client";

import { useEffect, useRef } from "react";

export interface CursorGridProps {
  /** Cell size in px. */
  cellSize?: number;
  /** Gap between cells in px. */
  gap?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Idle cell outline color. */
  baseColor?: string;
  /** Color of freshly lit cells (6-digit hex). */
  color?: string;
  /** Color lit cells cool down to as they fade (6-digit hex). */
  trailColor?: string;
  /** Ms for a lit cell to fade out. */
  fade?: number;
  /** Brush radius in cells. */
  brush?: number;
  className?: string;
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function CursorGrid({
  cellSize = 36,
  gap = 4,
  radius = 6,
  baseColor = "#27272a",
  color = "#c6ff3d",
  trailColor = "#22d3ee",
  fade = 1400,
  brush = 1.5,
  className,
}: CursorGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hot = rgb(color);
    const cool = rgb(trailColor);
    const step = cellSize + gap;
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let heat = new Float32Array(0);
    let raf = 0;
    let last = 0;
    let prev: { x: number; y: number } | null = null;

    const draw = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      ctx.clearRect(0, 0, w, h);
      const ox = (w - cols * step + gap) / 2;
      const oy = (h - rows * step + gap) / 2;
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < heat.length; i++) {
        ctx.roundRect(ox + (i % cols) * step + 0.5, oy + Math.floor(i / cols) * step + 0.5, cellSize - 1, cellSize - 1, radius);
      }
      ctx.stroke();

      let alive = false;
      const decay = reduced ? 1 : dt / fade;
      for (let i = 0; i < heat.length; i++) {
        const v = heat[i];
        if (v <= 0) continue;
        alive = true;
        // Fresh cells glow hot, then cool toward the trail color as they fade.
        const c = hot.map((a, j) => Math.round(cool[j] + (a - cool[j]) * v * v));
        const x = ox + (i % cols) * step;
        const y = oy + Math.floor(i / cols) * step;
        const s = cellSize * (0.82 + 0.18 * v);
        ctx.globalAlpha = Math.min(1, v * 1.2);
        ctx.fillStyle = ctx.shadowColor = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.shadowBlur = 18 * v;
        ctx.beginPath();
        ctx.roundRect(x + (cellSize - s) / 2, y + (cellSize - s) / 2, s, s, radius);
        ctx.fill();
        heat[i] = Math.max(0, v - decay);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = alive ? requestAnimationFrame(draw) : 0;
      if (!alive) last = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const light = (px: number, py: number) => {
      const ox = (w - cols * step + gap) / 2;
      const oy = (h - rows * step + gap) / 2;
      const gx = (px - ox) / step - 0.5;
      const gy = (py - oy) / step - 0.5;
      const r = Math.ceil(brush);
      for (let y = Math.round(gy) - r; y <= Math.round(gy) + r; y++) {
        for (let x = Math.round(gx) - r; x <= Math.round(gx) + r; x++) {
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const d = Math.hypot(x - gx, y - gy);
          const v = 1 - d / (brush + 0.5);
          const i = y * cols + x;
          if (v > heat[i]) heat[i] = Math.min(1, v * 1.4);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top };
      // Fill the gap between pointer events so fast strokes leave a continuous trail.
      const from = prev ?? p;
      const n = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y) / (step / 2)));
      for (let k = 1; k <= n; k++) light(from.x + ((p.x - from.x) * k) / n, from.y + ((p.y - from.y) * k) / n);
      prev = p;
      schedule();
    };
    const onLeave = () => {
      prev = null;
    };

    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor((w + gap) / step));
      rows = Math.max(1, Math.floor((h + gap) / step));
      heat = new Float32Array(cols * rows);
      schedule();
    });
    ro.observe(canvas);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [cellSize, gap, radius, baseColor, color, trailColor, fade, brush]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
