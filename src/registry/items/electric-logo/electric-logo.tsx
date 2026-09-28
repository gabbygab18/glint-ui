"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_PATH =
  "M100 18 L171 59 L171 141 L100 182 L29 141 L29 59 Z M113 46 L68 110 L99 110 L87 154 L132 90 L101 90 Z";

export interface ElectricLogoProps {
  /** SVG path data drawn in a 200×200 viewBox. */
  path?: string;
  /** Rendered size in px. */
  size?: number;
  color?: string;
  /** Current speed multiplier. */
  speed?: number;
  /** Px of electric jitter. */
  jitter?: number;
  /** Glow strength multiplier. */
  glow?: number;
  /** Stroke width in viewBox units. */
  strokeWidth?: number;
  /** Accessible name; omit for a decorative logo. */
  label?: string;
  className?: string;
}

const css = `
@keyframes electric-logo-run{to{stroke-dashoffset:-1000}}
@media (prefers-reduced-motion: reduce){[data-electric-logo] *{animation:none!important}}
`;

export function ElectricLogo({
  path = DEFAULT_PATH,
  size = 240,
  color = "#c6ff3d",
  speed = 1,
  jitter = 3,
  glow = 1,
  strokeWidth = 2.5,
  label,
  className,
}: ElectricLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useId().replace(/[^\w-]/g, "");

  useEffect(() => {
    const svg = svgRef.current!;
    const turb = svg.querySelector("feTurbulence")!;
    const halo = svg.querySelector<SVGGElement>("[data-halo]")!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = 0;
    let visible = true;
    // Reseeding the noise ~14x a second gives the hard, stepped flicker of real arcs.
    const tick = (now: number) => {
      if (now - last > 70) {
        last = now;
        turb.setAttribute("seed", String((Math.random() * 999) | 0));
        halo.style.opacity = String(0.65 + Math.random() * 0.35);
      }
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(svg);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const run = (seconds: number, reverse = false) => ({
    animation: `electric-logo-run ${seconds / speed}s linear infinite${reverse ? " reverse" : ""}`,
  });
  const common = { d: path, pathLength: 1000, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <>
      <style href="electric-logo" precedence="default">
        {css}
      </style>
      <svg
      ref={svgRef}
      data-electric-logo=""
      viewBox="-20 -20 240 240"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`${id}-zap`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="2" seed="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={jitter * 2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6 * glow} />
        </filter>
      </defs>
      <path {...common} stroke={color} strokeWidth={strokeWidth} opacity={0.16} />
      <g filter={`url(#${id}-zap)`}>
        <g data-halo filter={`url(#${id}-glow)`}>
          <path {...common} stroke={color} strokeWidth={strokeWidth * 4} strokeDasharray="160 340" style={run(2.6)} />
          <path {...common} stroke={color} strokeWidth={strokeWidth * 3} strokeDasharray="70 180" style={run(3.8, true)} />
        </g>
        <path {...common} stroke={color} strokeWidth={strokeWidth} strokeDasharray="160 340" style={run(2.6)} />
        <path {...common} stroke={color} strokeWidth={strokeWidth * 0.8} strokeDasharray="70 180" style={run(3.8, true)} />
        <path {...common} stroke="#fff" strokeWidth={strokeWidth * 0.45} strokeDasharray="110 390" style={run(2.6)} />
      </g>
    </svg>
    </>
  );
}
