"use client";

import { useEffect, useRef } from "react";

export interface WavesProps {
  /** Color of the top lines. */
  color?: string;
  /** Color of the bottom lines; the rest blend between. */
  accentColor?: string;
  /** Px between lines. */
  gap?: number;
  /** Wave height multiplier. */
  amplitude?: number;
  /** Flow speed multiplier; 0 freezes the motion. */
  speed?: number;
  /** Stroke width in px. */
  lineWidth?: number;
  /** How far the cursor drags the lines, 0 to disable. */
  cursorForce?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = (hex || "#000").replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Seeded 2D gradient noise in roughly [-1, 1]. */
function makeNoise(seed: number) {
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h: number, x: number, y: number) => {
    const a = (h & 7) * 0.7853981634;
    return Math.cos(a) * x + Math.sin(a) * y;
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = grad(aa, xf, yf) + (grad(ba, xf - 1, yf) - grad(aa, xf, yf)) * u;
    const x2 = grad(ab, xf, yf - 1) + (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1)) * u;
    return (x1 + (x2 - x1) * v) * 1.4;
  };
}

export function Waves({
  color = "#38bdf8",
  accentColor = "#a78bfa",
  gap = 14,
  amplitude = 1,
  speed = 1,
  lineWidth = 1,
  cursorForce = 1,
  className,
}: WavesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ color, accentColor, gap, amplitude, speed, lineWidth, cursorForce });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, accentColor, gap, amplitude, speed, lineWidth, cursorForce };
    redraw.current?.();
  }, [color, accentColor, gap, amplitude, speed, lineWidth, cursorForce]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const noise = makeNoise(1337);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = 10;
    const m = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
    let w = 0;
    let h = 0;
    let rows = 0;
    let cols = 0;
    let builtGap = 0;
    // Per-point spring offsets the cursor pushes around.
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let time = 0;
    let last = 0;

    const build = () => {
      builtGap = Math.max(4, opts.current.gap);
      rows = Math.ceil(h / builtGap) + 6;
      cols = Math.ceil(w / step) + 3;
      const n = rows * cols;
      ox = new Float32Array(n);
      oy = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
    };

    const physics = () => {
      const f = opts.current.cursorForce;
      const r = 150;
      const g = builtGap;
      for (let j = 0; j < rows; j++) {
        const y0 = (j - 3) * g;
        if (Math.abs(y0 - m.y) > r + 60) {
          // Still settle rows the cursor left behind.
          for (let i = 0, k = j * cols; i < cols; i++, k++) {
            vx[k] = (vx[k] - ox[k] * 0.03) * 0.9;
            vy[k] = (vy[k] - oy[k] * 0.03) * 0.9;
            ox[k] += vx[k];
            oy[k] += vy[k];
          }
          continue;
        }
        for (let i = 0, k = j * cols; i < cols; i++, k++) {
          const x0 = (i - 1) * step;
          const dx = x0 + ox[k] - m.x;
          const dy = y0 + oy[k] - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r * r && f > 0) {
            const t = 1 - Math.sqrt(d2) / r;
            const s = t * t * f;
            vx[k] += m.vx * s * 0.12;
            vy[k] += m.vy * s * 0.12;
          }
          vx[k] = (vx[k] - ox[k] * 0.03) * 0.9;
          vy[k] = (vy[k] - oy[k] * 0.03) * 0.9;
          ox[k] += vx[k];
          oy[k] += vy[k];
        }
      }
    };

    const draw = () => {
      const o = opts.current;
      if (Math.max(4, o.gap) !== builtGap) build();
      const a = rgb(o.color);
      const b = rgb(o.accentColor);
      const g = builtGap;
      const amp = 34 * o.amplitude;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = o.lineWidth;
      ctx.lineJoin = "round";
      for (let j = 0; j < rows; j++) {
        const y0 = (j - 3) * g;
        const k = Math.min(1, Math.max(0, y0 / Math.max(h, 1)));
        // Lines fade toward the top and bottom edges.
        const alpha = 0.18 + 0.5 * Math.sin(Math.PI * k);
        const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
        ctx.strokeStyle = `rgba(${c},${alpha.toFixed(3)})`;
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i;
          const x0 = (i - 1) * step;
          const n1 = noise(x0 * 0.0021 + time * 0.09, y0 * 0.0035 + time * 0.05);
          const n2 = noise(x0 * 0.006 - time * 0.12 + 40, y0 * 0.006 + 17);
          const x = x0 + ox[idx];
          const y = y0 + oy[idx] + n1 * amp + n2 * amp * 0.25;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      if (m.px > -9000) {
        m.vx = m.x - m.px;
        m.vy = m.y - m.py;
      }
      m.px = m.x;
      m.py = m.y;
      physics();
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      draw();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
    };
    const onLeave = () => {
      m.x = m.y = m.px = m.py = -9999;
      m.vx = m.vy = 0;
    };

    const target = canvas.parentElement ?? canvas;
    target.addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);
    redraw.current = draw;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      redraw.current = null;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
