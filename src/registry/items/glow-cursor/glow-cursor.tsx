"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlowCursorProps {
  children?: ReactNode;
  /** Glow color. */
  color?: string;
  /** Glow diameter in px. */
  size?: number;
  /** Follow easing per frame, 0–1. Lower trails further behind. */
  ease?: number;
  /** Resting opacity, 0–1. */
  intensity?: number;
  /** Scale multiplier while over an interactive child. */
  hoverScale?: number;
  /** Children matching this selector make the glow swell and brighten. */
  selector?: string;
  className?: string;
}

export function GlowCursor({
  children,
  color = "#c6ff3d",
  size = 360,
  ease = 0.12,
  intensity = 0.35,
  hoverScale = 1.5,
  selector = "a,button,[data-glow]",
  className,
}: GlowCursorProps) {
  const root = useRef<HTMLDivElement>(null);
  const orb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const o = orb.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const k = reduced ? 1 : ease;
    const cur = { x: 0, y: 0, s: 0.6, a: 0 };
    const tgt = { x: 0, y: 0, s: 0.6, a: 0 };
    let raf = 0;

    const tick = () => {
      cur.x += (tgt.x - cur.x) * k;
      cur.y += (tgt.y - cur.y) * k;
      cur.s += (tgt.s - cur.s) * 0.12;
      cur.a += (tgt.a - cur.a) * 0.12;
      o.style.transform = `translate3d(${cur.x - size / 2}px, ${cur.y - size / 2}px, 0) scale(${cur.s})`;
      o.style.opacity = String(cur.a);
      const settled =
        Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) < 0.2 &&
        Math.abs(tgt.s - cur.s) < 0.002 &&
        Math.abs(tgt.a - cur.a) < 0.002;
      // The loop sleeps once the orb catches up; a still cursor costs nothing.
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tgt.x = e.clientX - r.left;
      tgt.y = e.clientY - r.top;
      if (cur.a < 0.01) {
        cur.x = tgt.x;
        cur.y = tgt.y;
      }
      const hot = (e.target as Element | null)?.closest?.(selector);
      const over = !!hot && el.contains(hot);
      tgt.s = over ? hoverScale : 1;
      tgt.a = over ? Math.min(1, intensity * 2.2) : intensity;
      kick();
    };
    const onLeave = () => {
      tgt.s = 0.6;
      tgt.a = 0;
      kick();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [size, ease, intensity, hoverScale, selector]);

  return (
    <div ref={root} className={cn("relative isolate overflow-hidden", className)}>
      <div
        ref={orb}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, color-mix(in srgb, ${color} 35%, transparent) 30%, transparent 68%)`,
          filter: "blur(12px)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          willChange: "transform, opacity",
        }}
      />
      {children}
    </div>
  );
}
