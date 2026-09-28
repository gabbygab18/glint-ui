"use client";

import { useEffect, useRef } from "react";

export interface PixelTrailProps {
  /** Cell size in px. */
  pixelSize?: number;
  /** Ms for a lit pixel to fade out. */
  decay?: number;
  /** Brush radius in cells. */
  brush?: number;
  color?: string;
  /** Faint grid lines under the trail. */
  showGrid?: boolean;
  /** Draw a wandering trail while the cursor is away. */
  idle?: boolean;
  className?: string;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function PixelTrail({
  pixelSize = 24,
  decay = 700,
  brush = 1,
  color = "#c6ff3d",
  showGrid = true,
  idle = true,
  className,
}: PixelTrailProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement ?? canvas;
    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = hexToRgb(color);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let cells = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last: { x: number; y: number } | null = null;
    let lastMove = -1e9;
    let wandering = false;
    let prev = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / pixelSize);
      rows = Math.ceil(h / pixelSize);
      cells = new Float32Array(cols * rows);
    };

    const stamp = (x: number, y: number) => {
      const cx = Math.floor(x / pixelSize);
      const cy = Math.floor(y / pixelSize);
      for (let dy = -brush; dy <= brush; dy++) {
        for (let dx = -brush; dx <= brush; dx++) {
          if (dx * dx + dy * dy > brush * brush + 0.5) continue;
          const i = cx + dx;
          const j = cy + dy;
          if (i >= 0 && j >= 0 && i < cols && j < rows) cells[j * cols + i] = 1;
        }
      }
    };

    // Stamp every cell between the previous and current point so fast moves leave no gaps.
    const paint = (x: number, y: number) => {
      if (last) {
        const steps = Math.ceil(Math.hypot(x - last.x, y - last.y) / (pixelSize / 2));
        for (let s = 1; s <= steps; s++) stamp(last.x + ((x - last.x) * s) / steps, last.y + ((y - last.y) * s) / steps);
      } else stamp(x, y);
      last = { x, y };
    };

    const frame = (now: number) => {
      const dt = Math.min(now - prev, 50);
      prev = now;
      if (idle && now - lastMove > 1500) {
        const t = now / 1000;
        if (!wandering) last = null;
        wandering = true;
        paint(w / 2 + Math.sin(t * 0.9) * w * 0.32, h / 2 + Math.sin(t * 1.7) * h * 0.3);
      }
      ctx.clearRect(0, 0, w, h);
      if (showGrid) {
        ctx.fillStyle = `rgba(${r},${g},${b},0.05)`;
        for (let i = 1; i < cols; i++) ctx.fillRect(i * pixelSize, 0, 1, h);
        for (let j = 1; j < rows; j++) ctx.fillRect(0, j * pixelSize, w, 1);
      }
      const fade = dt / decay;
      const gap = Math.max(1, pixelSize * 0.08);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const v = cells[k];
          if (v <= 0) continue;
          cells[k] = Math.max(0, v - fade);
          // Fresh pixels burn white-hot, then cool to the color and shrink away.
          const hot = Math.max(0, v - 0.75) * 4;
          ctx.fillStyle = `rgba(${r + (255 - r) * hot},${g + (255 - g) * hot},${b + (255 - b) * hot},${v})`;
          const s = (pixelSize - gap) * (0.35 + 0.65 * v);
          const o = (pixelSize - s) / 2;
          ctx.fillRect(i * pixelSize + o, j * pixelSize + o, s, s);
        }
      }
    };

    const loop = (now: number) => {
      frame(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (wandering) last = null;
      wandering = false;
      lastMove = performance.now();
      paint(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onLeave = () => {
      last = null;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    if (reduced) return () => ro.disconnect();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [pixelSize, decay, brush, color, showGrid, idle]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
