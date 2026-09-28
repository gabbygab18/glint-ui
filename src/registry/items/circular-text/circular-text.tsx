"use client";

import { useEffect, useRef, type ReactNode } from "react";

const HOVER = { none: 1, speedUp: 4, slowDown: 0.25, pause: 0, goBonkers: 14 } as const;

export interface CircularTextProps {
  text?: string;
  /** Seconds per full turn. */
  spinDuration?: number;
  /** What hovering does to the spin. */
  onHover?: keyof typeof HOVER;
  /** Diameter in px. */
  size?: number;
  /** Optional content in the middle of the ring. */
  children?: ReactNode;
  className?: string;
}

export function CircularText({
  text = "GLINT • MOTION • COMPONENTS • ",
  spinDuration = 20,
  onHover = "speedUp",
  size = 220,
  children,
  className,
}: CircularTextProps) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const r = ring.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = 0;
    let angle = 0;
    let mult = 1;
    let target = 1;
    let visible = true;

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      mult += (target - mult) * Math.min(1, dt * 4);
      angle = (angle + (360 / Math.max(spinDuration, 0.1)) * mult * dt) % 360;
      const bonkers = onHover === "goBonkers" ? 1 - Math.min(1, (mult - 1) / 13) * 0.12 : 1;
      r.style.transform = `rotate(${angle}deg) scale(${bonkers})`;
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const enter = () => (target = HOVER[onHover] ?? 1);
    const leave = () => (target = 1);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [spinDuration, onHover]);

  const chars = Array.from(text);
  return (
    <div
      ref={root}
      className={className}
      style={{ position: "relative", width: size, height: size, borderRadius: "50%", flexShrink: 0 }}
    >
      <span className="sr-only">{text}</span>
      <div ref={ring} aria-hidden style={{ position: "absolute", inset: 0, willChange: "transform" }}>
        {chars.map((c, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              height: "50%",
              fontSize: size * 0.085,
              lineHeight: 1,
              transformOrigin: "50% 100%",
              transform: `translateX(-50%) rotate(${(360 / chars.length) * i}deg)`,
              whiteSpace: "pre",
            }}
          >
            {c}
          </span>
        ))}
      </div>
      {children && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
      )}
    </div>
  );
}
