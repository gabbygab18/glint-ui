"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface TextSpotlightProps {
  text: string;
  /** Spotlight radius, in px. */
  radius?: number;
  /** Opacity of the unlit text, 0–1. */
  dim?: number;
  /** Lit gradient start color. */
  from?: string;
  /** Lit gradient end color. */
  to?: string;
  /** Follow lag, 0 = instant, closer to 1 = floatier. */
  smoothing?: number;
  /** Drift the light on its own while the pointer is away. */
  autoPlay?: boolean;
  className?: string;
}

export function TextSpotlight({
  text,
  radius = 180,
  dim = 0.14,
  from = "#a3e635",
  to = "#22d3ee",
  smoothing = 0.85,
  autoPlay = true,
  className,
}: TextSpotlightProps) {
  const root = useRef<HTMLDivElement>(null);
  const opts = useRef({ smoothing, autoPlay });
  useEffect(() => {
    opts.current = { smoothing, autoPlay };
  }, [smoothing, autoPlay]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = { x: -9999, y: -9999, o: 0 };
    const target = { x: 0, y: 0, inside: false };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      if (!target.inside && cur.o < 0.05) {
        cur.x = target.x;
        cur.y = target.y;
      }
      target.inside = true;
    };
    const onLeave = () => (target.inside = false);

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const { smoothing: s, autoPlay: auto } = opts.current;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!target.inside && auto) {
        const k = reduced ? 0 : t / 1000;
        target.x = w * (0.5 + 0.42 * Math.sin(k * 0.55));
        target.y = h * (0.5 + 0.38 * Math.sin(k * 0.9 + 1.3));
        if (cur.x < -999) {
          cur.x = target.x;
          cur.y = target.y;
        }
      }
      const f = reduced ? 1 : 1 - Math.min(Math.max(s, 0), 0.98);
      cur.x += (target.x - cur.x) * f;
      cur.y += (target.y - cur.y) * f;
      cur.o += ((target.inside || auto ? 1 : 0) - cur.o) * 0.08;
      el.style.setProperty("--ts-x", `${cur.x.toFixed(1)}px`);
      el.style.setProperty("--ts-y", `${cur.y.toFixed(1)}px`);
      el.style.setProperty("--ts-o", cur.o.toFixed(3));
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(tick);
    });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const mask = `radial-gradient(circle ${radius}px at var(--ts-x) var(--ts-y), #000 0%, rgba(0,0,0,.6) 45%, transparent 100%)`;

  return (
    <div
      ref={root}
      className={className}
      style={{ position: "relative", "--ts-x": "-9999px", "--ts-y": "-9999px", "--ts-o": 0 } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden style={{ opacity: dim }}>
        {text}
      </span>
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          color: "transparent",
          backgroundImage: `linear-gradient(120deg, ${from}, ${to})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitMaskImage: mask,
          maskImage: mask,
          opacity: "var(--ts-o)",
          filter: `drop-shadow(0 0 16px color-mix(in srgb, ${from} 45%, transparent))`,
        }}
      >
        {text}
      </span>
    </div>
  );
}
