"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LeanCardProps {
  children: ReactNode;
  /** Max lean (skew) in degrees. */
  lean?: number;
  /** Px the card drifts toward the pointer. */
  drift?: number;
  /** 0 to 1: how much the content leans back the other way. */
  counter?: number;
  /** Px the shadow slides away from the pointer. */
  shadowShift?: number;
  /** Follow speed. Higher is snappier. */
  stiffness?: number;
  /** Soft light that follows the pointer. */
  glare?: boolean;
  className?: string;
  /** Classes for the inner content layer. */
  contentClassName?: string;
}

export function LeanCard({
  children,
  lean = 7,
  drift = 10,
  counter = 0.6,
  shadowShift = 22,
  stiffness = 9,
  glare = true,
  className,
  contentClassName,
}: LeanCardProps) {
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = { x: 0, y: 0, h: 0 };
    const cur = { x: 0, y: 0, h: 0 };
    let raf = 0;
    let prev = 0;

    const apply = () => {
      if (!card.current || !inner.current) return; // unmounted
      const { x, y, h } = cur;
      const a = -x * lean;
      card.current!.style.transform = `translate3d(${x * drift}px, ${y * drift * 0.6}px, 0) skewX(${a}deg) rotateX(${-y * lean * 0.6}deg) scale(${1 + h * 0.02})`;
      card.current!.style.boxShadow = `${-x * shadowShift}px ${18 - y * shadowShift * 0.6 + h * 10}px ${40 + h * 20}px -14px rgba(0,0,0,${0.35 + h * 0.2})`;
      inner.current!.style.transform = `translate3d(${-x * drift * counter}px, ${-y * drift * counter * 0.6}px, 0) skewX(${-a * counter}deg)`;
      if (light.current) {
        light.current.style.opacity = String(h);
        light.current.style.background = `radial-gradient(circle at ${50 + x * 50}% ${50 + y * 50}%, rgba(255,255,255,.14), transparent 60%)`;
      }
    };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - (prev || now)) / 1000);
      prev = now;
      const k = 1 - Math.exp(-stiffness * dt);
      let moving = false;
      for (const key of ["x", "y", "h"] as const) {
        cur[key] += (target[key] - cur[key]) * k;
        if (Math.abs(target[key] - cur[key]) > 0.0005) moving = true;
      }
      apply();
      raf = moving ? requestAnimationFrame(loop) : 0;
      if (!moving) prev = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      target.h = 1;
      kick();
    };
    const leave = () => {
      target.x = target.y = target.h = 0;
      kick();
    };
    apply();
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [lean, drift, counter, shadowShift, stiffness]);

  return (
    <div ref={root} className="p-4" style={{ perspective: 900 }}>
      <div
        ref={card}
        className={cn("relative overflow-hidden rounded-3xl border border-border bg-card", className)}
        style={{ transformOrigin: "50% 100%", willChange: "transform", boxShadow: "0 18px 40px -14px rgba(0,0,0,.35)" }}
      >
        <div ref={inner} className={cn("relative", contentClassName)} style={{ willChange: "transform" }}>
          {children}
        </div>
        {glare && <div ref={light} aria-hidden className="pointer-events-none absolute inset-0 opacity-0" />}
      </div>
    </div>
  );
}
