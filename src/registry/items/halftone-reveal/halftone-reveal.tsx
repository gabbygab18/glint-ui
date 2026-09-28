"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface HalftoneRevealProps {
  /** Image URL (must allow CORS so its pixels can be sampled). */
  src: string;
  alt?: string;
  /** Halftone cell size in px. */
  cellSize?: number;
  /** Px radius of the full-image reveal around the cursor. */
  radius?: number;
  /** Dots take the image colors; off paints them with dotColor. */
  colored?: boolean;
  dotColor?: string;
  className?: string;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function HalftoneReveal({
  src,
  alt = "",
  cellSize = 11,
  radius = 170,
  colored = true,
  dotColor = "#c6ff3d",
  className,
}: HalftoneRevealProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const full = document.createElement("canvas");
    const fctx = full.getContext("2d")!;
    const reveal = document.createElement("canvas");
    const rctx = reveal.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    img.crossOrigin = "anonymous";
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let rgb = new Uint8ClampedArray(0);
    let ready = false;
    let raf = 0;
    let visible = true;
    const m = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };

    // Cover-fit the image into a w x h box.
    const cover = (c: CanvasRenderingContext2D, bw: number, bh: number) => {
      const s = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
      const iw = img.naturalWidth * s;
      const ih = img.naturalHeight * s;
      c.drawImage(img, (bw - iw) / 2, (bh - ih) / 2, iw, ih);
    };

    const build = () => {
      if (!img.complete || !img.naturalWidth || !w) return;
      full.width = reveal.width = canvas.width;
      full.height = reveal.height = canvas.height;
      cover(fctx, full.width, full.height);
      // Average each cell by letting the browser downsample the image to one pixel per cell.
      cols = Math.ceil(w / cellSize);
      rows = Math.ceil(h / cellSize);
      const small = document.createElement("canvas");
      small.width = cols;
      small.height = rows;
      const sctx = small.getContext("2d", { willReadFrequently: true })!;
      sctx.save();
      sctx.scale(1 / cellSize, 1 / cellSize);
      cover(sctx, cols * cellSize, rows * cellSize);
      sctx.restore();
      rgb = sctx.getImageData(0, 0, cols, rows).data;
      ready = true;
    };

    const draw = (time: number) => {
      m.x += (m.tx - m.x) * 0.14;
      m.y += (m.ty - m.y) * 0.14;
      m.on += (m.ton - m.on) * 0.08;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!ready) return;
      const half = cellSize / 2;
      const t = time / 1000;
      if (!colored) {
        ctx.fillStyle = dotColor;
        ctx.beginPath();
      }
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = (j * cols + i) * 4;
          const lum = (0.299 * rgb[k] + 0.587 * rgb[k + 1] + 0.114 * rgb[k + 2]) / 255;
          const x = i * cellSize + half;
          const y = j * cellSize + half;
          const near = m.on * smooth(radius, radius * 0.3, Math.hypot(x - m.x, y - m.y));
          const wave = reduced ? 1 : 0.86 + 0.14 * Math.sin(t * 1.6 - (x + y) * 0.012);
          let r = half * 0.95 * Math.sqrt(lum) * wave;
          r += (cellSize * 0.72 - r) * near;
          if (r < 0.4) continue;
          if (colored) {
            ctx.fillStyle = `rgb(${rgb[k]},${rgb[k + 1]},${rgb[k + 2]})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, Math.PI * 2);
          }
        }
      }
      if (!colored) ctx.fill();

      if (m.on > 0.01) {
        // Punch a soft circle of the real image in around the cursor.
        rctx.globalCompositeOperation = "source-over";
        rctx.clearRect(0, 0, reveal.width, reveal.height);
        rctx.drawImage(full, 0, 0);
        rctx.globalCompositeOperation = "destination-in";
        const g = rctx.createRadialGradient(m.x * dpr, m.y * dpr, 0, m.x * dpr, m.y * dpr, radius * dpr);
        g.addColorStop(0, `rgba(0,0,0,${m.on})`);
        g.addColorStop(0.45, `rgba(0,0,0,${m.on * 0.9})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        rctx.fillStyle = g;
        rctx.fillRect(0, 0, reveal.width, reveal.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(reveal, 0, 0);
      }
    };

    const loop = (time: number) => {
      draw(time);
      const busy = !reduced || Math.abs(m.ton - m.on) > 0.002 || Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y) > 0.3;
      raf = visible && busy ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      build();
      kick();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      m.tx = e.clientX - r.left;
      m.ty = e.clientY - r.top;
      if (m.on < 0.02) {
        m.x = m.tx;
        m.y = m.ty;
      }
      m.ton = 1;
      kick();
    };
    const onLeave = () => {
      m.ton = 0;
      kick();
    };

    img.onload = () => {
      build();
      kick();
    };
    img.src = src;

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(canvas);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      img.onload = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [src, cellSize, radius, colored, dotColor]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas ref={ref} role="img" aria-label={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
