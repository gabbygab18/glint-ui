"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PixelCardVariant = "lime" | "ocean" | "ember" | "candy" | "mono";

export interface PixelCardProps {
  children?: ReactNode;
  /** Built-in color theme. */
  variant?: PixelCardVariant;
  /** Custom palette (hex colors). Overrides `variant`. */
  colors?: string[];
  /** Distance between pixels in px. */
  gap?: number;
  /** Twinkle speed multiplier. */
  speed?: number;
  /** Largest pixel size in px. */
  pixelSize?: number;
  className?: string;
}

const PALETTES: Record<PixelCardVariant, string[]> = {
  lime: ["#c6ff3d", "#8ee000", "#e9ffb0", "#3dffa8"],
  ocean: ["#38bdf8", "#0ea5e9", "#a5f3fc", "#6366f1"],
  ember: ["#fb923c", "#f97316", "#fde047", "#ef4444"],
  candy: ["#f472b6", "#e879f9", "#fbcfe8", "#a78bfa"],
  mono: ["#fafafa", "#d4d4d4", "#a3a3a3", "#737373"],
};

interface Pixel {
  x: number;
  y: number;
  color: string;
  size: number;
  max: number;
  delay: number;
  phase: number;
  rate: number;
}

export function PixelCard({
  children,
  variant = "lime",
  colors,
  gap = 6,
  speed = 1,
  pixelSize = 2.5,
  className,
}: PixelCardProps) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const palette = (colors?.length ? colors : PALETTES[variant]).join(",");

  useEffect(() => {
    const el = box.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cols = palette.split(",");
    let pixels: Pixel[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let mode: "in" | "out" = "out";
    let start = 0;
    let last = 0;

    const build = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = Math.max(3, gap);
      const cx = w / 2;
      const cy = h / 2;
      const far = Math.hypot(cx, cy);
      const old = pixels;
      pixels = [];
      for (let x = step / 2; x < w; x += step) {
        for (let y = step / 2; y < h; y += step) {
          const d = Math.hypot(x - cx, y - cy) / far;
          pixels.push({
            x,
            y,
            color: cols[Math.floor(Math.random() * cols.length)],
            size: 0,
            max: pixelSize * (0.45 + Math.random() * 0.55),
            // Ripple outward from the center, with a little noise so the edge feels organic.
            delay: d * 520 + Math.random() * 140,
            phase: Math.random() * Math.PI * 2,
            rate: 0.6 + Math.random() * 1.4,
          });
        }
      }
      if (old.length && mode === "in") for (const p of pixels) p.size = p.max;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pixels) {
        if (p.size <= 0.05) continue;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - (last || now)) / 16.67;
      last = now;
      const t = (now - start) * speed;
      let alive = false;
      for (const p of pixels) {
        if (mode === "in") {
          if (t < p.delay) {
            alive = true;
            continue;
          }
          // Grow in, then twinkle between ~35% and 100% of the pixel's size.
          const tw = 0.675 + 0.325 * Math.sin(p.phase + (now / 1000) * p.rate * 4 * speed);
          const target = p.max * tw;
          p.size += (target - p.size) * Math.min(1, 0.18 * dt * Math.max(0.3, speed));
          alive = true;
        } else if (p.size > 0) {
          p.size = Math.max(0, p.size - 0.08 * p.rate * dt * Math.max(0.3, speed));
          alive = true;
        }
      }
      draw();
      raf = alive ? requestAnimationFrame(tick) : 0;
    };

    const run = (next: "in" | "out") => {
      mode = next;
      if (reduce) {
        for (const p of pixels) p.size = next === "in" ? p.max : 0;
        draw();
        return;
      }
      start = performance.now();
      last = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const enter = () => run("in");
    const leave = () => {
      if (!el.contains(document.activeElement)) run("out");
    };
    const blur = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node) && !el.matches(":hover")) run("out");
    };

    // The loop only runs while hovered or fading out; pause it if the card scrolls away mid-hover.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (e.isIntersecting && !raf && mode === "in" && !reduce) raf = requestAnimationFrame(tick);
    });
    const ro = new ResizeObserver(build);
    ro.observe(el);
    io.observe(el);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", blur);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", blur);
    };
  }, [palette, gap, speed, pixelSize]);

  return (
    <div
      ref={box}
      tabIndex={0}
      className={cn(
        "group relative isolate grid aspect-[4/5] w-72 place-items-center overflow-hidden rounded-[1.75rem] border border-border bg-card outline-none transition-[border-color,transform] duration-500 hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full" />
      {/* Soft vignette keeps the content readable over the pixel field. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ background: "radial-gradient(closest-side, var(--card) 30%, transparent 100%)" }}
      />
      {children}
    </div>
  );
}
