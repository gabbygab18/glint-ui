"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";

export interface ElectricTextProps {
  text: string;
  /** Arc color. */
  color?: string;
  /** Displacement strength, in px. */
  intensity?: number;
  /** Crackle updates per second. */
  speed?: number;
  /** Soft outer glow. */
  glow?: boolean;
  className?: string;
}

export function ElectricText({
  text,
  color = "#7dd3fc",
  intensity = 6,
  speed = 24,
  glow = true,
  className,
}: ElectricTextProps) {
  const root = useRef<HTMLSpanElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const id = `el${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = root.current;
    const turbs = svg.current?.querySelectorAll("feTurbulence");
    if (!el || !turbs || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = 0;
    let seed = 1;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 1000 / speed) return;
      last = t;
      seed = (seed * 16807) % 2147483647;
      turbs.forEach((f, i) => {
        f.setAttribute("seed", String((seed >> (i * 3)) % 1000));
        const fx = 0.018 + 0.01 * Math.sin(t / 700 + i);
        f.setAttribute("baseFrequency", `${fx.toFixed(4)} ${(fx * 3).toFixed(4)}`);
      });
      el.style.setProperty("--el-flicker", String(0.75 + ((seed >> 5) % 25) / 100));
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  const layer: CSSProperties = {
    position: "absolute",
    inset: 0,
    color: "transparent",
    pointerEvents: "none",
  };

  return (
    <span
      ref={root}
      className={className}
      style={{ position: "relative", display: "inline-block", color: "#f0f9ff", "--el-flicker": 1 } as CSSProperties}
    >
      <svg ref={svg} aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        {[0, 1].map((i) => (
          <filter key={i} id={`${id}-${i}`} x="-20%" y="-40%" width="140%" height="180%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.02 0.06" numOctaves={2} seed={i + 1} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={intensity * (i ? 1.6 : 1)} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </svg>
      <span className="sr-only">{text}</span>
      {glow && (
        <span
          aria-hidden
          style={{
            ...layer,
            WebkitTextStroke: `6px ${color}`,
            filter: `url(#${id}-1) blur(10px)`,
            opacity: "calc(var(--el-flicker) * 0.7)",
          }}
        >
          {text}
        </span>
      )}
      <span aria-hidden style={{ textShadow: `0 0 18px ${color}88`, position: "relative" }}>
        {text}
      </span>
      <span
        aria-hidden
        style={{
          ...layer,
          WebkitTextStroke: `2px ${color}`,
          filter: `url(#${id}-0) drop-shadow(0 0 6px ${color})`,
          opacity: "var(--el-flicker)",
        }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{ ...layer, WebkitTextStroke: "1px #ffffff", filter: `url(#${id}-1)`, opacity: 0.8 }}
      >
        {text}
      </span>
    </span>
  );
}
