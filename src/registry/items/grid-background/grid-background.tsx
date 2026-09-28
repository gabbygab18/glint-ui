"use client";

import { useEffect, useRef } from "react";

export interface GridBackgroundProps {
  /** Px per cell. */
  cellSize?: number;
  /** Glow color of lit cells. */
  color?: string;
  /** Grid line color. */
  lineColor?: string;
  /** Fraction of cells lit at any moment, 0 to 0.3. */
  density?: number;
  /** Fade speed multiplier; 0 freezes the grid. */
  speed?: number;
  /** Radius of the visible area as a fraction of the box, fades out past it. */
  fade?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Blip {
  i: number;
  j: number;
  age: number;
  dur: number;
}

export function GridBackground({
  cellSize = 36,
  color = "#c6ff3d",
  lineColor = "#52525b",
  density = 0.05,
  speed = 1,
  fade = 0.75,
  className,
}: GridBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ cellSize, c: rgb(color), line: rgb(lineColor), density, speed });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { cellSize, c: rgb(color), line: rgb(lineColor), density, speed };
    redraw.current?.();
  }, [cellSize, color, lineColor, density, speed]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blips: Blip[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;

    const newBlip = (cols: number, rows: number, age = 0): Blip => ({
      i: Math.floor(Math.random() * cols),
      j: Math.floor(Math.random() * rows),
      age,
      dur: 1.6 + Math.random() * 2.8,
    });

    const draw = (dt: number) => {
      const o = opts.current;
      const s = Math.max(8, o.cellSize);
      // Center the grid so the radial fade frames it symmetrically.
      const ox = ((w / 2) % s) - s;
      const oy = ((h / 2) % s) - s;
      const cols = Math.ceil((w - ox) / s);
      const rows = Math.ceil((h - oy) / s);
      const target = Math.round(cols * rows * Math.min(Math.max(o.density, 0), 0.3));
      while (blips.length < target) blips.push(newBlip(cols, rows, Math.random() * 3));
      blips.length = Math.min(blips.length, target);

      ctx.clearRect(0, 0, w, h);
      const [cr, cg, cb] = o.c;
      for (let k = 0; k < blips.length; k++) {
        const b = blips[k];
        b.age += dt * o.speed;
        if (b.age >= b.dur) {
          blips[k] = newBlip(cols, rows);
          continue;
        }
        const p = b.age / b.dur;
        // Quick swell, long tail.
        const a = Math.sin(Math.PI * Math.pow(p, 0.6)) ** 2;
        if (a < 0.01) continue;
        const x = ox + b.i * s;
        const y = oy + b.j * s;
        const g = ctx.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, s * 1.6);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${0.22 * a})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - s, y - s, s * 3, s * 3);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.16 * a})`;
        ctx.fillRect(x + 1, y + 1, s - 1, s - 1);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.75 * a})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, s, s);
      }

      const [lr, lg, lb] = o.line;
      ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.55)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = ox; x <= w; x += s) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = oy; y <= h; y += s) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(w, Math.round(y) + 0.5);
      }
      ctx.stroke();
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
      blips.length = 0;
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

  const mask = `radial-gradient(ellipse ${fade * 100}% ${fade * 100}% at 50% 50%, #000 20%, transparent 70%)`;
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
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
