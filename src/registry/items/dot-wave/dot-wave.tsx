"use client";

import { useEffect, useRef } from "react";

export interface DotWaveProps {
  /** Color of the nearest dots. */
  color?: string;
  /** Color the dots blend toward on the horizon. */
  farColor?: string;
  /** Animation speed multiplier; 0 freezes the wave. */
  speed?: number;
  /** Wave height. */
  amplitude?: number;
  /** Wave length multiplier; higher means tighter ripples. */
  scale?: number;
  /** Distance between dots; lower is denser. */
  spacing?: number;
  /** Radius of the nearest dots in px. */
  dotSize?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const Z_NEAR = 0.55;
const Z_FAR = 7;
const CAM_H = 0.5;

export function DotWave({
  color = "#5eead4",
  farColor = "#818cf8",
  speed = 1,
  amplitude = 1,
  scale = 1,
  spacing = 1,
  dotSize = 2.4,
  className,
}: DotWaveProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ a: rgb(color), b: rgb(farColor), speed, amplitude, scale, spacing, dotSize });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { a: rgb(color), b: rgb(farColor), speed, amplitude, scale, spacing, dotSize };
    redraw.current?.();
  }, [color, farColor, speed, amplitude, scale, spacing, dotSize]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let t = 3;
    let raf = 0;
    let last = 0;

    const wave = (x: number, z: number, k: number) =>
      Math.sin(x * 1.1 * k + t * 1.2) * 0.5 +
      Math.sin(z * 1.4 * k - t * 1.5) * 0.6 +
      Math.sin((x * 0.7 + z) * 0.9 * k + t * 0.8) * 0.45;

    const draw = (dt: number) => {
      const o = opts.current;
      t += dt * o.speed;
      ctx.clearRect(0, 0, w, h);
      const f = h * 0.95;
      const horizon = h * 0.28;
      const step = 0.11 * Math.max(o.spacing, 0.3);
      const amp = 0.13 * o.amplitude;
      const k = o.scale;
      const rows = Math.ceil((Z_FAR - Z_NEAR) / step);

      // Far rows first so near dots paint on top.
      for (let r = rows; r >= 0; r--) {
        const z = Z_NEAR + r * step;
        const depth = (z - Z_NEAR) / (Z_FAR - Z_NEAR);
        const alpha = Math.pow(1 - depth, 1.4) * Math.min(1, (z - Z_NEAR) / 0.3 + 0.35);
        if (alpha < 0.01) continue;
        const pz = f / z;
        const rad = Math.max(0.45, (o.dotSize * Z_NEAR) / z);
        const halfX = (w * 0.5 + rad) / pz;
        const c0 = Math.ceil(-halfX / step);
        const c1 = Math.floor(halfX / step);
        const mix = Math.pow(depth, 0.7);
        const cr = Math.round(o.a[0] + (o.b[0] - o.a[0]) * mix);
        const cg = Math.round(o.a[1] + (o.b[1] - o.a[1]) * mix);
        const cb = Math.round(o.a[2] + (o.b[2] - o.a[2]) * mix);

        // Two paths per row: regular dots and brighter crest dots.
        ctx.beginPath();
        let crest = false;
        for (let c = c0; c <= c1; c++) {
          const x = c * step;
          const v = wave(x, z, k);
          if (v > 0.75) {
            crest = true;
            continue;
          }
          const sx = w * 0.5 + x * pz;
          const sy = horizon + (CAM_H - v * amp) * pz;
          ctx.moveTo(sx + rad, sy);
          ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha * 0.8})`;
        ctx.fill();

        if (crest) {
          ctx.beginPath();
          for (let c = c0; c <= c1; c++) {
            const x = c * step;
            const v = wave(x, z, k);
            if (v <= 0.75) continue;
            const sx = w * 0.5 + x * pz;
            const sy = horizon + (CAM_H - v * amp) * pz;
            ctx.moveTo(sx + rad * 1.15, sy);
            ctx.arc(sx, sy, rad * 1.15, 0, Math.PI * 2);
          }
          ctx.fillStyle = `rgba(${(cr + 255) >> 1},${(cg + 255) >> 1},${(cb + 255) >> 1},${alpha})`;
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      draw(last ? Math.min((now - last) / 1000, 0.1) : 0);
      last = now;
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (e.isIntersecting && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    redraw.current = () => {
      if (!raf) draw(0);
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = undefined;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        maskImage: "linear-gradient(to bottom, transparent 20%, #000 45%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 20%, #000 45%)",
      }}
    />
  );
}
