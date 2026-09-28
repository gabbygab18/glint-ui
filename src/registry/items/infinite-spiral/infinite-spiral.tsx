"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface InfiniteSpiralProps {
  images: string[];
  /** Cards on the spiral; images repeat to fill it. */
  count?: number;
  /** Spiral radius in px. */
  radius?: number;
  /** Degrees between neighbouring cards. */
  step?: number;
  /** Vertical px between neighbouring cards. */
  pitch?: number;
  /** Card width in px. */
  cardWidth?: number;
  /** Idle rotation in cards per second (negative spins the other way). */
  speed?: number;
  className?: string;
}

export function InfiniteSpiral({
  images,
  count = 30,
  radius = 300,
  step = 30,
  pitch = 30,
  cardWidth = 150,
  speed = 0.8,
  className,
}: InfiniteSpiralProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = Math.max(images.length, Math.round(count));
  const cfg = useRef({ radius, step, pitch, speed, cardWidth });
  useEffect(() => {
    cfg.current = { radius, step, pitch, speed, cardWidth };
  }, [radius, step, pitch, speed, cardWidth]);

  useEffect(() => {
    const root = rootRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let vel = 0;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let drag: { x: number; y: number; t: number } | null = null;

    const render = () => {
      const { radius: R, step: st, pitch: pt, cardWidth: cw } = cfg.current;
      const h = root.clientHeight;
      const edge = h / 2 + cw * 0.35;
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const s = ((((i + offset) % n) + n) % n) - n / 2; // wrapped slot, -n/2..n/2
        const a = (s * st * Math.PI) / 180;
        const x = Math.sin(a) * R;
        const z = Math.cos(a) * R;
        const y = -s * pt;
        const fade = Math.max(0, Math.min(1, (edge - Math.abs(y)) / (cw * 0.6)));
        const facing = (Math.cos(a) + 1) / 2; // 1 = facing viewer, 0 = far side
        el.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${(a * 180) / Math.PI}deg)`;
        el.style.opacity = String(fade * (0.25 + facing * 0.75));
        el.style.filter = `brightness(${(0.35 + facing * 0.65).toFixed(2)})`;
        el.style.zIndex = String(Math.round(z) + 1000);
        el.style.visibility = fade <= 0 ? "hidden" : "visible";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag) {
        offset += (vel + (reduced ? 0 : cfg.current.speed)) * dt;
        vel *= Math.exp(-dt * 2);
      }
      render();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const unit = () => cfg.current.pitch * 1.6; // px of drag per card
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      vel = Math.max(-30, Math.min(30, vel + (d * (e.deltaMode === 1 ? 16 : 1)) / 60));
    };
    const onDown = (e: PointerEvent) => {
      root.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, t: performance.now() };
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      // Dragging left or up winds the spiral forward.
      const d = (drag.x - e.clientX + (drag.y - e.clientY)) / unit();
      offset += d;
      vel = (d / Math.max(1, now - drag.t)) * 1000 * 0.6;
      drag = { x: e.clientX, y: e.clientY, t: now };
    };
    const onUp = () => {
      drag = null;
    };
    const onKey = (e: KeyboardEvent) => {
      const d = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      vel += d * 4;
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
  }, [n]);

  const cardHeight = cardWidth * 0.68;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-roledescription="spiral gallery"
      aria-label="Spiral gallery. Scroll, drag or use the arrow keys to spin."
      className={cn(
        "relative h-full w-full cursor-grab touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:cursor-grabbing",
        className,
      )}
      style={{ perspective: 1400 }}
    >
      <div className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d", transform: "rotateX(-8deg) rotateZ(-6deg)" }}>
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute overflow-hidden rounded-xl bg-muted shadow-[0_20px_40px_-12px_rgba(0,0,0,.6)] ring-1 ring-white/10 will-change-transform"
            style={{ width: cardWidth, height: cardHeight, left: -cardWidth / 2, top: -cardHeight / 2, visibility: "hidden" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[i % images.length]} alt="" draggable={false} className="size-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
