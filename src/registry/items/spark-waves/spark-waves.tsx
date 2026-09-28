"use client";

import { useEffect, useRef } from "react";

export interface SparkWavesProps {
  /** One color per wave, cycled if there are more waves than colors. */
  colors?: string[];
  /** Number of waves, 1 to 6. */
  waves?: number;
  /** Wave height in px. */
  amplitude?: number;
  /** Animation speed multiplier; 0 freezes the waves. */
  speed?: number;
  /** How eagerly the crests shed sparks. */
  sparkRate?: number;
  /** Core line width in px. */
  lineWidth?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  wave: number;
  seed: number;
}

const MAX_SPARKS = 900;

export function SparkWaves({
  colors = ["#22d3ee", "#a78bfa", "#f472b6"],
  waves = 3,
  amplitude = 70,
  speed = 1,
  sparkRate = 1,
  lineWidth = 1.5,
  className,
}: SparkWavesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pal = (colors.length ? colors : ["#ffffff"]).map(rgb);
  const opts = useRef({ pal, waves, amplitude, speed, sparkRate, lineWidth });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { pal: (colors.length ? colors : ["#ffffff"]).map(rgb), waves, amplitude, speed, sparkRate, lineWidth };
    redraw.current?.();
  }, [colors, waves, amplitude, speed, sparkRate, lineWidth]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sparks: Spark[] = [];
    let w = 0;
    let h = 0;
    let t = 4;
    let raf = 0;
    let last = 0;

    // Normalized wave shape in [-1, 1]; +1 is a crest (highest on screen).
    const shape = (x: number, i: number) =>
      Math.sin(x * 0.0062 + t * (0.9 + i * 0.17) + i * 2.1) * 0.62 +
      Math.sin(x * 0.0023 - t * (0.45 + i * 0.08) + i * 4.3) * 0.38;
    const baseY = (i: number, n: number) => h * 0.5 + (i - (n - 1) / 2) * Math.min(26, h * 0.05);

    const step = (dt: number) => {
      const o = opts.current;
      const n = Math.min(6, Math.max(1, Math.round(o.waves)));
      t += dt;
      // Sample crests and shed sparks where the wave peaks.
      const samples = Math.ceil(w / 14);
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < samples; k++) {
          if (sparks.length >= MAX_SPARKS) break;
          const x = Math.random() * w;
          const c = shape(x, i);
          if (c < 0.55) continue;
          const chance = Math.pow((c - 0.55) / 0.45, 3) * o.sparkRate * dt * 9;
          if (Math.random() > chance) continue;
          const slope = shape(x + 1, i) - c;
          sparks.push({
            x,
            y: baseY(i, n) - c * o.amplitude,
            vx: (Math.random() - 0.5) * 50 - slope * 900,
            vy: -(30 + Math.random() * 90),
            life: 0,
            max: 0.7 + Math.random() * 1.6,
            size: 0.5 + Math.random() * 1.3,
            wave: i,
            seed: Math.random() * 10,
          });
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        s.vy += 38 * dt;
        s.vx *= Math.exp(-dt * 0.8);
        s.vx += Math.sin(t * 2 + s.seed) * 12 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.life > s.max || s.wave >= n) sparks.splice(i, 1);
      }
    };

    const render = () => {
      const o = opts.current;
      const n = Math.min(6, Math.max(1, Math.round(o.waves)));
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < n; i++) {
        const [r, g, b] = o.pal[i % o.pal.length];
        const y0 = baseY(i, n);
        ctx.beginPath();
        for (let x = -8; x <= w + 8; x += 6) {
          const y = y0 - shape(x, i) * o.amplitude;
          if (x < 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        // Layered strokes fake a bloom without shadowBlur.
        ctx.strokeStyle = `rgba(${r},${g},${b},0.05)`;
        ctx.lineWidth = o.lineWidth * 10;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${r},${g},${b},0.16)`;
        ctx.lineWidth = o.lineWidth * 4;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${(r + 255 * 2) / 3 | 0},${(g + 255 * 2) / 3 | 0},${(b + 255 * 2) / 3 | 0},0.9)`;
        ctx.lineWidth = o.lineWidth;
        ctx.stroke();
      }
      for (const s of sparks) {
        const [r, g, b] = o.pal[s.wave % o.pal.length];
        const p = s.life / s.max;
        const a = (1 - p) * (0.65 + 0.35 * Math.sin(s.life * 25 + s.seed * 5));
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.25})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${(r + 255) >> 1},${(g + 255) >> 1},${(b + 255) >> 1},${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      step(dt * opts.current.speed);
      render();
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const first = !w;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Pre-warm so sparks are already in the air on the first frame.
      if (first && w) for (let i = 0; i < 90; i++) step(1 / 60);
      render();
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
      if (!raf) render();
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = undefined;
    };
  }, []);

  const mask = "linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)";
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
