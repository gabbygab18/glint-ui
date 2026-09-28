"use client";

import { useEffect, useRef } from "react";

export interface MovingLinesProps {
  /** Base line color. */
  color?: string;
  /** Color of the traveling highlights. */
  highlightColor?: string;
  /** Px between lines. */
  gap?: number;
  /** Line angle in degrees. */
  angle?: number;
  /** Drift speed multiplier; 0 freezes the lines. */
  speed?: number;
  /** Highlights launched per second. */
  highlights?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Stable per-line brightness so lines differ without flickering.
const lineHash = (m: number) => {
  const s = Math.sin(m * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

interface Highlight {
  m: number;
  y: number;
  v: number;
  len: number;
}

export function MovingLines({
  color = "#71717a",
  highlightColor = "#67e8f9",
  gap = 26,
  angle = 35,
  speed = 1,
  highlights = 2.5,
  className,
}: MovingLinesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ c: rgb(color), hl: rgb(highlightColor), gap, angle, speed, highlights });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { c: rgb(color), hl: rgb(highlightColor), gap, angle, speed, highlights };
    redraw.current?.();
  }, [color, highlightColor, gap, angle, speed, highlights]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lights: Highlight[] = [];
    let w = 0;
    let h = 0;
    let offset = 0;
    let carry = 0;
    let raf = 0;
    let last = 0;

    const draw = (dt: number) => {
      const o = opts.current;
      const g = Math.max(4, o.gap);
      const half = Math.hypot(w, h) / 2;
      offset += dt * o.speed * 14;

      // Launch and advance highlights in the rotated frame (lines run along y).
      carry += dt * o.speed * o.highlights;
      while (carry >= 1 || (dt === 0 && lights.length < Math.round(o.highlights * 1.5))) {
        if (carry >= 1) carry -= 1;
        const m = Math.floor((Math.random() * 2 - 1) * (half / g) - offset / g);
        const len = 90 + Math.random() * 200;
        const v = (220 + Math.random() * 380) * (Math.random() < 0.5 ? -1 : 1);
        const y = dt === 0 ? (Math.random() * 2 - 1) * half : v > 0 ? -half - len : half + len;
        lights.push({ m, y, v, len });
      }
      for (let i = lights.length - 1; i >= 0; i--) {
        const l = lights[i];
        l.y += l.v * dt * o.speed;
        const x = l.m * g + offset;
        if (Math.abs(l.y) > half + l.len * 1.2 || Math.abs(x) > half + g) lights.splice(i, 1);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = canvas.width / Math.max(w, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(w / 2, h / 2);
      ctx.rotate((o.angle * Math.PI) / 180);

      // Base lines, bucketed into three brightness levels.
      const [r, gg, b] = o.c;
      const m0 = Math.floor((-half - offset) / g);
      const m1 = Math.ceil((half - offset) / g);
      ctx.lineWidth = 1;
      for (let bucket = 0; bucket < 3; bucket++) {
        ctx.beginPath();
        for (let m = m0; m <= m1; m++) {
          if (Math.floor(lineHash(m) * 3) !== bucket) continue;
          const x = m * g + offset;
          ctx.moveTo(x, -half);
          ctx.lineTo(x, half);
        }
        ctx.strokeStyle = `rgba(${r},${gg},${b},${0.14 + bucket * 0.1})`;
        ctx.stroke();
      }

      // Highlights: a bright head with a long fading tail plus a soft halo.
      const [hr, hg, hb] = o.hl;
      ctx.lineCap = "round";
      for (const l of lights) {
        const x = l.m * g + offset;
        const dir = Math.sign(l.v);
        const tail = l.y - dir * l.len;
        const grad = ctx.createLinearGradient(x, tail, x, l.y);
        grad.addColorStop(0, `rgba(${hr},${hg},${hb},0)`);
        grad.addColorStop(0.85, `rgba(${hr},${hg},${hb},0.85)`);
        grad.addColorStop(1, `rgba(255,255,255,1)`);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, tail);
        ctx.lineTo(x, l.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.4;
        ctx.stroke();
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

  const mask = "radial-gradient(ellipse 75% 75% at 50% 50%, #000 30%, transparent 100%)";
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
