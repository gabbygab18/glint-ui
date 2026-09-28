"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PixelHighlightProps {
  children?: ReactNode;
  /** Pixel colors, picked at random per pixel. */
  colors?: string[];
  /** Px between pixel centers. */
  gap?: number;
  /** Ripple speed in px per second. */
  speed?: number;
  /** Twinkle strength while lit, 0–1. */
  twinkle?: number;
  className?: string;
}

const COLORS = ["#c6ff3d", "#86efac", "#22d3ee"];

export function PixelHighlight({
  children,
  colors = COLORS,
  gap = 7,
  speed = 900,
  twinkle = 0.5,
  className,
}: PixelHighlightProps) {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current!;
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    type Px = { x: number; y: number; c: string; a: number; ph: number; v: number; d: number };
    let px: Px[] = [];
    let w = 0;
    let h = 0;
    let on = false;
    let t0 = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      px = [];
      for (let y = gap / 2; y < h; y += gap)
        for (let x = gap / 2; x < w; x += gap)
          px.push({ x, y, c: colors[(Math.random() * colors.length) | 0], a: 0.1 + Math.random() * 0.35, ph: Math.random() * 6.28, v: 0, d: 0 });
      kick();
    };

    const frame = (now: number) => {
      const el2 = now - t0;
      const t = now / 1000;
      const max = gap * 0.5;
      let busy = on;
      ctx.clearRect(0, 0, w, h);
      for (const p of px) {
        // Each pixel waits for the ripple front, then eases toward lit (hover) or off (leave).
        if (reduced || el2 > p.d / (speed / 1000)) {
          const goal = on ? 1 : 0;
          p.v += (goal - p.v) * (reduced ? 1 : 0.18);
          if (Math.abs(goal - p.v) < 0.01) p.v = goal;
        }
        if (p.v > 0) busy = true;
        if (p.v <= 0) continue;
        const tw = 1 - twinkle * (0.5 + 0.5 * Math.sin(t * 5 + p.ph));
        const s = max * p.v * (reduced ? 1 : tw);
        // Front-of-wave pixels flash brighter.
        ctx.globalAlpha = Math.min(1, p.a + (1 - p.v) * 0.8);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      raf = busy ? requestAnimationFrame(frame) : 0;
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    const start = (active: boolean, ox: number, oy: number) => {
      on = active;
      t0 = performance.now();
      for (const p of px) p.d = Math.hypot(p.x - ox, p.y - oy);
      kick();
    };
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const enter = (e: PointerEvent) => start(true, ...local(e));
    const leave = (e: PointerEvent) => {
      if (!el.contains(document.activeElement)) start(false, ...local(e));
    };
    const focusIn = () => !on && start(true, w / 2, h / 2);
    const focusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null) && !el.matches(":hover")) start(false, w / 2, h / 2);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
    };
  }, [colors, gap, speed, twinkle]);

  return (
    <div ref={root} className={cn("relative isolate overflow-hidden", className)}>
      <canvas
        ref={cv}
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }}
      />
      {children}
    </div>
  );
}
