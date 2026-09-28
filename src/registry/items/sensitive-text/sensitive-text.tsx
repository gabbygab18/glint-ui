"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface SensitiveTextProps {
  children: ReactNode;
  /** Reveal while hovered/focused, or toggle on click/Enter/Space. */
  revealOn?: "hover" | "click";
  /** Blur applied to the hidden text, in px. */
  blur?: number;
  /** Particle density multiplier for the noise veil. */
  density?: number;
  /** Particle drift speed multiplier. */
  speed?: number;
  /** Accessible label for the hidden state. */
  label?: string;
  className?: string;
}

export function SensitiveText({
  children,
  revealOn = "hover",
  blur = 8,
  density = 1,
  speed = 1,
  label = "Hidden text, activate to reveal",
  className,
}: SensitiveTextProps) {
  const root = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const revealed = revealOn === "hover" ? hover : open;
  const visible = useRef(true);
  useEffect(() => {
    visible.current = !revealed;
  }, [revealed]);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let dots: { x: number; y: number; vx: number; vy: number; p: number }[] = [];
    let color = "#fff";

    const resize = () => {
      w = el.offsetWidth + 8;
      h = el.offsetHeight + 4;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(el).color;
      const count = Math.round(((w * h) / 9) * density);
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        p: Math.random() * Math.PI * 2,
      }));
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const d of dots) {
        d.x = (d.x + d.vx * speed + w) % w;
        d.y = (d.y + d.vy * speed + h) % h;
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(d.p + t * 0.002 * speed));
        ctx.fillRect(d.x, d.y, 1.2, 1.2);
      }
    };

    let raf = 0;
    let onScreen = false;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (visible.current) draw(t);
    };
    const ro = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (onScreen && !reduced) raf = requestAnimationFrame(loop);
    });
    ro.observe(el);
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [density, speed]);

  return (
    <span
      ref={root}
      role="button"
      tabIndex={0}
      aria-pressed={revealOn === "click" ? open : undefined}
      aria-label={revealed ? undefined : label}
      className={`relative inline-block cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
    >
      <span
        aria-hidden={!revealed}
        style={{
          display: "inline-block",
          filter: revealed ? "blur(0)" : `blur(${blur}px)`,
          opacity: revealed ? 1 : 0.35,
          transition: "filter .5s ease, opacity .5s ease",
        }}
      >
        {children}
      </span>
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: -4,
          top: -2,
          width: "calc(100% + 8px)",
          height: "calc(100% + 4px)",
          opacity: revealed ? 0 : 1,
          transform: revealed ? "scale(1.08)" : "none",
          transition: "opacity .45s ease, transform .6s ease",
        }}
      />
    </span>
  );
}
