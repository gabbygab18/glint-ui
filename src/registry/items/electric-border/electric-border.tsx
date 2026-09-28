"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ElectricBorderProps {
  children: ReactNode;
  color?: string;
  /** Animation speed multiplier. */
  speed?: number;
  /** How far the arcs stray from the edge. */
  chaos?: number;
  /** Line width in px. */
  thickness?: number;
  /** Corner radius in px. */
  radius?: number;
  className?: string;
}

const PAD = 48;
const HARMONICS = [3, 5, 8, 13, 21, 34, 55, 89];

// Points along a rounded rect (centred on the element's edge) with outward normals.
function outline(w: number, h: number, r: number, gap: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const pts: number[] = [];
  const line = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / gap));
    for (let i = 0; i < n; i++) pts.push(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, nx, ny);
  };
  const arc = (cx: number, cy: number, a0: number) => {
    const n = Math.max(1, Math.round((r * Math.PI) / 2 / gap));
    for (let i = 0; i < n; i++) {
      const a = a0 + ((Math.PI / 2) * i) / n;
      pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a));
    }
  };
  line(r, 0, w - r, 0, 0, -1);
  arc(w - r, r, -Math.PI / 2);
  line(w, r, w, h - r, 1, 0);
  arc(w - r, h - r, 0);
  line(w - r, h, r, h, 0, 1);
  arc(r, h - r, Math.PI / 2);
  line(0, h - r, 0, r, -1, 0);
  arc(r, r, Math.PI);
  return pts;
}

export function ElectricBorder({
  children,
  color = "#7df9ff",
  speed = 1,
  chaos = 1,
  thickness = 2,
  radius = 24,
  className,
}: ElectricBorderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Two strands, each a sum of harmonics that divide the perimeter evenly, so the loop has no seam.
    const strands = [0, 1].map((s) =>
      HARMONICS.map((k, i) => ({
        k,
        amp: 1 / Math.pow(k, 0.55),
        phase: (s * 7.3 + i * 2.39) % (Math.PI * 2),
        vel: (i % 2 ? 1 : -1) * (1.2 + i * 0.55) * (s ? 1.35 : 1),
      })),
    );
    const norm = strands[0].reduce((a, h) => a + h.amp, 0);
    let pts: number[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const draw = (now: number) => {
      const t = reduced ? 0 : (now / 1000) * speed;
      const n = pts.length / 4;
      const amp = 7 * chaos;
      ctx.clearRect(0, 0, w + PAD * 2, h + PAD * 2);
      ctx.lineJoin = "round";
      strands.forEach((harm, si) => {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const j = (i % n) * 4;
          const u = (i / n) * Math.PI * 2;
          let d = 0;
          for (const hm of harm) d += hm.amp * Math.sin(hm.k * u + hm.phase + hm.vel * t);
          d = (d / norm) * amp * (si ? 1.4 : 1);
          const x = PAD + pts[j] + pts[j + 2] * d;
          const y = PAD + pts[j + 1] + pts[j + 3] * d;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        const flicker = reduced ? 1 : 0.8 + Math.random() * 0.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = color;
        ctx.globalAlpha = (si ? 0.45 : 1) * flicker;
        ctx.lineWidth = thickness * (si ? 0.7 : 1);
        ctx.stroke();
        if (!si) {
          // Hot white core on the main strand.
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#fff";
          ctx.globalAlpha = 0.75 * flicker;
          ctx.lineWidth = Math.max(0.6, thickness * 0.4);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };

    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = root.offsetWidth;
      h = root.offsetHeight;
      canvas.width = (w + PAD * 2) * dpr;
      canvas.height = (h + PAD * 2) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = outline(w, h, radius, 3);
      draw(performance.now());
    });
    ro.observe(root);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [color, speed, chaos, thickness, radius]);

  return (
    <div ref={rootRef} className={cn("relative", className)} style={{ borderRadius: radius }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          pointerEvents: "none",
          boxShadow: `0 0 32px -6px ${color}, inset 0 0 28px -12px ${color}`,
          opacity: 0.6,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          left: -PAD,
          top: -PAD,
          width: `calc(100% + ${PAD * 2}px)`,
          height: `calc(100% + ${PAD * 2}px)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div style={{ position: "relative", borderRadius: radius }}>{children}</div>
    </div>
  );
}
