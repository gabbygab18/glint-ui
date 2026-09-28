"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface NoiseProps {
  /** Grain opacity, 0–1. */
  opacity?: number;
  /** Grain size in px. */
  size?: number;
  /** New grain frames per second. */
  refreshRate?: number;
  /** CSS blend mode against the content below. */
  blendMode?: "normal" | "overlay" | "soft-light" | "screen" | "multiply";
  className?: string;
}

const FRAMES = 8;

export function Noise({ opacity = 0.14, size = 1.5, refreshRate = 24, blendMode = "normal", className }: NoiseProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frames: ImageData[] = [];
    let i = 0;
    let timer = 0;
    let visible = true;

    // Pre-bake a handful of grain frames at 1 canvas px per grain, then just cycle them.
    const bake = () => {
      const w = Math.max(1, Math.ceil(canvas.offsetWidth / size));
      const h = Math.max(1, Math.ceil(canvas.offsetHeight / size));
      canvas.width = w;
      canvas.height = h;
      frames = Array.from({ length: reduced ? 1 : FRAMES }, () => {
        const img = ctx.createImageData(w, h);
        const d = new Uint32Array(img.data.buffer);
        for (let k = 0; k < d.length; k++) {
          const v = (Math.random() * 255) | 0;
          d[k] = (255 << 24) | (v << 16) | (v << 8) | v;
        }
        return img;
      });
      ctx.putImageData(frames[0], 0, 0);
    };
    const tick = () => {
      if (!visible || frames.length < 2) return;
      i = (i + 1) % frames.length;
      ctx.putImageData(frames[i], 0, 0);
    };

    const ro = new ResizeObserver(bake);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    if (!reduced && refreshRate > 0) timer = window.setInterval(tick, 1000 / refreshRate);
    return () => {
      clearInterval(timer);
      ro.disconnect();
      io.disconnect();
    };
  }, [size, refreshRate]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        mixBlendMode: blendMode,
        imageRendering: size >= 2 ? "pixelated" : "auto",
      }}
    />
  );
}
