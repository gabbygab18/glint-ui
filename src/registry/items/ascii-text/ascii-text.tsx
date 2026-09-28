"use client";

import { useEffect, useRef } from "react";

export interface AsciiTextProps {
  text?: string;
  /** Height of one character cell, in px. Smaller is sharper. */
  cellSize?: number;
  /** Glyphs ordered from sparse to dense. */
  charset?: string;
  color?: string;
  /** Second gradient stop (bottom right). */
  secondaryColor?: string;
  /** Horizontal wave distortion, in px. */
  waveAmplitude?: number;
  /** Wave speed multiplier. */
  waveSpeed?: number;
  /** Radius of the pointer lens, in px. 0 disables it. */
  pointerRadius?: number;
  className?: string;
}

export function AsciiText({
  text = "ASCII",
  cellSize = 11,
  charset = " .:-=+*#%@",
  color = "#bef264",
  secondaryColor = "#22d3ee",
  waveAmplitude = 6,
  waveSpeed = 1,
  pointerRadius = 150,
  className,
}: AsciiTextProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = wrap.current!;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d", { willReadFrequently: true })!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family = getComputedStyle(root).fontFamily || "sans-serif";
    const glyphs = charset.length ? charset : " #";
    const last = glyphs.length - 1;
    const ptr = { x: -1e4, y: -1e4, s: 0, on: 0 };
    let w = 0;
    let h = 0;
    let cw = cellSize * 0.6;
    let cols = 0;
    let rows = 0;
    let px: Uint8ClampedArray = new Uint8ClampedArray(0);
    let raf = 0;
    let visible = true;

    const sample = (x: number, y: number) => {
      const ix = x | 0;
      const iy = y | 0;
      if (ix < 0 || iy < 0 || ix >= w || iy >= h) return 0;
      return px[(iy * w + ix) * 4 + 3] / 255;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ptr.s += (ptr.on - ptr.s) * 0.08;
      const R = pointerRadius;
      for (let r = 0; r < rows; r++) {
        const y = r * cellSize + cellSize / 2;
        const wave = Math.sin(t * waveSpeed * 2 + r * 0.28) * waveAmplitude;
        let line = "";
        for (let c = 0; c < cols; c++) {
          let x = c * cw + cw / 2 + wave;
          let sy = y;
          const dx = x - ptr.x;
          const dy = y - ptr.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const inLens = R > 0 && d < R && ptr.s > 0.01;
          if (inLens) {
            // Pull samples toward the pointer: the text bulges like under a lens.
            const k = (1 - d / R) ** 2 * ptr.s * 0.55;
            x -= dx * k;
            sy -= dy * k;
          }
          const a = sample(x, sy);
          if (a === 0) {
            line += inLens && (c + r) % 3 === 0 && d > R * 0.35 ? glyphs[Math.min(1, last)] : " ";
            continue;
          }
          const shimmer = 0.7 + 0.3 * Math.sin(t * 3 + c * 0.21 - r * 0.37);
          const boost = inLens ? (1 - d / R) * ptr.s * 0.6 : 0;
          line += glyphs[Math.max(1, Math.min(last, Math.round((a * shimmer + boost) * last)))];
        }
        ctx.fillText(line, 0, r * cellSize);
      }
    };

    const layout = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      mask.width = w;
      mask.height = h;
      mctx.font = `900 100px ${family}`;
      const m = mctx.measureText(text);
      const size = Math.min((100 * w * 0.86) / Math.max(m.width, 1), h * 0.62);
      mctx.font = `900 ${size}px ${family}`;
      mctx.fillStyle = "#fff";
      mctx.textAlign = "center";
      mctx.textBaseline = "middle";
      mctx.fillText(text, w / 2, h / 2);
      px = mctx.getImageData(0, 0, w, h).data;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `600 ${cellSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      cw = ctx.measureText("M").width || cellSize * 0.6;
      cols = Math.ceil(w / cw);
      rows = Math.ceil(h / cellSize);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0.2, color);
      g.addColorStop(0.8, secondaryColor);
      ctx.fillStyle = g;
      if (reduced || !raf) draw(0);
    };

    const loop = (now: number) => {
      draw(now / 1000);
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.on = 1;
    };
    const onLeave = () => (ptr.on = 0);

    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    document.fonts?.ready.then(layout);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      raf = -1;
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [text, cellSize, charset, color, secondaryColor, waveAmplitude, waveSpeed, pointerRadius]);

  return (
    <div ref={wrap} className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <span className="sr-only">{text}</span>
      <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
