"use client";

import { useEffect, useRef } from "react";

export interface RibbonsProps {
  /** One ribbon per color, front to back. */
  colors?: string[];
  /** Head width in px. */
  thickness?: number;
  /** Points per ribbon; longer tails at higher values. */
  length?: number;
  /** Spring pull toward the cursor (0-1). Lower lags more. */
  spring?: number;
  /** Width ripples like a twisting ribbon. */
  twist?: boolean;
  /** Ribbons wander on their own while the cursor is away. */
  idle?: boolean;
  className?: string;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function Ribbons({
  colors = ["#c6ff3d", "#22d3ee", "#a78bfa", "#f472b6"],
  thickness = 22,
  length = 40,
  spring = 0.05,
  twist = true,
  idle = true,
  className,
}: RibbonsProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  // A string key keeps a fresh-but-equal colors array from restarting the effect.
  const colorKey = colors.join(",");

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement ?? canvas;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const mouse = { x: 0, y: 0, at: -1e9 };
    // Back ribbons are softer springs, so the bundle fans out when the cursor moves.
    const ribbons = colorKey.split(",").map((c, k) => ({
      rgb: hexToRgb(c),
      k,
      stiffness: spring * (1 - k * 0.14),
      damping: 0.8 - k * 0.025,
      width: thickness * (1 - k * 0.1),
      vx: 0,
      vy: 0,
      pts: [] as { x: number; y: number }[],
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const r of ribbons)
        if (!r.pts.length) r.pts = Array.from({ length }, () => ({ x: w / 2, y: h / 2 }));
    };

    const frame = (now: number) => {
      const t = now / 1000;
      let tx = mouse.x;
      let ty = mouse.y;
      if (idle && now - mouse.at > 1500) {
        tx = w / 2 + Math.sin(t * 0.8) * w * 0.3;
        ty = h / 2 + Math.sin(t * 1.3) * Math.cos(t * 0.5) * h * 0.3;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const left: number[] = [];
      const right: number[] = [];
      for (const r of [...ribbons].reverse()) {
        const p = r.pts;
        const head = p[0];
        // Each ribbon circles the target on its own orbit, so they keep flowing even when the cursor rests.
        const orbit = 14 + r.k * 12;
        const ox = Math.cos(t * (2.2 - r.k * 0.3) + r.k * 1.7) * orbit;
        const oy = Math.sin(t * (2.2 - r.k * 0.3) * 1.3 + r.k * 1.7) * orbit;
        r.vx = (r.vx + (tx + ox - head.x) * r.stiffness) * r.damping;
        r.vy = (r.vy + (ty + oy - head.y) * r.stiffness) * r.damping;
        head.x += r.vx;
        head.y += r.vy;
        for (let i = 1; i < p.length; i++) {
          p[i].x += (p[i - 1].x - p[i].x) * 0.3;
          p[i].y += (p[i - 1].y - p[i].y) * 0.3;
        }
        left.length = 0;
        right.length = 0;
        const n = p.length;
        for (let i = 0; i < n; i++) {
          const a = p[Math.max(0, i - 1)];
          const b = p[Math.min(n - 1, i + 1)];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const len = Math.hypot(dx, dy) || 1;
          let hw = (r.width / 2) * Math.pow(1 - i / n, 0.9);
          if (twist) hw *= 0.35 + 0.65 * Math.abs(Math.sin(i * 0.22 - t * 3 + r.k));
          left.push(p[i].x - (dy / len) * hw, p[i].y + (dx / len) * hw);
          right.push(p[i].x + (dy / len) * hw, p[i].y - (dx / len) * hw);
        }
        ctx.beginPath();
        ctx.moveTo(left[0], left[1]);
        for (let i = 2; i < left.length - 2; i += 2)
          ctx.quadraticCurveTo(left[i], left[i + 1], (left[i] + left[i + 2]) / 2, (left[i + 1] + left[i + 3]) / 2);
        for (let i = right.length - 2; i > 1; i -= 2)
          ctx.quadraticCurveTo(right[i], right[i + 1], (right[i] + right[i - 2]) / 2, (right[i + 1] + right[i - 1]) / 2);
        ctx.closePath();
        const grad = ctx.createLinearGradient(p[0].x, p[0].y, p[n - 1].x, p[n - 1].y);
        grad.addColorStop(0, `rgba(${r.rgb},0.95)`);
        grad.addColorStop(1, `rgba(${r.rgb},0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      frame(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.at = performance.now();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    if (reduced) return () => ro.disconnect();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    host.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
    };
  }, [colorKey, thickness, length, spring, twist, idle]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
