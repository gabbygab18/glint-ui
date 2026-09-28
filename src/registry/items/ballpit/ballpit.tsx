"use client";

import { useEffect, useRef } from "react";

export interface BallpitProps {
  /** Number of balls. */
  count?: number;
  /** Ball colors, picked at random. */
  colors?: string[];
  /** Ball size multiplier. */
  size?: number;
  /** Gravity multiplier; 0 lets the balls float. */
  gravity?: number;
  /** Bounciness from 0 (dead) to 1 (elastic). */
  bounce?: number;
  /** The cursor shoves the balls around. */
  interactive?: boolean;
  /** Px radius of the cursor's push. */
  cursorRadius?: number;
  className?: string;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  sprite: number;
  inside: boolean;
}

const SPRITE = 160;
const STEP = 1 / 120;

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Pre-renders one glossy ball so each frame is a cheap drawImage. */
function makeSprite(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE;
  const g = c.getContext("2d")!;
  const [r, gr, b] = rgb(color);
  const tone = (k: number) =>
    k >= 0
      ? `rgb(${r + (255 - r) * k},${gr + (255 - gr) * k},${b + (255 - b) * k})`
      : `rgb(${r * (1 + k)},${gr * (1 + k)},${b * (1 + k)})`;
  const R = SPRITE / 2;
  const body = g.createRadialGradient(R * 0.7, R * 0.6, 0, R, R, R);
  body.addColorStop(0, tone(0.5));
  body.addColorStop(0.35, tone(0));
  body.addColorStop(0.82, tone(-0.45));
  body.addColorStop(1, tone(-0.2));
  g.fillStyle = body;
  g.beginPath();
  g.arc(R, R, R, 0, Math.PI * 2);
  g.fill();
  const spec = g.createRadialGradient(R * 0.66, R * 0.54, 0, R * 0.66, R * 0.54, R * 0.36);
  spec.addColorStop(0, "rgba(255,255,255,0.95)");
  spec.addColorStop(0.35, "rgba(255,255,255,0.35)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spec;
  g.fill();
  const bounceLight = g.createRadialGradient(R * 1.3, R * 1.45, 0, R * 1.3, R * 1.45, R * 0.7);
  bounceLight.addColorStop(0, "rgba(255,255,255,0.22)");
  bounceLight.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = bounceLight;
  g.fill();
  return c;
}

export function Ballpit({
  count = 60,
  colors = ["#c6ff3d", "#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"],
  size = 1,
  gravity = 1,
  bounce = 0.7,
  interactive = true,
  cursorRadius = 90,
  className,
}: BallpitProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ gravity, bounce, interactive, cursorRadius });
  const colorKey = colors.join(",");

  useEffect(() => {
    opts.current = { gravity, bounce, interactive, cursorRadius };
  }, [gravity, bounce, interactive, cursorRadius]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = colorKey ? colorKey.split(",") : ["#ffffff"];
    const sprites = palette.map(makeSprite);
    const balls: Ball[] = [];
    const cursor = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = 0;
    let acc = 0;

    const spawn = () => {
      const base = Math.sqrt((w * h * 0.42) / (Math.max(count, 1) * Math.PI)) * size;
      const floating = opts.current.gravity === 0;
      for (let i = 0; i < count; i++) {
        const r = Math.max(4, base * (0.7 + Math.random() * 0.6));
        balls.push({
          x: r + Math.random() * Math.max(w - 2 * r, 1),
          y: floating ? r + Math.random() * Math.max(h - 2 * r, 1) : -r - Math.random() * h * 1.5,
          vx: (Math.random() - 0.5) * 200,
          vy: floating ? (Math.random() - 0.5) * 200 : 0,
          r,
          sprite: i % sprites.length,
          inside: floating,
        });
      }
    };

    const step = () => {
      const { gravity: g, bounce: e, interactive: pushy, cursorRadius: cr } = opts.current;
      const drag = g === 0 ? 0.9995 : 0.999;
      for (const b of balls) {
        b.vy += 1800 * g * STEP;
        b.vx *= drag;
        b.vy *= drag;
        b.x += b.vx * STEP;
        b.y += b.vy * STEP;
        if (b.x < b.r) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * e;
        }
        if (b.x > w - b.r) {
          b.x = w - b.r;
          b.vx = -Math.abs(b.vx) * e;
        }
        if (b.y > h - b.r) {
          b.y = h - b.r;
          b.vy = -Math.abs(b.vy) * e;
          b.vx *= 0.985;
        }
        if (b.y > b.r) b.inside = true;
        if (b.inside && b.y < b.r) {
          b.y = b.r;
          b.vy = Math.abs(b.vy) * e;
        }
        if (pushy) {
          const dx = b.x - cursor.x;
          const dy = b.y - cursor.y;
          const min = b.r + cr;
          const d2 = dx * dx + dy * dy;
          if (d2 < min * min && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            b.x = cursor.x + nx * min;
            b.y = cursor.y + ny * min;
            const vn = (b.vx - cursor.vx) * nx + (b.vy - cursor.vy) * ny;
            if (vn < 0) {
              b.vx -= (1 + e) * vn * nx;
              b.vy -= (1 + e) * vn * ny;
            }
          }
        }
      }
      // ponytail: O(n²) pair test, fine to a few hundred balls; use a spatial grid beyond that.
      for (let i = 0; i < balls.length; i++) {
        const a = balls[i];
        for (let j = i + 1; j < balls.length; j++) {
          const b = balls[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const min = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 < 1e-6) continue;
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;
          const ma = a.r * a.r;
          const mb = b.r * b.r;
          const push = (min - d) / (ma + mb);
          a.x += nx * push * mb;
          a.y += ny * push * mb;
          b.x -= nx * push * ma;
          b.y -= ny * push * ma;
          const vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (vn < 0) {
            const j2 = (-(1 + e) * vn) / (1 / ma + 1 / mb);
            a.vx += (j2 / ma) * nx;
            a.vy += (j2 / ma) * ny;
            b.vx -= (j2 / mb) * nx;
            b.vy -= (j2 / mb) * ny;
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const b of balls) ctx.drawImage(sprites[b.sprite], b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    };

    const loop = (now: number) => {
      acc += Math.min(now - last, 50) / 1000;
      last = now;
      while (acc >= STEP) {
        step();
        acc -= STEP;
      }
      cursor.vx *= 0.85;
      cursor.vy *= 0.85;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (raf || !visible || reduced || !w) return;
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
      if (!balls.length && w && h) {
        spawn();
        // Reduced motion: let the pile settle off-screen, then show one still frame.
        if (reduced) for (let i = 0; i < 600; i++) step();
      }
      for (const b of balls) {
        b.x = Math.min(Math.max(b.x, b.r), Math.max(w - b.r, b.r));
        if (b.inside) b.y = Math.min(Math.max(b.y, b.r), Math.max(h - b.r, b.r));
      }
      draw();
      play();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const dt = Math.max((e.timeStamp - cursor.t) / 1000, 1 / 240);
      if (cursor.x > -1e3 && dt < 0.2) {
        cursor.vx = Math.max(-3000, Math.min(3000, (x - cursor.x) / dt));
        cursor.vy = Math.max(-3000, Math.min(3000, (y - cursor.y) / dt));
      }
      cursor.x = x;
      cursor.y = y;
      cursor.t = e.timeStamp;
    };
    const onLeave = () => {
      cursor.x = cursor.y = -1e4;
      cursor.vx = cursor.vy = 0;
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

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
    };
  }, [count, size, colorKey]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
