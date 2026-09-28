"use client";

import { useEffect, useRef } from "react";

export interface AntigravityProps {
  /** Number of particles. */
  count?: number;
  /** 6-digit hex. */
  color?: string;
  /** Upward drift multiplier. */
  speed?: number;
  /** Px radius the cursor disturbs. */
  radius?: number;
  /** How hard the cursor swirls particles away. */
  swirl?: number;
  /** Largest particle radius in px. */
  size?: number;
  className?: string;
}

type P = { x: number; y: number; vx: number; vy: number; z: number; phase: number };

export function Antigravity({
  count = 600,
  color = "#c6ff3d",
  speed = 1,
  radius = 160,
  swirl = 1,
  size = 3,
  className,
}: AntigravityProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = 0;
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, in: false };

    // Pre-render one glowing dot and stamp it; far cheaper than a gradient per particle.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d")!;
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.18, color);
    g.addColorStop(0.45, color + "44");
    g.addColorStop(1, color + "00");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);

    const pts: P[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: 0,
      vy: 0,
      z: 0.25 + Math.random() ** 2 * 0.75,
      phase: Math.random() * Math.PI * 2,
    }));
    let placed = false;

    const frame = (now: number) => {
      const dt = Math.min((now - (last || now)) / 16.67, 3);
      last = now;
      const t = now / 1000;
      const r2 = radius * radius;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of pts) {
        let boost = 0;
        if (!reduced) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (1 - d / radius) ** 2 * swirl * dt;
            const nx = dx / d;
            const ny = dy / d;
            // Outward push plus a tangential kick makes the dust curl around the pointer.
            p.vx += (nx * 0.5 - ny * 1.1) * f + mouse.vx * f * 0.06;
            p.vy += (ny * 0.5 + nx * 1.1) * f + mouse.vy * f * 0.06;
            boost = f;
          }
          const damp = Math.pow(0.95, dt);
          p.vx *= damp;
          p.vy *= damp;
          p.x += (p.vx + Math.sin(t * 0.7 + p.phase) * 0.25 * p.z) * dt;
          p.y += (p.vy - speed * (0.25 + p.z * 0.7)) * dt;
          if (p.y < -20) {
            p.y = h + 20;
            p.x = Math.random() * w;
            p.vx = p.vy = 0;
          } else if (p.y > h + 20) p.y = -20;
          if (p.x < -20) p.x += w + 40;
          else if (p.x > w + 20) p.x -= w + 40;
        }
        // Fade in from the bottom edge and out toward the top.
        const edge = Math.min(1, (p.y + 20) / (h * 0.25), (h + 20 - p.y) / (h * 0.15));
        const s = size * p.z * 6 * (1 + boost * 2);
        ctx.globalAlpha = Math.max(0, edge) * (0.35 + p.z * 0.65);
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;
    };

    const loop = (now: number) => {
      frame(now);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!placed && w) {
        for (const p of pts) {
          p.x *= w;
          p.y *= h;
        }
        placed = true;
      }
      if (reduced) frame(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (mouse.in) {
        mouse.vx = x - mouse.x;
        mouse.vy = y - mouse.y;
      }
      mouse.x = x;
      mouse.y = y;
      mouse.in = true;
    };
    const onLeave = () => {
      mouse.in = false;
      mouse.x = mouse.y = -9999;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
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
  }, [count, color, speed, radius, swirl, size]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
