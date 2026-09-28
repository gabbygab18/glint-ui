"use client";

import { useEffect, useRef } from "react";

export interface BarsWaveProps {
  /** Color at the tops of the bars. */
  color?: string;
  /** Color at the base of the bars. */
  accent?: string;
  /** Number of bars across the width. */
  bars?: number;
  /** Wave speed multiplier; 0 freezes the wave. */
  speed?: number;
  /** Wave height, 0..1 of the container. */
  amplitude?: number;
  /** Glow strength. */
  glow?: number;
  className?: string;
}

export function BarsWave({
  color = "#67e8f9",
  accent = "#7c3aed",
  bars = 64,
  speed = 1,
  amplitude = 0.6,
  glow = 1,
  className,
}: BarsWaveProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, accent, bars, speed, amplitude, glow });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, accent, bars, speed, amplitude, glow };
    redraw.current?.();
  }, [color, accent, bars, speed, amplitude, glow]);

  useEffect(() => {
    const el = host.current!;
    const canvas = el.querySelector("canvas")!;
    const ctx = canvas.getContext("2d");
    // Low-res copy of the bars; scaled up it becomes a cheap soft glow.
    const haze = document.createElement("canvas");
    const hctx = haze.getContext("2d");
    if (!ctx || !hctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const HAZE = 10;

    let raf = 0;
    let visible = true;
    let last = 0;
    let time = 3;
    let jitter = new Float32Array(0);
    let jitterTarget = new Float32Array(0);

    const heights = (n: number, t: number) => {
      if (jitter.length !== n) {
        jitter = new Float32Array(n);
        jitterTarget = new Float32Array(n);
      }
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = i / n;
        // Two rolling swells plus a slow breathing term, then per-bar equalizer jitter.
        const a = Math.sin(x * 9 - t * 1.6);
        const b = Math.sin(x * 4.3 - t * 0.9 + 1.7);
        const c = Math.sin(x * 17 - t * 2.7) * 0.35;
        const v = 0.5 + 0.28 * a + 0.2 * b + 0.12 * c;
        out[i] = Math.min(1, Math.max(0.03, v * (0.82 + jitter[i] * 0.3)));
      }
      return out;
    };

    const bar = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
      const r = Math.min(w / 2, h);
      c.beginPath();
      c.moveTo(x, y + h);
      c.lineTo(x, y + r);
      c.arc(x + w / 2, y + r, w / 2, Math.PI, 0);
      c.lineTo(x + w, y + h);
      c.closePath();
    };

    const draw = () => {
      const o = opts.current;
      const W = canvas.width;
      const H = canvas.height;
      const n = Math.max(4, Math.round(o.bars));
      const hs = heights(n, time);
      const pitch = W / n;
      const bw = Math.max(1, pitch * 0.58);
      const floor = H * 0.92;
      const maxH = floor * Math.min(Math.max(o.amplitude, 0), 1);

      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, floor - maxH, 0, floor);
      grad.addColorStop(0, o.color);
      grad.addColorStop(1, o.accent);

      // Glow pass: draw the bars small, then stretch them back up.
      if (o.glow > 0) {
        const s = 1 / HAZE;
        hctx.setTransform(1, 0, 0, 1, 0, 0);
        hctx.clearRect(0, 0, haze.width, haze.height);
        hctx.setTransform(s, 0, 0, s, 0, 0);
        const hg = hctx.createLinearGradient(0, floor - maxH, 0, floor);
        hg.addColorStop(0, o.color);
        hg.addColorStop(1, o.accent);
        hctx.fillStyle = hg;
        // Blurring the small buffer is far cheaper than blurring the full canvas.
        hctx.filter = `blur(${((pitch * 1.2) / HAZE).toFixed(2)}px)`;
        for (let i = 0; i < n; i++) {
          const h = hs[i] * maxH;
          hctx.fillRect(i * pitch + (pitch - bw) / 2, floor - h, bw, h);
        }
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.globalAlpha = Math.min(o.glow, 2) * 0.8;
        ctx.drawImage(haze, 0, 0, haze.width * HAZE, haze.height * HAZE);
        ctx.restore();
      }

      // Crisp bars.
      ctx.fillStyle = grad;
      for (let i = 0; i < n; i++) {
        const h = hs[i] * maxH;
        bar(ctx, i * pitch + (pitch - bw) / 2, floor - h, bw, h);
        ctx.fill();
      }
      // Bright caps.
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < n; i++) {
        const h = hs[i] * maxH;
        const x = i * pitch + (pitch - bw) / 2;
        ctx.fillRect(x + bw * 0.2, floor - h + bw * 0.25, bw * 0.6, Math.max(1, bw * 0.12));
      }
      // Faint mirrored reflection below the floor.
      ctx.save();
      ctx.globalAlpha = 0.22;
      const rg = ctx.createLinearGradient(0, floor, 0, H);
      rg.addColorStop(0, o.accent);
      rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg;
      for (let i = 0; i < n; i++) {
        const h = Math.min(hs[i] * maxH * 0.4, H - floor);
        ctx.fillRect(i * pitch + (pitch - bw) / 2, floor + 2, bw, h);
      }
      ctx.restore();
    };

    const loop = (now: number) => {
      const dt = (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      time += dt;
      const k = 1 - Math.exp(-dt * 6);
      for (let i = 0; i < jitter.length; i++) {
        if (Math.random() < dt * 3) jitterTarget[i] = Math.random() * 2 - 1;
        jitter[i] += (jitterTarget[i] - jitter[i]) * k;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      haze.width = Math.max(1, Math.ceil(canvas.width / HAZE));
      haze.height = Math.max(1, Math.ceil(canvas.height / HAZE));
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
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
