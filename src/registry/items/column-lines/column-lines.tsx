"use client";

import { useEffect, useRef } from "react";

export interface ColumnLinesProps {
  /** Pulse colors, picked at random per pulse. */
  colors?: string[];
  /** Column line color. */
  lineColor?: string;
  /** Distance between columns in px. */
  gap?: number;
  /** Fall speed multiplier; 0 freezes the pulses. */
  speed?: number;
  /** New pulses per second, per 10 columns. */
  frequency?: number;
  className?: string;
}

interface Pulse {
  col: number;
  y: number;
  v: number;
  len: number;
  color: string;
}

const DEFAULT_COLORS = ["#a78bfa", "#f472b6", "#38bdf8"];

export function ColumnLines({
  colors = DEFAULT_COLORS,
  lineColor = "#2f2f35",
  gap = 40,
  speed = 1,
  frequency = 2,
  className,
}: ColumnLinesProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ colors, lineColor, gap, speed, frequency });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { colors, lineColor, gap, speed, frequency };
    redraw.current?.();
  }, [colors, lineColor, gap, speed, frequency]);

  useEffect(() => {
    const el = host.current!;
    const canvas = el.querySelector("canvas")!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = 1;
    let raf = 0;
    let visible = true;
    let last = 0;
    let pulses: Pulse[] = [];
    let budget = 0;

    const geometry = () => {
      const g = Math.max(8, opts.current.gap) * dpr;
      const cols = Math.max(1, Math.floor(canvas.width / g));
      const ox = (canvas.width - (cols - 1) * g) / 2;
      return { g, cols, ox };
    };

    const spawn = (y?: number): Pulse => {
      const { cols } = geometry();
      const H = canvas.height;
      const palette = opts.current.colors.length ? opts.current.colors : DEFAULT_COLORS;
      const len = H * (0.08 + Math.random() * 0.22);
      return {
        col: (Math.random() * cols) | 0,
        y: y ?? -Math.random() * H * 0.1,
        v: H * (0.25 + Math.random() * 0.45),
        len,
        color: palette[(Math.random() * palette.length) | 0],
      };
    };

    const draw = () => {
      const o = opts.current;
      const W = canvas.width;
      const H = canvas.height;
      const { g, cols, ox } = geometry();
      ctx.clearRect(0, 0, W, H);

      // Columns fade out toward the top and bottom edges.
      const fade = ctx.createLinearGradient(0, 0, 0, H);
      fade.addColorStop(0, "transparent");
      fade.addColorStop(0.2, o.lineColor);
      fade.addColorStop(0.8, o.lineColor);
      fade.addColorStop(1, "transparent");
      ctx.fillStyle = fade;
      for (let c = 0; c < cols; c++) ctx.fillRect(Math.round(ox + c * g), 0, dpr, H);

      ctx.globalCompositeOperation = "lighter";
      for (const p of pulses) {
        const x = Math.round(ox + p.col * g) + dpr / 2;
        const head = p.y;
        const tail = p.y - p.len;
        // Edge fade so pulses do not pop in or out.
        const edge = Math.min(1, Math.max(0, head / (H * 0.12)), Math.max(0, (H - tail) / (H * 0.25)));
        ctx.globalAlpha = edge;
        const trail = ctx.createLinearGradient(0, tail, 0, head);
        trail.addColorStop(0, "transparent");
        trail.addColorStop(1, p.color);
        ctx.fillStyle = trail;
        ctx.fillRect(x - 1.5 * dpr, tail, 3 * dpr, p.len);
        ctx.globalAlpha = edge * 0.2;
        ctx.fillRect(x - 8 * dpr, tail + p.len * 0.4, 16 * dpr, p.len * 0.6);
        ctx.globalAlpha = edge;
        const r = 10 * dpr;
        const glow = ctx.createRadialGradient(x, head, 0, x, head, r);
        glow.addColorStop(0, "#ffffff");
        glow.addColorStop(0.25, p.color);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(x - r, head - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const seed = () => {
      const { cols } = geometry();
      pulses = Array.from({ length: Math.round(cols * 0.15 * opts.current.frequency) + 1 }, () =>
        spawn(Math.random() * canvas.height * 1.2),
      );
    };

    const loop = (now: number) => {
      const dt = (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      for (const p of pulses) p.y += p.v * dt;
      pulses = pulses.filter((p) => p.y - p.len < canvas.height);
      // Random arrivals at the requested rate.
      budget += (geometry().cols / 10) * opts.current.frequency * dt;
      while (budget >= 1) {
        budget--;
        if (Math.random() < 0.8) pulses.push(spawn());
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
      seed();
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
