"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DitherVeilProps {
  /** Content hidden under the veil. */
  children?: ReactNode;
  /** Size of one dither pixel in px. */
  pixelSize?: number;
  /** Veil base color (6-digit hex). */
  color?: string;
  /** Dithered highlight color (6-digit hex). */
  accent?: string;
  /** 0–1, how much of the veil is highlight. */
  density?: number;
  /** Px radius the cursor dissolves. */
  radius?: number;
  /** Ms for a revealed patch to close again. */
  heal?: number;
  /** Flow speed of the veil pattern. */
  speed?: number;
  className?: string;
}

// 8x8 Bayer matrix, normalised to 0..1 thresholds.
const BAYER = (() => {
  const m = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
  return Float32Array.from(m, (v) => (v + 0.5) / 64);
})();

// Packs a hex color as little-endian RGBA for a Uint32Array view of ImageData.
const pack = (hex: string) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return (255 << 24) | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255);
};

export function DitherVeil({
  children,
  pixelSize = 4,
  color = "#0d0d0f",
  accent = "#c6ff3d",
  density = 0.4,
  radius = 150,
  heal = 1400,
  speed = 1,
  className,
}: DitherVeilProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ink = pack(color);
    const hi = pack(accent);
    let gw = 0;
    let gh = 0;
    let img: ImageData;
    let px = new Uint32Array(0);
    let reveal = new Float32Array(0);
    let rowWarp = new Float32Array(0);
    let colWarp = new Float32Array(0);
    const mouse = { x: -1e4, y: -1e4 };
    let raf = 0;
    let last = 0;
    let visible = true;

    const frame = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      const t = reduced ? 0 : (now / 1000) * speed;
      const r = radius / pixelSize;
      const mx = mouse.x / pixelSize;
      const my = mouse.y / pixelSize;
      const decay = Math.max(0, 1 - dt / heal);
      for (let y = 0; y < gh; y++) rowWarp[y] = 1.6 * Math.sin(y * 0.045 + t * 0.35);
      for (let x = 0; x < gw; x++) colWarp[x] = 1.6 * Math.sin(x * 0.03 - t * 0.25);
      const lift = density * 2 - 1;
      for (let y = 0; y < gh; y++) {
        const dy = y - my;
        const brow = (y & 7) << 3;
        for (let x = 0; x < gw; x++) {
          const i = y * gw + x;
          const dx = x - mx;
          const d = Math.sqrt(dx * dx + dy * dy);
          // Soft hole around the pointer; the trail heals back over `heal` ms.
          const hole = d < r ? 1 - (d / r) ** 2 : 0;
          const rv = Math.max(reveal[i] * decay, hole);
          reveal[i] = rv;
          const th = BAYER[brow + (x & 7)];
          if (rv > th) {
            px[i] = 0;
            continue;
          }
          const g = 0.5 + 0.25 * (Math.sin(x * 0.022 + t * 0.7 + rowWarp[y]) + Math.sin(y * 0.03 - t * 0.5 + colWarp[x]));
          px[i] = g * g + lift * 0.5 > th ? hi : ink;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = (now: number) => {
      frame(now);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };

    const ro = new ResizeObserver(() => {
      gw = Math.max(1, Math.ceil(root.offsetWidth / pixelSize));
      gh = Math.max(1, Math.ceil(root.offsetHeight / pixelSize));
      canvas.width = gw;
      canvas.height = gh;
      canvas.style.width = `${gw * pixelSize}px`;
      canvas.style.height = `${gh * pixelSize}px`;
      img = ctx.createImageData(gw, gh);
      px = new Uint32Array(img.data.buffer);
      reveal = new Float32Array(gw * gh);
      rowWarp = new Float32Array(gh);
      colWarp = new Float32Array(gw);
      frame(performance.now());
    });
    ro.observe(root);

    const onMove = (e: PointerEvent) => {
      const b = root.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      if (reduced) frame(performance.now());
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(root);
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [pixelSize, color, accent, density, radius, heal, speed]);

  return (
    <div ref={rootRef} className={cn("relative overflow-hidden", className)}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", imageRendering: "pixelated" }}
      />
    </div>
  );
}
