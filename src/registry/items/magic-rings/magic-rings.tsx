"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagicRingsProps {
  /** Number of concentric rings. */
  rings?: number;
  /** Color of the innermost ring. */
  colorFrom?: string;
  /** Color of the outermost ring. */
  colorTo?: string;
  /** Rotation speed multiplier. */
  speed?: number;
  /** How far rings bend toward the cursor, in px. */
  pull?: number;
  /** Stroke width in px. */
  lineWidth?: number;
  className?: string;
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const TAU = Math.PI * 2;
const SEG = 160;

export function MagicRings({
  rings = 7,
  colorFrom = "#22d3ee",
  colorTo = "#a855f7",
  speed = 1,
  pull = 34,
  lineWidth = 2,
  className,
}: MagicRingsProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = rgb(colorFrom);
    const b = rgb(colorTo);
    const ring = Array.from({ length: rings }, (_, i) => {
      const k = rings > 1 ? i / (rings - 1) : 0;
      const c = a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(",");
      // Alternate directions, deterministic speeds so it looks the same every load.
      const dir = i % 2 ? -1 : 1;
      const rand = Math.abs(Math.sin(i * 12.9898 + 1) * 43758.5453) % 1;
      return { k, c, dir, rate: dir * (0.2 + 0.5 * rand), rot: i * 1.7 };
    });
    const m = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let prev = performance.now();
    let t = 0;

    const frame = () => {
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      m.on += (m.ton - m.on) * 0.05;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      const cx = w / 2;
      const cy = h / 2;
      const min = Math.min(w, h);
      const r0 = min * 0.17;
      const r1 = min * 0.46;
      const mdx = m.x - cx;
      const mdy = m.y - cy;
      const md = Math.hypot(mdx, mdy);
      const ma = Math.atan2(mdy, mdx);
      for (let i = 0; i < ring.length; i++) {
        const R = ring[i];
        const base = r0 + (r1 - r0) * R.k + Math.sin(t * 1.4 - i * 0.6) * 3;
        // Rings near the cursor distance bend the most, bulging outward or inward toward it.
        const reach = m.on * pull * Math.sign(md - base) * Math.exp(-Math.abs(md - base) / (min * 0.2));
        ctx.beginPath();
        for (let s = 0; s <= SEG; s++) {
          const th = (s / SEG) * TAU;
          let da = Math.abs(th - ma) % TAU;
          if (da > Math.PI) da = TAU - da;
          const r = base + reach * Math.exp(-(da * da) / 0.3) + Math.sin(th * 3 + t * (1 + R.k) + i) * 2.2;
          const x = cx + Math.cos(th) * r;
          const y = cy + Math.sin(th) * r;
          if (s) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        // Soft bloom pass, then a rotating comet gradient on top.
        ctx.strokeStyle = `rgba(${R.c},0.045)`;
        ctx.lineWidth = lineWidth * 7;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${R.c},0.12)`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        const g = ctx.createConicGradient(R.rot, cx, cy);
        const head = `rgba(${R.c},1)`;
        const tail = `rgba(${R.c},0)`;
        if (R.dir > 0) {
          g.addColorStop(0, tail);
          g.addColorStop(0.55, tail);
          g.addColorStop(0.97, head);
          g.addColorStop(1, "rgba(255,255,255,1)");
        } else {
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.03, head);
          g.addColorStop(0.45, tail);
          g.addColorStop(1, tail);
        }
        ctx.strokeStyle = g;
        ctx.lineWidth = lineWidth * 1.4;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      const dt = Math.min(now - prev, 50) / 1000;
      prev = now;
      t += dt;
      for (const R of ring) R.rot += R.rate * speed * dt;
      frame();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      m.x = m.tx = w / 2;
      m.y = m.ty = h / 2;
      frame();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.tx = e.clientX - r.left;
      m.ty = e.clientY - r.top;
      m.ton = 1;
      if (reduced) frame();
    };
    const onLeave = () => (m.ton = 0);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [rings, colorFrom, colorTo, speed, pull, lineWidth]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
