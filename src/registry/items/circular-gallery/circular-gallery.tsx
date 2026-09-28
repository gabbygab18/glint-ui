"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, type KeyboardEvent } from "react";

export interface CircularGalleryItem {
  image: string;
  text?: string;
}

export interface CircularGalleryProps {
  items: CircularGalleryItem[];
  /** Card width in px. */
  itemWidth?: number;
  /** Card image height in px. */
  itemHeight?: number;
  /** Px between cards along the arc. */
  gap?: number;
  /** Curvature of the arc. 0 is flat, negative flips it into a bowl. */
  bend?: number;
  /** Wheel/drag multiplier. */
  scrollSpeed?: number;
  /** Easing towards the scroll target, 0-1 (lower = floatier). */
  ease?: number;
  /** Idle drift in px per second. 0 disables. */
  autoScroll?: number;
  /** Corner radius in px. */
  radius?: number;
  className?: string;
}

export function CircularGallery({
  items,
  itemWidth = 240,
  itemHeight = 300,
  gap = 36,
  bend = 2,
  scrollSpeed = 1,
  ease = 0.08,
  autoScroll = 24,
  radius = 16,
  className,
}: CircularGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ cur: 0, target: 0, hover: false, drag: null as null | { x: number; t: number }, nudge: () => {} });
  // Repeat short lists so the loop never shows a gap.
  const repeat = Math.max(1, Math.ceil(10 / Math.max(1, items.length)));
  const list = Array.from({ length: repeat }, () => items).flat();
  const stride = itemWidth + gap;

  useEffect(() => {
    const el = root.current!;
    const s = state.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = list.length * stride;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let snapTimer = 0;

    const snap = () => {
      s.target = Math.round(s.target / stride) * stride;
    };

    const layout = () => {
      const w = el.clientWidth;
      const R = bend === 0 ? Infinity : (w * 2) / Math.abs(bend);
      const dir = Math.sign(bend) || 1;
      for (let i = 0; i < cards.current.length; i++) {
        const card = cards.current[i];
        if (!card) continue;
        const raw = i * stride - s.cur;
        const u = ((((raw + total / 2) % total) + total) % total) - total / 2;
        const a = u / R;
        const x = R === Infinity ? u : R * Math.sin(a);
        const y = R === Infinity ? 0 : dir * R * (1 - Math.cos(a));
        const hidden = Math.abs(a) > 1.4 || Math.abs(x) > w / 2 + itemWidth;
        card.style.transform = `translate3d(${x - itemWidth / 2}px, ${y}px, 0) rotate(${dir * a}rad)`;
        card.style.visibility = hidden ? "hidden" : "visible";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce && autoScroll && !s.hover && !s.drag) s.target += autoScroll * dt;
      s.cur += (s.target - s.cur) * (reduce ? 1 : ease);
      layout();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    s.nudge = start;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(el);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.target += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * scrollSpeed * 0.6;
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snap, 180);
      start();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    layout();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snapTimer);
      io.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [list.length, stride, bend, scrollSpeed, ease, autoScroll, itemWidth]);

  const onKey = (e: KeyboardEvent) => {
    const s = state.current;
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    s.target = Math.round(s.target / stride + dir) * stride;
    s.nudge();
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery. Drag, scroll or use arrow keys."
      tabIndex={0}
      onKeyDown={onKey}
      onPointerEnter={() => (state.current.hover = true)}
      onPointerLeave={() => (state.current.hover = false)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        state.current.drag = { x: e.clientX, t: state.current.target };
      }}
      onPointerMove={(e) => {
        const d = state.current.drag;
        if (!d) return;
        state.current.target = d.t - (e.clientX - d.x) * scrollSpeed * 1.4;
        state.current.nudge();
      }}
      onPointerUp={() => {
        const s = state.current;
        s.drag = null;
        s.target = Math.round(s.target / stride) * stride;
      }}
      onPointerCancel={() => (state.current.drag = null)}
      className={`relative w-full cursor-grab select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing ${className ?? ""}`}
      style={{
        height: itemHeight + 190,
        touchAction: "pan-y",
        maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      {list.map((item, i) => (
        <div
          key={i}
          ref={(el) => {
            cards.current[i] = el;
          }}
          aria-hidden={i >= items.length || undefined}
          className="absolute left-1/2 top-6 will-change-transform"
          style={{ width: itemWidth, transformOrigin: "50% 50%", visibility: "hidden" }}
        >
          <img
            src={item.image}
            alt={item.text ?? ""}
            draggable={false}
            className="pointer-events-none w-full bg-muted object-cover shadow-[0_20px_40px_-18px_rgba(0,0,0,.8)]"
            style={{ height: itemHeight, borderRadius: radius }}
          />
          {item.text && <p className="mt-4 text-center text-lg font-semibold tracking-tight text-foreground">{item.text}</p>}
        </div>
      ))}
    </div>
  );
}
