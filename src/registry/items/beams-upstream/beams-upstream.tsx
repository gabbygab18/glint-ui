"use client";

import { useEffect, useRef } from "react";

export interface BeamsUpstreamProps {
  /** Beam color. */
  color?: string;
  /** Grid line color. */
  gridColor?: string;
  /** Grid cell size in px. */
  gap?: number;
  /** Rise speed multiplier; 0 freezes the beams. */
  speed?: number;
  /** Average number of beams on screen per 10 grid columns. */
  density?: number;
  /** Beam length as a fraction of the container height. */
  length?: number;
  className?: string;
}

interface Beam {
  col: number;
  y: number;
  v: number;
  len: number;
  life: number;
}

export function BeamsUpstream({
  color = "#38bdf8",
  gridColor = "#334155",
  gap = 56,
  speed = 1,
  density = 4,
  length = 0.28,
  className,
}: BeamsUpstreamProps) {
  const host = useRef<HTMLDivElement>(null);
  const opts = useRef({ color, gridColor, gap, speed, density, length });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, gridColor, gap, speed, density, length };
    redraw.current?.();
  }, [color, gridColor, gap, speed, density, length]);

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
    let beams: Beam[] = [];

    const geometry = () => {
      const g = Math.max(12, opts.current.gap) * dpr;
      const cols = Math.floor(canvas.width / g) + 1;
      const ox = (canvas.width - (cols - 1) * g) / 2;
      const oy = (canvas.height % g) / 2;
      return { g, cols, ox, oy };
    };

    const spawn = (anywhere: boolean): Beam => {
      const { cols } = geometry();
      const H = canvas.height;
      const len = H * opts.current.length * (0.6 + Math.random() * 0.8);
      return {
        col: (Math.random() * cols) | 0,
        y: anywhere ? Math.random() * (H + len) : H + len * Math.random(),
        v: H * (0.18 + Math.random() * 0.3),
        len,
        life: 0.55 + Math.random() * 0.45,
      };
    };

    const target = () => {
      const { cols } = geometry();
      return Math.max(1, Math.round((cols / 10) * opts.current.density));
    };

    const draw = () => {
      const o = opts.current;
      const W = canvas.width;
      const H = canvas.height;
      const { g, ox, oy, cols } = geometry();
      ctx.clearRect(0, 0, W, H);

      // Grid.
      ctx.strokeStyle = o.gridColor;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = dpr;
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        const x = Math.round(ox + c * g) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = oy; y <= H; y += g) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(W, Math.round(y) + 0.5);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Beams: a fading tail below a bright head, drawn additively.
      ctx.globalCompositeOperation = "lighter";
      for (const b of beams) {
        const x = Math.round(ox + b.col * g) + 0.5;
        const top = b.y;
        const bottom = b.y + b.len;
        const tail = ctx.createLinearGradient(0, top, 0, bottom);
        tail.addColorStop(0, o.color);
        tail.addColorStop(1, "transparent");
        ctx.globalAlpha = b.life;
        ctx.fillStyle = tail;
        ctx.fillRect(x - 3 * dpr, top, 6 * dpr, b.len);
        ctx.globalAlpha = b.life * 0.25;
        ctx.fillRect(x - 10 * dpr, top, 20 * dpr, b.len * 0.6);
        ctx.globalAlpha = b.life;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 0.75 * dpr, top, 1.5 * dpr, b.len * 0.35);
        // Head glow.
        const r = 14 * dpr;
        const head = ctx.createRadialGradient(x, top, 0, x, top, r);
        head.addColorStop(0, o.color);
        head.addColorStop(1, "transparent");
        ctx.fillStyle = head;
        ctx.fillRect(x - r, top - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const seed = () => {
      beams = Array.from({ length: target() }, () => spawn(true));
    };

    const loop = (now: number) => {
      const dt = (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
      for (const b of beams) b.y -= b.v * dt;
      beams = beams.filter((b) => b.y + b.len > 0);
      const want = target();
      // Top up gradually so beams stagger instead of arriving in waves.
      if (beams.length < want && Math.random() < 0.25) beams.push(spawn(false));
      if (beams.length > want) beams.length = want;
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
      <canvas
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          maskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, #000 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, #000 35%, transparent 100%)",
        }}
      />
    </div>
  );
}
