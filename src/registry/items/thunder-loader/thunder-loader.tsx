"use client";

import { useId, type CSSProperties } from "react";

export interface ThunderLoaderProps {
  /** Px. */
  size?: number;
  color?: string;
  /** Speed multiplier of the charge / discharge cycle. */
  speed?: number;
  /** 0-100 for a determinate charge meter. Omit to loop forever. */
  progress?: number;
  /** Announced to screen readers. */
  label?: string;
  className?: string;
}

const BOLT = "M37 3 13 37h16l-4 24 26-36H34z";
// Hand-placed arcs that crackle around the bolt.
const ARCS = ["M8 14l5 3-3 3 6 2", "M52 40l5-2-2 5 5 1", "M47 8l3 5-4 1 3 5", "M11 50l5-4 1 5 4-4"];
const SPARKS = [0, 60, 120, 180, 240, 300];

const css = `
.thl{--c:1.9s}
.thl-level{transform-box:fill-box;transform:translateY(100%);animation:thl-charge calc(var(--c)*var(--d)) linear infinite}
@keyframes thl-charge{0%{transform:translateY(100%)}14%{transform:translateY(78%)}17%{transform:translateY(84%)}33%{transform:translateY(52%)}36%{transform:translateY(58%)}52%{transform:translateY(22%)}55%{transform:translateY(27%)}64%,78%{transform:translateY(0)}90%,100%{transform:translateY(100%)}}
.thl-flash{opacity:0;animation:thl-flash calc(var(--c)*var(--d)) linear infinite}
@keyframes thl-flash{0%,63%{opacity:0}65%{opacity:1}68%{opacity:.25}70%{opacity:1}84%,100%{opacity:0}}
.thl-body{transform-origin:50% 50%;animation:thl-pop calc(var(--c)*var(--d)) cubic-bezier(.3,1.6,.5,1) infinite}
@keyframes thl-pop{0%,62%{transform:scale(1)}66%{transform:scale(1.12) rotate(-3deg)}74%{transform:scale(.97)}82%,100%{transform:scale(1)}}
.thl-arc{opacity:0;animation:thl-arc calc(var(--c)*var(--d)) steps(1) infinite}
@keyframes thl-arc{0%{opacity:0}27%{opacity:.7}29%{opacity:0}47%{opacity:.9}48%{opacity:0}50%{opacity:.6}52%{opacity:0}60%{opacity:1}62%{opacity:0}64%{opacity:1}68%{opacity:.3}70%{opacity:1}74%{opacity:0}}
.thl-spark{opacity:0;animation:thl-spark calc(var(--c)*var(--d)) ease-out infinite}
@keyframes thl-spark{0%,64%{opacity:0;transform:rotate(var(--a)) translateY(-14px) scale(1)}66%{opacity:1}82%,100%{opacity:0;transform:rotate(var(--a)) translateY(-30px) scale(.2)}}
.thl-det .thl-arc{animation:thl-idle 1.3s steps(1) infinite}
@keyframes thl-idle{0%,100%{opacity:0}40%{opacity:.8}44%{opacity:0}71%{opacity:.5}73%{opacity:0}}
.thl-det .thl-flash{animation:thl-flash-once .6s ease-out forwards}
@keyframes thl-flash-once{0%{opacity:1}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.thl-level{animation:none;transform:none}.thl-flash,.thl-arc,.thl-spark{animation:none;opacity:0}.thl-body{animation:none}}
`;

export function ThunderLoader({
  size = 96,
  color = "#facc15",
  speed = 1,
  progress,
  label = "Charging",
  className,
}: ThunderLoaderProps) {
  const clip = `thl-${useId().replace(/[^\w-]/g, "")}`;
  const det = progress !== undefined;
  const p = det ? Math.min(100, Math.max(0, progress)) : 0;
  const style = { width: size, height: size, color, "--d": 1 / Math.max(0.1, speed) } as CSSProperties;

  return (
    <span
      role={det ? "progressbar" : "status"}
      aria-label={label}
      aria-valuenow={det ? Math.round(p) : undefined}
      aria-valuemin={det ? 0 : undefined}
      aria-valuemax={det ? 100 : undefined}
      className={`thl relative inline-block shrink-0 ${det ? "thl-det" : ""} ${className ?? ""}`}
      style={style}
    >
      <style href="thunder-loader" precedence="default">
        {css}
      </style>
      {!det && <span className="sr-only">{label}</span>}
      <svg aria-hidden viewBox="0 0 64 64" className="size-full overflow-visible">
        <defs>
          <clipPath id={clip}>
            <rect
              className={det ? "transition-transform duration-500 ease-out" : "thl-level"}
              x="0"
              y="0"
              width="64"
              height="64"
              style={det ? { transformBox: "fill-box", transform: `translateY(${100 - p}%)` } : undefined}
            />
          </clipPath>
        </defs>
        <g className={det ? undefined : "thl-body"}>
          <path
            d={BOLT}
            fill="currentColor"
            fillOpacity={0.08}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d={BOLT}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            clipPath={`url(#${clip})`}
            style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
          />
          {(!det || p >= 100) && (
            <path
              key={det ? "done" : "loop"}
              className="thl-flash"
              d={BOLT}
              fill="#fff"
              stroke="#fff"
              strokeWidth="2"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px currentColor) drop-shadow(0 0 14px currentColor)" }}
            />
          )}
        </g>
        {ARCS.map((d, i) => (
          <path
            key={d}
            className="thl-arc"
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animationDelay: `${-i * 0.23}s`, filter: "drop-shadow(0 0 2px currentColor)" }}
          />
        ))}
        {!det &&
          SPARKS.map((a) => (
            <circle
              key={a}
              className="thl-spark"
              cx="32"
              cy="32"
              r="1.6"
              fill="currentColor"
              style={{ "--a": `${a}deg`, transformOrigin: "32px 32px" } as CSSProperties}
            />
          ))}
      </svg>
    </span>
  );
}
