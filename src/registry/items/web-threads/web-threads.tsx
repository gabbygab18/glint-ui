"use client";

import { useEffect, useRef } from "react";

export interface WebThreadsProps {
  /** Number of radial threads. */
  spokes?: number;
  /** Number of rings between the hub and the edges. */
  rings?: number;
  /** Idle silk color. */
  color?: string;
  /** Color of threads while they stretch and vibrate. */
  activeColor?: string;
  /** Px radius the cursor pushes threads within. */
  radius?: number;
  /** Speed of the ambient breeze; 0 keeps the web still until touched. */
  speed?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = (hex || "#000").replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Deterministic jitter so the web has an organic, hand-spun look that stays stable.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function WebThreads({
  spokes = 18,
  rings = 16,
  color = "#a1a1aa",
  activeColor = "#67e8f9",
  radius = 140,
  speed = 1,
  className,
}: WebThreadsProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ color, activeColor, radius, speed });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    opts.current = { color, activeColor, radius, speed };
    redraw.current?.();
  }, [color, activeColor, radius, speed]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = Math.max(3, Math.round(spokes));
    const R = Math.max(2, Math.round(rings));
    const N = S * R;
    // Rest positions (relative to the hub) and spring state per node.
    const rx = new Float32Array(N);
    const ry = new Float32Array(N);
    const ox = new Float32Array(N);
    const oy = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const m = { x: -9999, y: -9999, px: -9999, py: -9999 };
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let visible = true;
    let time = 0;
    let last = 0;

    const layout = () => {
      cx = w * 0.5;
      cy = h * 0.5;
      const rMax = Math.hypot(w, h) * 0.56;
      for (let j = 0; j < R; j++) {
        for (let i = 0; i < S; i++) {
          const k = j * S + i;
          const a = ((i + (rand(i, 1) - 0.5) * 0.35) / S) * Math.PI * 2;
          const r = rMax * Math.pow((j + 1) / R, 1.3) * (1 + (rand(k, 2) - 0.5) * 0.08);
          rx[k] = Math.cos(a) * r;
          ry[k] = Math.sin(a) * r;
        }
      }
    };

    const physics = () => {
      const o = opts.current;
      const rad = Math.max(10, o.radius);
      const mvx = m.px > -9000 ? m.x - m.px : 0;
      const mvy = m.px > -9000 ? m.y - m.py : 0;
      m.px = m.x;
      m.py = m.y;
      for (let j = 0; j < R; j++) {
        for (let i = 0; i < S; i++) {
          const k = j * S + i;
          // Coupling to ring and spoke neighbours makes a pluck ripple across the web.
          const l = j * S + ((i + S - 1) % S);
          const r = j * S + ((i + 1) % S);
          const inX = j > 0 ? ox[k - S] : 0;
          const inY = j > 0 ? oy[k - S] : 0;
          const outX = j < R - 1 ? ox[k + S] : 0;
          const outY = j < R - 1 ? oy[k + S] : 0;
          let fx = (ox[l] + ox[r] + inX + outX - 4 * ox[k]) * 0.07 - ox[k] * 0.01;
          let fy = (oy[l] + oy[r] + inY + outY - 4 * oy[k]) * 0.07 - oy[k] * 0.01;
          const dx = cx + rx[k] + ox[k] - m.x;
          const dy = cy + ry[k] + oy[k] - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < rad * rad) {
            const d = Math.sqrt(d2) || 1;
            const t = 1 - d / rad;
            fx += (dx / d) * t * t * 2.2 + mvx * t * 0.08;
            fy += (dy / d) * t * t * 2.2 + mvy * t * 0.08;
          }
          vx[k] = (vx[k] + fx) * 0.94;
          vy[k] = (vy[k] + fy) * 0.94;
        }
      }
      for (let k = 0; k < N; k++) {
        ox[k] += vx[k];
        oy[k] += vy[k];
      }
    };

    const draw = () => {
      const o = opts.current;
      const base = rgb(o.color);
      const hot = rgb(o.activeColor);
      const breeze = reduced ? 0 : 1;
      for (let k = 0; k < N; k++) {
        const j = Math.floor(k / S);
        const f = (j + 1) / R;
        // A gentle breeze sways the web, more at the rim than at the hub.
        const sx = Math.sin(time * 0.7 + j * 0.35 + rand(k, 3)) * 4 * f * breeze;
        const sy = Math.cos(time * 0.55 + j * 0.3) * 3 * f * breeze;
        px[k] = cx + rx[k] + ox[k] + sx;
        py[k] = cy + ry[k] + oy[k] + sy;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      // Segments are bucketed by stretch so the whole web draws in four strokes.
      const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const energy = (a: number, b: number) =>
        (Math.abs(ox[a]) + Math.abs(oy[a]) + Math.abs(ox[b]) + Math.abs(oy[b])) * 0.5;
      const bucket = (e: number) => (e > 14 ? 3 : e > 6 ? 2 : e > 1.5 ? 1 : 0);
      for (let i = 0; i < S; i++) {
        let p = paths[bucket(energy(i, i) * 0.5)];
        p.moveTo(cx, cy);
        p.lineTo(px[i], py[i]);
        for (let j = 1; j < R; j++) {
          const a = (j - 1) * S + i;
          const b = j * S + i;
          p = paths[bucket(energy(a, b))];
          p.moveTo(px[a], py[a]);
          p.lineTo(px[b], py[b]);
        }
      }
      for (let j = 0; j < R; j++) {
        for (let i = 0; i < S; i++) {
          const a = j * S + i;
          const b = j * S + ((i + 1) % S);
          // Silk sags slightly toward the hub between spokes.
          const mx = (px[a] + px[b]) * 0.5;
          const my = (py[a] + py[b]) * 0.5;
          const p = paths[bucket(energy(a, b))];
          p.moveTo(px[a], py[a]);
          p.quadraticCurveTo(mx + (cx - mx) * 0.07, my + (cy - my) * 0.07, px[b], py[b]);
        }
      }
      const styles = [
        { c: base, a: 0.26, w: 0.8 },
        { c: base.map((v, i) => Math.round(v + (hot[i] - v) * 0.5)), a: 0.5, w: 1 },
        { c: hot, a: 0.75, w: 1.1 },
        { c: hot, a: 1, w: 1.3 },
      ];
      styles.forEach((s, i) => {
        ctx.strokeStyle = `rgba(${s.c},${s.a})`;
        ctx.lineWidth = s.w;
        ctx.stroke(paths[i]);
      });
      // Dew drops on a few junctions, brightening as they shake.
      for (let k = 0; k < N; k++) {
        if (rand(k, 4) < 0.84) continue;
        const e = Math.min(1, (Math.abs(ox[k]) + Math.abs(oy[k])) / 10);
        const c = base.map((v, i) => Math.round(v + (hot[i] - v) * e));
        ctx.fillStyle = `rgba(${c},${0.35 + 0.6 * e})`;
        ctx.beginPath();
        ctx.arc(px[k], py[k], 1.2 + e, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      time += (Math.min(now - last, 50) / 1000) * opts.current.speed;
      last = now;
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
      layout();
      draw();
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
    };
    const onLeave = () => {
      m.x = m.y = m.px = m.py = -9999;
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
  }, [spokes, rings]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
