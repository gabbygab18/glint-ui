"use client";

import { useEffect, useRef } from "react";

export interface StrandsProps {
  /** Number of hanging strands. */
  count?: number;
  /** Strand length as a fraction of the container height. */
  length?: number;
  /** Rope segments per strand. More is smoother. */
  segments?: number;
  color?: string;
  tipColor?: string;
  /** Line width in px. */
  thickness?: number;
  /** Strength of the idle breeze. */
  sway?: number;
  /** Px around the cursor that pushes strands aside. */
  radius?: number;
  className?: string;
}

type P = { x: number; y: number; px: number; py: number };

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function Strands({
  count = 56,
  length = 0.72,
  segments = 20,
  color = "#c6ff3d",
  tipColor = "#22d3ee",
  thickness = 1.5,
  sway = 1,
  radius = 90,
  className,
}: StrandsProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement ?? canvas;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let strands: { rest: number; pts: P[] }[] = [];
    const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0 };
    // Per-strand length jitter, fixed for the life of the effect.
    const jitter = Array.from({ length: count }, () => 0.72 + Math.random() * 0.28);

    const build = () => {
      strands = jitter.map((j, i) => {
        const x = ((i + 0.5) / count) * w;
        const rest = (h * length * j) / segments;
        return { rest, pts: Array.from({ length: segments + 1 }, (_, k) => ({ x, y: k * rest, px: x, py: k * rest })) };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduced) draw();
    };

    const simulate = (t: number) => {
      const r2 = radius * radius;
      for (const s of strands) {
        const anchorX = s.pts[0].x;
        const breeze = Math.sin(t * 0.9 + anchorX * 0.012) * 0.04 * sway + Math.sin(t * 2.3 + anchorX * 0.03) * 0.015 * sway;
        for (let k = 1; k < s.pts.length; k++) {
          const p = s.pts[k];
          const vx = (p.x - p.px) * 0.97;
          const vy = (p.y - p.py) * 0.97;
          p.px = p.x;
          p.py = p.y;
          p.x += vx + breeze * (k / s.pts.length);
          p.y += vy + 0.25;
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            // Push out of the cursor's circle and carry some of its motion along.
            const d = Math.sqrt(d2);
            const f = 1 - d / radius;
            p.x += (dx / d) * f * 3 + mouse.vx * f * 0.15;
            p.y += (dy / d) * f * 3 + mouse.vy * f * 0.15;
          }
        }
        for (let it = 0; it < 4; it++) {
          for (let k = 1; k < s.pts.length; k++) {
            const a = s.pts[k - 1];
            const b = s.pts[k];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy) || 1;
            const diff = (d - s.rest) / d;
            // The anchor never moves; interior pairs share the correction.
            if (k === 1) {
              b.x -= dx * diff;
              b.y -= dy * diff;
            } else {
              a.x += dx * diff * 0.5;
              a.y += dy * diff * 0.5;
              b.x -= dx * diff * 0.5;
              b.y -= dy * diff * 0.5;
            }
          }
        }
      }
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, 0, h * length);
      grad.addColorStop(0, `rgba(${hexToRgb(color)},0.06)`);
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, tipColor);
      ctx.strokeStyle = grad;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (const s of strands) {
        const p = s.pts;
        ctx.moveTo(p[0].x, p[0].y);
        for (let k = 1; k < p.length - 1; k++) ctx.quadraticCurveTo(p[k].x, p[k].y, (p[k].x + p[k + 1].x) / 2, (p[k].y + p[k + 1].y) / 2);
        ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
      }
      ctx.stroke();
      ctx.fillStyle = tipColor;
      ctx.beginPath();
      for (const s of strands) {
        const tip = s.pts[s.pts.length - 1];
        ctx.moveTo(tip.x + thickness * 1.6, tip.y);
        ctx.arc(tip.x, tip.y, thickness * 1.6, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const loop = (now: number) => {
      simulate(now / 1000);
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (mouse.x > -1e3) {
        mouse.vx = x - mouse.x;
        mouse.vy = y - mouse.y;
      }
      mouse.x = x;
      mouse.y = y;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (reduced) return () => ro.disconnect();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
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
  }, [count, length, segments, color, tipColor, thickness, sway, radius]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
