"use client";

import { useEffect, useRef } from "react";

export interface DualSparksProps {
  /** Color of the stream entering from the left. */
  leftColor?: string;
  /** Color of the stream entering from the right. */
  rightColor?: string;
  /** Sparks spawned per second on each side. */
  density?: number;
  /** Flow speed multiplier; 0 freezes the sparks. */
  speed?: number;
  /** Brightness of the collision glow. */
  glow?: number;
  /** How far the streams fan out vertically, 0 to 1. */
  spread?: number;
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
  side: 0 | 1;
  burst: boolean;
  seed: number;
  width: number;
}

const MAX_SPARKS = 1400;

export function DualSparks({
  leftColor = "#38bdf8",
  rightColor = "#f472b6",
  density = 90,
  speed = 1,
  glow = 1,
  spread = 0.5,
  className,
}: DualSparksProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ l: rgb(leftColor), r: rgb(rightColor), density, speed, glow, spread });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { l: rgb(leftColor), r: rgb(rightColor), density, speed, glow, spread };
    redraw.current?.();
  }, [leftColor, rightColor, density, speed, glow, spread]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sparks: Spark[] = [];
    let w = 0;
    let h = 0;
    let t = 0;
    let heat = 0;
    let carry = 0;
    let raf = 0;
    let last = 0;

    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

    const spawn = (side: 0 | 1) => {
      if (sparks.length >= MAX_SPARKS) return;
      const o = opts.current;
      const v = (260 + Math.random() * 220) * (w / 1280 + 0.35);
      sparks.push({
        x: side ? w + 8 : -8,
        y: h / 2 + gauss() * h * 0.45 * o.spread,
        vx: side ? -v : v,
        vy: gauss() * 30,
        life: 0,
        max: 6,
        side,
        burst: false,
        seed: Math.random() * 100,
        width: 0.6 + Math.random() * 1.3,
      });
    };

    const step = (dt: number) => {
      const o = opts.current;
      t += dt;
      const cx = w / 2;
      const cy = h / 2;
      carry += o.density * dt * (h / 800 + 0.4);
      while (carry >= 1) {
        carry -= 1;
        spawn(0);
        spawn(1);
      }
      heat *= Math.exp(-dt * 3);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (!s.burst) {
          // Funnel toward the center line while wobbling like a current.
          const dx = Math.abs(cx - s.x) / Math.max(cx, 1);
          s.vy += ((cy - s.y) * (2.4 - dx * 1.6) + Math.sin(s.x * 0.012 + t * 2.2 + s.seed) * 70) * dt;
          s.vy *= Math.exp(-dt * 1.4);
          s.vx *= 1 + dt * 0.35;
          const reached = s.side ? s.x <= cx + 6 * Math.sin(s.seed) : s.x >= cx - 6 * Math.sin(s.seed);
          if (reached) {
            s.burst = true;
            s.life = 0;
            s.max = 0.35 + Math.random() * 0.8;
            const a = Math.random() * Math.PI * 2;
            const sp = 60 + Math.random() * Math.random() * 520;
            // Sparks keep a little of their momentum, so each side sprays past the other.
            s.vx = Math.cos(a) * sp + s.vx * 0.25;
            s.vy = Math.sin(a) * sp * 0.75 + s.vy * 0.3;
            heat = Math.min(heat + 0.012, 1.6);
          }
        } else {
          s.vx *= Math.exp(-dt * 2.6);
          s.vy = s.vy * Math.exp(-dt * 2.6) + 40 * dt;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.life > s.max || s.x < -40 || s.x > w + 40) sparks.splice(i, 1);
      }
    };

    const render = () => {
      const o = opts.current;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const [lr, lg, lb] = o.l;
      const [rr, rg, rb] = o.r;
      const mr = (lr + rr) >> 1;
      const mg = (lg + rg) >> 1;
      const mb = (lb + rb) >> 1;

      // Soft elliptical haze behind each stream.
      const squash = Math.max(0.12, o.spread * 0.9) * (h / Math.max(w, 1));
      for (const [side, [r, g, b]] of [o.l, o.r].entries()) {
        const hx = side ? cx * 1.45 : cx * 0.55;
        ctx.save();
        ctx.translate(hx, cy);
        ctx.scale(1, squash);
        const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, cx * 0.75);
        haze.addColorStop(0, `rgba(${r},${g},${b},${0.14 * o.glow})`);
        haze.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = haze;
        ctx.fillRect(-cx, -cx, cx * 2, cx * 2);
        ctx.restore();
      }

      ctx.lineCap = "round";
      for (const s of sparks) {
        const fade = s.burst ? 1 - s.life / s.max : Math.min(1, s.life * 3);
        if (fade <= 0) continue;
        const c = s.side ? o.r : o.l;
        const whiten = s.burst ? 0.55 * (1 - s.life / s.max) : 0;
        const r = Math.round(c[0] + (255 - c[0]) * whiten);
        const g = Math.round(c[1] + (255 - c[1]) * whiten);
        const b = Math.round(c[2] + (255 - c[2]) * whiten);
        const tail = s.burst ? 0.045 : 0.03;
        ctx.strokeStyle = `rgba(${r},${g},${b},${fade * 0.9})`;
        ctx.lineWidth = s.width * (s.burst ? 1.1 : 1);
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * tail, s.y - s.vy * tail);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // Collision core.
      const pulse = 0.85 + 0.15 * Math.sin(t * 5.3) * Math.sin(t * 3.1);
      const core = Math.min(w, h) * (0.16 + 0.06 * Math.min(heat, 1)) * pulse;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, core * 2.4);
      const k = o.glow * (0.55 + 0.35 * Math.min(heat, 1));
      g.addColorStop(0, `rgba(255,255,255,${Math.min(1, 0.9 * k)})`);
      g.addColorStop(0.08, `rgba(${(mr + 255) >> 1},${(mg + 255) >> 1},${(mb + 255) >> 1},${Math.min(1, 0.6 * k)})`);
      g.addColorStop(0.3, `rgba(${mr},${mg},${mb},${0.12 * k})`);
      g.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - core * 2.4, cy - core * 2.4, core * 4.8, core * 4.8);
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
      // Pre-warm so the streams are already flowing on the first frame.
      if (first && w) for (let i = 0; i < 150; i++) step(1 / 60);
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

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
