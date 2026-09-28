"use client";

import { useEffect, useRef } from "react";

export interface ParticleTextProps {
  text?: string;
  /** Particle square size, in px. */
  particleSize?: number;
  /** Sampling step, in px. Smaller means more particles. */
  gap?: number;
  color?: string;
  /** Second gradient stop (right side). */
  secondaryColor?: string;
  /** Color of particles while they are flying. */
  sparkColor?: string;
  /** Pointer push radius, in px. */
  repelRadius?: number;
  /** How hard the pointer pushes. */
  repelStrength?: number;
  /** Spring pull back home, 0-1. */
  returnSpeed?: number;
  className?: string;
}

type P = { x: number; y: number; vx: number; vy: number; hx: number; hy: number };

export function ParticleText({
  text = "Glint",
  particleSize = 2.2,
  gap = 4,
  color = "#bef264",
  secondaryColor = "#22d3ee",
  sparkColor = "#ffffff",
  repelRadius = 90,
  repelStrength = 5,
  returnSpeed = 0.06,
  className,
}: ParticleTextProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = wrap.current!;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family = getComputedStyle(root).fontFamily || "sans-serif";
    const step = Math.max(2, gap);
    const mouse = { x: -1e4, y: -1e4 };
    let pts: P[] = [];
    let w = 0;
    let h = 0;
    let fill: CanvasGradient | string = color;
    let raf = 0;
    let visible = true;

    const layout = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.font = `900 100px ${family}`;
      const size = Math.min((100 * w * 0.84) / Math.max(o.measureText(text).width, 1), h * 0.6);
      o.font = `900 ${size}px ${family}`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillText(text, w / 2, h / 2);
      const data = o.getImageData(0, 0, w, h).data;

      const homes: [number, number][] = [];
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 128) homes.push([x, y]);
      // Reuse existing particles so a resize morphs instead of restarting.
      pts = homes.map(([hx, hy], i) => {
        const p = pts[i] ?? { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, hx, hy };
        p.hx = hx;
        p.hy = hy;
        if (reduced) {
          p.x = hx;
          p.y = hy;
        }
        return p;
      });
      const g = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
      g.addColorStop(0, color);
      g.addColorStop(1, secondaryColor);
      fill = g;
      if (reduced || !raf) frame();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const R2 = repelRadius * repelRadius;
      const s = particleSize;
      const calm = new Path2D();
      const fast = new Path2D();
      for (const p of pts) {
        if (!reduced) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / repelRadius) * repelStrength;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx = (p.vx + (p.hx - p.x) * returnSpeed) * 0.84;
          p.vy = (p.vy + (p.hy - p.y) * returnSpeed) * 0.84;
          p.x += p.vx;
          p.y += p.vy;
        }
        (p.vx * p.vx + p.vy * p.vy > 1.5 ? fast : calm).rect(p.x, p.y, s, s);
      }
      ctx.fillStyle = fill;
      ctx.fill(calm);
      ctx.fillStyle = sparkColor;
      ctx.fill(fast);
    };

    const loop = () => {
      frame();
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => {
      mouse.x = -1e4;
      mouse.y = -1e4;
    };

    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    document.fonts?.ready.then(layout);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      raf = -1;
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, [text, particleSize, gap, color, secondaryColor, sparkColor, repelRadius, repelStrength, returnSpeed]);

  return (
    <div ref={wrap} className={className} style={{ position: "relative", width: "100%", height: "100%", touchAction: "pan-y" }}>
      <span className="sr-only">{text}</span>
      <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
