"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface FlyingPostersProps {
  images: string[];
  /** Idle drift in posters per second (negative flies down). */
  speed?: number;
  /** Poster width in px. */
  posterWidth?: number;
  /** How far the stream bends away from the viewer, 0 to 1. */
  curve?: number;
  /** Horizontal scatter in px. */
  sway?: number;
  className?: string;
}

export function FlyingPosters({
  images,
  speed = 0.35,
  posterWidth = 200,
  curve = 0.7,
  sway = 160,
  className,
}: FlyingPostersProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const posterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cfg = useRef({ speed, curve, sway, posterWidth });
  useEffect(() => {
    cfg.current = { speed, curve, sway, posterWidth };
  }, [speed, curve, sway, posterWidth]);

  useEffect(() => {
    const root = rootRef.current!;
    const n = images.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let vel = 0;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let drag: { y: number; t: number } | null = null;

    const render = () => {
      const { curve: c, sway: sw } = cfg.current;
      const h = root.clientHeight;
      const pw = cfg.current.posterWidth;
      const pitch = pw * 1.4 * 0.8; // arc length between posters
      const R = (h * 0.55) / Math.max(c, 0.05); // cylinder radius: smaller = tighter bend
      for (let i = 0; i < n; i++) {
        const el = posterRefs.current[i];
        if (!el) continue;
        const s = ((((i + offset) % n) + n) % n) - n / 2; // wrapped slot, -n/2..n/2
        const a = (s * pitch) / R;
        const y = -Math.sin(a) * R;
        const z = (Math.cos(a) - 1) * R + Math.cos(i * 1.7) * 90;
        const x = Math.sin(i * 2.4) * sw + Math.sin(s * 0.8) * sw * 0.25;
        const edge = Math.max(Math.abs(y) / (h * 0.5 + pw), Math.abs(a) / 1.35);
        const fade = Math.max(0, Math.min(1, (1 - edge) / 0.25));
        el.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${(a * 180) / Math.PI}deg) rotateY(${-x / 12}deg) rotateZ(${Math.sin(i * 2.1) * 4}deg)`;
        el.style.opacity = String(fade);
        el.style.zIndex = String(Math.round(1000 + z));
        el.style.visibility = fade <= 0 ? "hidden" : "visible";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag) {
        offset += (vel + (reduced ? 0 : cfg.current.speed)) * dt;
        vel *= Math.exp(-dt * 2.2);
      }
      render();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const unit = () => cfg.current.posterWidth * 1.12; // px of drag per poster
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      vel += (e.deltaY * (e.deltaMode === 1 ? 16 : 1)) / 260;
      vel = Math.max(-12, Math.min(12, vel));
    };
    const onDown = (e: PointerEvent) => {
      root.setPointerCapture(e.pointerId);
      drag = { y: e.clientY, t: performance.now() };
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      const d = (drag.y - e.clientY) / unit();
      offset += d;
      vel = (d / Math.max(1, now - drag.t)) * 1000 * 0.6;
      drag = { y: e.clientY, t: now };
    };
    const onUp = () => {
      drag = null;
    };
    const onKey = (e: KeyboardEvent) => {
      const d = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      vel += d * 2.2;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(root);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("keydown", onKey);
    render();
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("keydown", onKey);
    };
  }, [images.length]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-roledescription="poster stream"
      aria-label="Poster stream. Scroll, drag or use the arrow keys to fly through."
      className={cn(
        "relative h-full w-full cursor-grab touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:cursor-grabbing",
        className,
      )}
      style={{ perspective: 900 }}
    >
      <div className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d" }}>
        {images.map((src, i) => (
          <div
            key={i}
            ref={(el) => {
              posterRefs.current[i] = el;
            }}
            className="absolute overflow-hidden rounded-lg bg-muted shadow-[0_30px_60px_-15px_rgba(0,0,0,.7)] will-change-transform"
            style={{
              width: posterWidth,
              height: posterWidth * 1.4,
              left: -posterWidth / 2,
              top: -posterWidth * 0.7,
              visibility: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
