"use client";

import { useEffect, useRef } from "react";

export interface SwarmCursorProps {
  /** Number of boids. */
  count?: number;
  color?: string;
  /** Color of the fastest boids. */
  accent?: string;
  /** Top speed in px per frame. */
  maxSpeed?: number;
  /** Boid length in px. */
  size?: number;
  /** Leave fading motion trails. */
  trails?: boolean;
  className?: string;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function SwarmCursor({
  count = 160,
  color = "#c6ff3d",
  accent = "#22d3ee",
  maxSpeed = 5,
  size = 7,
  trails = true,
  className,
}: SwarmCursorProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement ?? canvas;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [r1, g1, b1] = hexToRgb(color);
    const [r2, g2, b2] = hexToRgb(accent);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const mouse = { x: 0, y: 0, at: -1e9 };
    const px = new Float32Array(count);
    const py = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    let placed = false;
    // Ring buffer of recent positions for the trails.
    const T = 10;
    const hist = new Float32Array(count * T * 2);
    let ring = 0;
    let filled = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!placed) {
        placed = true;
        for (let i = 0; i < count; i++) {
          px[i] = Math.random() * w;
          py[i] = Math.random() * h;
          const a = Math.random() * Math.PI * 2;
          vx[i] = Math.cos(a) * maxSpeed * 0.5;
          vy[i] = Math.sin(a) * maxSpeed * 0.5;
        }
      }
      if (reduced) draw();
    };

    const step = (now: number) => {
      const t = now / 1000;
      let tx = mouse.x;
      let ty = mouse.y;
      if (now - mouse.at > 1500) {
        tx = w / 2 + Math.sin(t * 0.7) * w * 0.3;
        ty = h / 2 + Math.sin(t * 1.1) * h * 0.28;
      }
      // ponytail: O(n²) neighbour scan, fine to ~400 boids; add a spatial hash beyond that.
      for (let i = 0; i < count; i++) {
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
        for (let j = 0; j < count; j++) {
          if (i === j) continue;
          const dx = px[j] - px[i];
          const dy = py[j] - py[i];
          const d2 = dx * dx + dy * dy;
          if (d2 > 2500) continue;
          n++;
          ax += vx[j];
          ay += vy[j];
          cx += dx;
          cy += dy;
          if (d2 < 400) {
            sx -= dx / (d2 + 1);
            sy -= dy / (d2 + 1);
          }
        }
        let fx = 0;
        let fy = 0;
        if (n) {
          fx += (ax / n - vx[i]) * 0.05 + (cx / n) * 0.002 + sx * 1.6;
          fy += (ay / n - vy[i]) * 0.05 + (cy / n) * 0.002 + sy * 1.6;
        }
        // Seek the target, with a sideways nudge so the swarm orbits instead of collapsing.
        const dx = tx - px[i];
        const dy = ty - py[i];
        const d = Math.hypot(dx, dy) + 1;
        fx += (dx / d) * 0.22 + (-dy / d) * 0.06;
        fy += (dy / d) * 0.22 + (dx / d) * 0.06;
        vx[i] += fx;
        vy[i] += fy;
        const s = Math.hypot(vx[i], vy[i]);
        if (s > maxSpeed) {
          vx[i] *= maxSpeed / s;
          vy[i] *= maxSpeed / s;
        }
        px[i] += vx[i];
        py[i] += vy[i];
        hist[(i * T + ring) * 2] = px[i];
        hist[(i * T + ring) * 2 + 1] = py[i];
      }
      ring = (ring + 1) % T;
      filled = Math.min(T, filled + 1);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (trails && filled > 2) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${r2},${g2},${b2},0.22)`;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          for (let k = 0; k < filled; k++) {
            const j = (i * T + ((ring - filled + k + T) % T)) * 2;
            if (k) ctx.lineTo(hist[j], hist[j + 1]);
            else ctx.moveTo(hist[j], hist[j + 1]);
          }
        }
        ctx.stroke();
      }
      ctx.lineWidth = Math.max(1, size * 0.32);
      for (let i = 0; i < count; i++) {
        const s = Math.hypot(vx[i], vy[i]) || 1;
        const k = Math.min(1, s / maxSpeed);
        ctx.strokeStyle = `rgb(${r1 + (r2 - r1) * k},${g1 + (g2 - g1) * k},${b1 + (b2 - b1) * k})`;
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[i] - (vx[i] / s) * size, py[i] - (vy[i] / s) * size);
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      step(now);
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.at = performance.now();
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

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
    };
  }, [count, color, accent, maxSpeed, size, trails]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
