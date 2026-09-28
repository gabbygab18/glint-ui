"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagnetLinesProps {
  /** Px between line centers. */
  gap?: number;
  /** Line length in px. */
  lineLength?: number;
  /** Line thickness in px. */
  lineWidth?: number;
  /** Idle line color. */
  color?: string;
  /** Color of lines close to the cursor. */
  activeColor?: string;
  /** Px radius in which lines light up and stretch. */
  radius?: number;
  className?: string;
}

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function MagnetLines({
  gap = 30,
  lineLength = 16,
  lineWidth = 2,
  color = "#3f3f46",
  activeColor = "#c6ff3d",
  radius = 220,
  className,
}: MagnetLinesProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = rgb(color);
    const hot = rgb(activeColor);
    // Pre-build a 32-step color ramp so the frame loop never formats strings per line.
    const ramp = Array.from({ length: 33 }, (_, i) => `rgb(${base.map((b, j) => Math.round(b + (hot[j] - b) * (i / 32))).join(",")})`);
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let ang = new Float32Array(0);
    let heat = new Float32Array(0);
    const m = { x: 0, y: 0, on: false };
    let raf = 0;
    let visible = true;

    const frame = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineWidth = lineWidth;
      // With no cursor, lines follow a slow orbiting attractor so the grid never looks dead.
      const t = time / 1000;
      const tx = m.on ? m.x : w / 2 + Math.cos(t * 0.5) * w * 0.3;
      const ty = m.on ? m.y : h / 2 + Math.sin(t * 0.7) * h * 0.3;
      const k = reduced ? 1 : 0.14;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = ox + c * gap;
          const y = oy + r * gap;
          const dx = tx - x;
          const dy = ty - y;
          const target = Math.atan2(dy, dx);
          let d = target - ang[i];
          d = Math.atan2(Math.sin(d), Math.cos(d)); // shortest way round
          ang[i] += d * k;
          const near = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
          heat[i] += ((m.on ? near : near * 0.6) - heat[i]) * k;
          const len = (lineLength / 2) * (1 + heat[i] * 0.6);
          const cx = Math.cos(ang[i]) * len;
          const cy = Math.sin(ang[i]) * len;
          ctx.strokeStyle = ramp[Math.round(heat[i] * 32)];
          ctx.beginPath();
          ctx.moveTo(x - cx, y - cy);
          ctx.lineTo(x + cx, y + cy);
          ctx.stroke();
        }
      }
    };

    const loop = (time: number) => {
      frame(time);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / gap));
      rows = Math.max(1, Math.floor(h / gap));
      ox = (w - (cols - 1) * gap) / 2;
      oy = (h - (rows - 1) * gap) / 2;
      ang = new Float32Array(cols * rows).fill(-Math.PI / 4);
      heat = new Float32Array(cols * rows);
      frame(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
      m.on = true;
      if (reduced) frame(0);
    };
    const onLeave = () => (m.on = false);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
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
  }, [gap, lineLength, lineWidth, color, activeColor, radius]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
