"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";

export interface BackgroundPathsProps {
  /** Color at the start of each curve. */
  color?: string;
  /** Color at the end of each curve. */
  accent?: string;
  /** Curves per layer. */
  count?: number;
  /** Animation speed multiplier; 0 freezes the curves. */
  speed?: number;
  /** Stroke width multiplier. */
  strokeWidth?: number;
  className?: string;
}

const css = `
@keyframes bgp-run{from{stroke-dashoffset:1}to{stroke-dashoffset:-1}}
@keyframes bgp-breathe{0%,100%{opacity:var(--bgp-lo)}50%{opacity:var(--bgp-hi)}}
.bgp-run{animation:bgp-run var(--bgp-d) linear var(--bgp-delay) infinite,bgp-breathe calc(var(--bgp-d)*.7) ease-in-out var(--bgp-delay) infinite}
.bgp-root[data-paused] .bgp-run,.bgp-root[data-frozen] .bgp-run{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.bgp-run{animation:none;stroke-dashoffset:.35}}
`;

// Integer hash: identical on server and client (Math.sin can differ in the last bits).
const rand = (i: number, salt: number) => {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
};

/** One twisting ribbon of curves: they fan out at the edges and pinch as they cross. */
function layer(count: number, dir: 1 | -1, lift: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) - 0.5 : 0;
    const y0 = 400 + lift + t * 760 * dir;
    const y1 = 400 - lift - t * 620 * dir;
    const c1 = 400 + lift - t * 520 * dir;
    const c2 = 400 - lift + t * 900 * dir;
    return `M-120 ${y0.toFixed(1)} C 360 ${c1.toFixed(1)}, 760 ${c2.toFixed(1)}, 1320 ${y1.toFixed(1)}`;
  });
}

export function BackgroundPaths({
  color = "#a78bfa",
  accent = "#22d3ee",
  count = 32,
  speed = 1,
  strokeWidth = 1,
  className,
}: BackgroundPathsProps) {
  const root = useRef<SVGSVGElement>(null);
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const n = Math.max(1, Math.round(count));

  useEffect(() => {
    const el = root.current!;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-paused", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const layers = [
    { d: layer(n, 1, -40), grad: `${gid}a`, w: 1 },
    { d: layer(n, -1, 60), grad: `${gid}b`, w: 0.8 },
  ];
  const s = Math.max(speed, 0);

  return (
    <svg
      ref={root}
      aria-hidden
      className={`bgp-root ${className ?? ""}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      data-frozen={s === 0 ? "" : undefined}
    >
      <style href="background-paths" precedence="default">
        {css}
      </style>
      <defs>
        <linearGradient id={`${gid}a`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`${gid}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      {layers.map((l, li) => (
        <g key={li} fill="none" stroke={`url(#${l.grad})`} strokeLinecap="round">
          {l.d.map((d, i) => {
            const t = n > 1 ? i / (n - 1) : 0;
            const w = (0.4 + t * 1.2) * l.w * strokeWidth;
            const dur = (9 + rand(i, li + 1) * 10) / (s || 1);
            return (
              <g key={i}>
                <path d={d} strokeWidth={w} strokeOpacity={0.1 + t * 0.12} />
                <path
                  className="bgp-run"
                  d={d}
                  pathLength={1}
                  strokeWidth={w * 1.6}
                  strokeDasharray={`${(0.18 + rand(i, li + 7) * 0.22).toFixed(3)} 2`}
                  style={
                    {
                      "--bgp-d": `${dur.toFixed(2)}s`,
                      "--bgp-delay": `${(-rand(i, li + 3) * dur).toFixed(2)}s`,
                      "--bgp-lo": (0.35 + t * 0.25).toFixed(2),
                      "--bgp-hi": (0.75 + t * 0.25).toFixed(2),
                    } as CSSProperties
                  }
                />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
