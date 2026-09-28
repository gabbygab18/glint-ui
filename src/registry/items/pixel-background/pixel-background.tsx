"use client";

import { useEffect, useRef } from "react";

export interface PixelBackgroundProps {
  /** Px per tile. */
  pixelSize?: number;
  /** Px between tiles. */
  gap?: number;
  /** Palette the color waves sweep through, dark to bright. */
  colors?: string[];
  /** Wave speed multiplier; 0 freezes the mosaic. */
  speed?: number;
  /** Overall tile brightness, 0 to 1. */
  brightness?: number;
  /** Tiles brighten near the cursor. */
  interactive?: boolean;
  /** Cursor glow radius in px. */
  radius?: number;
  className?: string;
}

function rgb(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const tileHash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function PixelBackground({
  pixelSize = 26,
  gap = 2,
  colors = ["#0b1026", "#1e3a8a", "#7c3aed", "#f472b6"],
  speed = 1,
  brightness = 0.7,
  interactive = true,
  radius = 160,
  className,
}: PixelBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pal = (colors.length ? colors : ["#000000"]).map(rgb);
  const opts = useRef({ pal, pixelSize, gap, speed, brightness, interactive, radius });
  const redraw = useRef<() => void>(undefined);

  useEffect(() => {
    opts.current = { pal: (colors.length ? colors : ["#000000"]).map(rgb), pixelSize, gap, speed, brightness, interactive, radius };
    redraw.current?.();
  }, [colors, pixelSize, gap, speed, brightness, interactive, radius]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const area = canvas.parentElement ?? canvas;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, on: 0, target: 0 };
    let w = 0;
    let h = 0;
    let t = 7;
    let raf = 0;
    let last = 0;

    const draw = (dt: number) => {
      const o = opts.current;
      t += dt * o.speed;
      mouse.on += (mouse.target - mouse.on) * (1 - Math.exp(-dt * 6));
      const s = Math.max(4, o.pixelSize);
      const gp = Math.min(Math.max(o.gap, 0), s - 1);
      const pal = o.pal;
      const top = pal.length - 1;
      const r2 = o.radius * o.radius;
      const cols = Math.ceil(w / s);
      const rows = Math.ceil(h / s);
      const ox = (w - cols * s) / 2;
      const oy = (h - rows * s) / 2;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = ox + i * s;
          const y = oy + j * s;
          const px = x * 0.004;
          const py = y * 0.004;
          const dc = Math.hypot(x - cx, y - cy) * 0.006;
          // Several slow interfering waves give the mosaic its drifting color bands.
          let v =
            Math.sin(px * 1.3 + t * 0.35) +
            Math.sin(py * 1.7 - t * 0.28) +
            Math.sin((px + py) * 1.1 + t * 0.22) +
            Math.sin(dc - t * 0.45);
          v = v * 0.125 + 0.5;
          const n = tileHash(i, j);
          v = Math.min(1, Math.max(0, v + (n - 0.5) * 0.14));

          let boost = 0;
          if (o.interactive && mouse.on > 0.001) {
            const dx = x + s / 2 - mouse.x;
            const dy = y + s / 2 - mouse.y;
            boost = Math.exp(-(dx * dx + dy * dy) / r2) * mouse.on;
          }
          const pos = Math.min(1, v + boost * 0.25) * top;
          const k = Math.min(top - 1, Math.floor(pos));
          const f = top > 0 ? pos - Math.max(k, 0) : 0;
          const a = pal[Math.max(k, 0)];
          const b = pal[Math.min(Math.max(k, 0) + 1, top)];
          const lum = o.brightness * (0.55 + 0.45 * v) + boost * 0.45;
          const mixW = boost * 0.18;
          const cr = ((a[0] + (b[0] - a[0]) * f) * lum) * (1 - mixW) + 255 * mixW;
          const cg = ((a[1] + (b[1] - a[1]) * f) * lum) * (1 - mixW) + 255 * mixW;
          const cb = ((a[2] + (b[2] - a[2]) * f) * lum) * (1 - mixW) + 255 * mixW;
          ctx.fillStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`;
          ctx.fillRect(x + gp / 2, y + gp / 2, s - gp, s - gp);
        }
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.target = 1;
      if (!raf) {
        mouse.on = 1;
        draw(0);
      }
    };
    const onLeave = () => {
      mouse.target = 0;
      if (!raf) {
        mouse.on = 0;
        draw(0);
      }
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
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      redraw.current = undefined;
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
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
