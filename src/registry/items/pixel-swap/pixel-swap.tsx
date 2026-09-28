"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface PixelSwapProps {
  /** Image shown at rest (CORS-enabled URL). */
  src: string;
  /** Image revealed on hover / focus. */
  hoverSrc: string;
  alt?: string;
  /** Pixel block size in px. */
  blockSize?: number;
  /** Transition length in ms. */
  duration?: number;
  /** Color of the sparkling front edge of the dissolve. */
  accent?: string;
  className?: string;
}

export function PixelSwap({
  src,
  hoverSrc,
  alt = "",
  blockSize = 18,
  duration = 700,
  accent = "#c6ff3d",
  className,
}: PixelSwapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const load = (u: string) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.src = u;
      return i;
    };
    const imgs = [load(src), load(hoverSrc)];
    const layers = [document.createElement("canvas"), document.createElement("canvas")];
    const tiny = document.createElement("canvas"); // hover image at one pixel per block
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let order = new Float32Array(0);
    let p = 0;
    let target = 0;
    let raf = 0;
    let prev = 0;
    const origin = { x: 0.5, y: 0.5 };
    const band = 0.18;

    const cover = (c: HTMLCanvasElement, img: HTMLImageElement, bw: number, bh: number) => {
      c.width = bw;
      c.height = bh;
      if (!img.naturalWidth) return;
      const s = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
      const iw = img.naturalWidth * s;
      const ih = img.naturalHeight * s;
      c.getContext("2d")!.drawImage(img, (bw - iw) / 2, (bh - ih) / 2, iw, ih);
    };

    const seed = () => {
      // Blocks flip in a noisy wave spreading from where the pointer entered.
      order = new Float32Array(cols * rows);
      const max = Math.hypot(Math.max(origin.x, 1 - origin.x), Math.max(origin.y, 1 - origin.y));
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const d = Math.hypot((c + 0.5) / cols - origin.x, (r + 0.5) / rows - origin.y) / max;
          order[r * cols + c] = d * 0.55 + Math.random() * 0.45;
        }
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / blockSize);
      rows = Math.ceil(h / blockSize);
      imgs.forEach((img, i) => cover(layers[i], img, canvas.width, canvas.height));
      tiny.width = cols;
      tiny.height = rows;
      const tctx = tiny.getContext("2d")!;
      tctx.drawImage(layers[1], 0, 0, cols, rows);
      if (order.length !== cols * rows) seed();
      draw();
    };

    const draw = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(layers[0], 0, 0);
      if (p <= 0) return;
      if (p >= 1) {
        ctx.drawImage(layers[1], 0, 0);
        return;
      }
      const bs = blockSize * dpr;
      // Map progress so every block, including the latest, finishes exactly at p = 1.
      const q = p * (1 + band);
      ctx.fillStyle = accent;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const o = order[r * cols + c];
          const x = c * bs;
          const y = r * bs;
          if (q > o + band) {
            ctx.drawImage(layers[1], x, y, bs, bs, x, y, bs, bs);
          } else if (q > o) {
            // Mid-flip: a flat block of the new image's average color, lit at the leading edge.
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tiny, c, r, 1, 1, x, y, bs, bs);
            const k = 1 - (q - o) / band;
            if (k > 0.6) {
              ctx.globalAlpha = (k - 0.6) * 2;
              ctx.fillRect(x, y, bs, bs);
              ctx.globalAlpha = 1;
            }
          }
        }
    };

    const loop = (now: number) => {
      const dt = prev ? now - prev : 16;
      prev = now;
      const step = reduced ? 1 : dt / duration;
      p = target > p ? Math.min(target, p + step) : Math.max(target, p - step);
      draw();
      raf = p !== target ? requestAnimationFrame(loop) : 0;
      if (!raf) prev = 0;
    };
    const go = (to: number, e?: PointerEvent | FocusEvent) => {
      if (e && "clientX" in e && p <= 0) {
        const r = el.getBoundingClientRect();
        origin.x = (e.clientX - r.left) / r.width;
        origin.y = (e.clientY - r.top) / r.height;
        seed();
      }
      target = to;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const enter = (e: PointerEvent) => go(1, e);
    const leave = () => go(0);
    const focus = () => go(1);

    imgs.forEach((img) => (img.onload = build));
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", focus);
    el.addEventListener("blur", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      imgs.forEach((img) => (img.onload = null));
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", focus);
      el.removeEventListener("blur", leave);
    };
  }, [src, hoverSrc, blockSize, duration, accent]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="img"
      aria-label={alt}
      className={cn("relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <canvas ref={cv} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
