"use client";

import { useEffect, useRef } from "react";

export interface BoltStrikeProps {
  /** Glow color of the bolts and the flash. */
  color?: string;
  /** Storm tempo; higher means more frequent strikes. 0 pauses. */
  speed?: number;
  /** Bolt thickness multiplier. */
  scale?: number;
  /** Strength of the sky flash, 0..1. */
  flash?: number;
  /** How much the bolts fork, 0..1. */
  branching?: number;
  className?: string;
}

type Line = { pts: number[]; w: number };

interface Strike {
  lines: Line[];
  age: number;
  x: number;
  ground: number;
}

/** Jagged polyline from (x, y) heading down-ish, plus recursive forks. */
function grow(x: number, y: number, len: number, angle: number, w: number, fork: number, out: Line[], depth = 0) {
  const pts = [x, y];
  const steps = Math.max(4, Math.round(len / 14));
  const stepLen = len / steps;
  for (let i = 0; i < steps; i++) {
    const a = angle + (Math.random() - 0.5) * 1.3;
    x += Math.sin(a) * stepLen;
    y += Math.cos(a) * stepLen;
    pts.push(x, y);
    if (depth < 3 && Math.random() < fork * 0.09) {
      const side = Math.random() < 0.5 ? -1 : 1;
      grow(x, y, len * (0.2 + Math.random() * 0.3), angle + side * (0.4 + Math.random() * 0.6), w * 0.55, fork, out, depth + 1);
    }
  }
  out.push({ pts, w });
}

function strength(age: number) {
  // A bright stroke, a quick dip, a return stroke, then a fading afterglow.
  const env = Math.exp(-age * 3.5);
  if (age < 0.07) return 1;
  if (age < 0.12) return 0.35 * env;
  if (age < 0.2) return 0.95 * env;
  return env * 0.8;
}

export function BoltStrike({
  color = "#a5b4fc",
  speed = 1,
  scale = 1,
  flash = 0.6,
  branching = 0.6,
  className,
}: BoltStrikeProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, speed, scale, flash, branching });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, speed, scale, flash, branching };
    redraw.current?.();
  }, [color, speed, scale, flash, branching]);

  useEffect(() => {
    const el = host.current!;
    const canvas = el.querySelector("canvas")!;
    const ctx = canvas.getContext("2d");
    const clouds = document.createElement("canvas");
    const cctx = clouds.getContext("2d");
    if (!ctx || !cctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = 1;
    let raf = 0;
    let visible = true;
    let last = 0;
    let strikes: Strike[] = [];
    let wait = 0.6;

    const paintClouds = () => {
      const W = (clouds.width = Math.max(1, Math.round(canvas.width / 4)));
      const H = (clouds.height = Math.max(1, Math.round(canvas.height / 4)));
      cctx.clearRect(0, 0, W, H);
      // Billowy cloud base: many small puffs clustered along a wavy ceiling.
      for (let i = 0; i < 140; i++) {
        const x = Math.random() * W;
        const y = (0.05 + Math.pow(Math.random(), 2) * 0.35 + Math.sin(x / W * 7) * 0.04) * H;
        const r = (0.03 + Math.random() * 0.08) * Math.max(W, H);
        const g = cctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(190,200,255,0.1)");
        g.addColorStop(1, "rgba(190,200,255,0)");
        cctx.fillStyle = g;
        cctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    };

    const strike = (age = 0) => {
      const W = canvas.width;
      const H = canvas.height;
      const x = W * (0.1 + Math.random() * 0.8);
      const ground = H * (0.78 + Math.random() * 0.22);
      const lines: Line[] = [];
      grow(x, -10, ground, (Math.random() - 0.5) * 0.4, 1, opts.current.branching, lines);
      strikes.push({ lines, age, x, ground });
    };

    const draw = () => {
      const o = opts.current;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const lit = strikes.reduce((m, s) => Math.max(m, strength(s.age)), 0);

      // Clouds brighten with each flash.
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(1, 0.22 + lit * 1.5 * o.flash);
      ctx.drawImage(clouds, 0, 0, W, H);

      // Sky flash.
      ctx.globalAlpha = lit * o.flash * 0.22;
      ctx.fillStyle = o.color;
      ctx.fillRect(0, 0, W, H);

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const k = dpr * Math.max(o.scale, 0.1);
      for (const s of strikes) {
        // The leader races down during the first few frames.
        const reach = Math.min(1, s.age / 0.05);
        const I = strength(s.age);
        if (I < 0.01) continue;
        const halo = ctx.createRadialGradient(s.x, 0, 0, s.x, 0, H * 0.7);
        halo.addColorStop(0, o.color);
        halo.addColorStop(1, "transparent");
        ctx.globalAlpha = I * 0.35 * o.flash;
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, W, H);
        for (const [width, alpha, stroke] of [
          [18, 0.08, o.color],
          [6, 0.35, o.color],
          [2, 1, "#ffffff"],
        ] as const) {
          ctx.strokeStyle = stroke;
          for (const l of s.lines) {
            ctx.globalAlpha = I * alpha * (l.w < 1 ? 0.75 : 1);
            ctx.lineWidth = width * k * l.w;
            ctx.beginPath();
            ctx.moveTo(l.pts[0], l.pts[1]);
            for (let i = 2; i < l.pts.length; i += 2) {
              if (l.pts[i + 1] > s.ground * reach) break;
              ctx.lineTo(l.pts[i], l.pts[i + 1]);
            }
            ctx.stroke();
          }
        }
        // Impact glow at the bottom of the main channel.
        if (reach >= 1) {
          const main = s.lines[s.lines.length - 1].pts;
          const gx = main[main.length - 2];
          const gy = main[main.length - 1];
          const r = 90 * k;
          const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
          g.addColorStop(0, o.color);
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = I * 0.5;
          ctx.fillStyle = g;
          ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      const dt = (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      for (const s of strikes) s.age += dt;
      strikes = strikes.filter((s) => s.age < 1.4);
      wait -= dt;
      if (wait <= 0) {
        strike();
        // Occasionally a second bolt follows right away.
        wait = Math.random() < 0.2 ? 0.15 : 1 + Math.random() * 2.8;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      paintClouds();
      strikes = [];
      if (reduced) strike(0.25);
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(el);
    redraw.current = draw;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = null;
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "linear-gradient(180deg, #0b1024 0%, #05060d 70%, #020205 100%)",
      }}
    >
      <canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
