"use client";

import type { CSSProperties } from "react";

export type LoaderVariant = "spinner" | "dots" | "bars" | "pulse" | "orbit";

export interface LoaderProps {
  variant?: LoaderVariant;
  /** Box size in px. */
  size?: number;
  color?: string;
  /** Speed multiplier. */
  speed?: number;
  /** Announced to screen readers. */
  label?: string;
  className?: string;
}

// Every duration is a multiple of --d, so `speed` scales the whole set at once.
const css = `
.ldr *{box-sizing:border-box}
.ldr-spin{animation:ldr-rotate calc(var(--d)*1.4s) linear infinite}
.ldr-spin circle+circle{stroke-dasharray:1 150;animation:ldr-dash calc(var(--d)*1.4s) ease-in-out infinite}
@keyframes ldr-rotate{to{transform:rotate(360deg)}}
@keyframes ldr-dash{0%{stroke-dasharray:1 150;stroke-dashoffset:0}50%{stroke-dasharray:90 150;stroke-dashoffset:-35}100%{stroke-dasharray:90 150;stroke-dashoffset:-124}}
.ldr-dot{animation:ldr-hop calc(var(--d)*1s) cubic-bezier(.45,0,.55,1) infinite both;transform-origin:50% 100%}
@keyframes ldr-hop{0%,70%,100%{transform:translateY(0) scale(1.15,.85)}20%{transform:translateY(-10%) scale(.9,1.1)}40%{transform:translateY(-70%) scale(.95,1.05)}60%{transform:translateY(0) scale(1.25,.75)}}
.ldr-bar{animation:ldr-eq calc(var(--d)*1.1s) ease-in-out infinite}
@keyframes ldr-eq{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.ldr-ripple{animation:ldr-ripple calc(var(--d)*1.8s) cubic-bezier(.2,.6,.35,1) infinite}
@keyframes ldr-ripple{0%{transform:scale(.1);opacity:1}100%{transform:scale(1);opacity:0}}
.ldr-core{animation:ldr-beat calc(var(--d)*1.8s) ease-in-out infinite}
@keyframes ldr-beat{0%,100%{transform:scale(.8)}15%{transform:scale(1.1)}30%{transform:scale(.9)}}
.ldr-orbit{animation:ldr-rotate calc(var(--d)*1.6s) cubic-bezier(.6,.1,.4,.9) infinite}
@keyframes ldr-fade{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.ldr-spin,.ldr-spin circle+circle,.ldr-dot,.ldr-bar,.ldr-ripple,.ldr-core,.ldr-orbit{animation:ldr-fade 2s ease-in-out infinite}}
`;

export function Loader({ variant = "spinner", size = 32, color = "currentColor", speed = 1, label = "Loading", className }: LoaderProps) {
  const style = { width: size, height: size, color, "--d": 1 / Math.max(0.1, speed) } as CSSProperties;
  const delay = (i: number, step: number) => ({ animationDelay: `calc(var(--d) * ${i * step}s)` });

  return (
    <span role="status" className={`ldr relative inline-grid shrink-0 place-items-center ${className ?? ""}`} style={style}>
      <style href="loader" precedence="default">
        {css}
      </style>
      <span className="sr-only">{label}</span>

      {variant === "spinner" && (
        <svg aria-hidden viewBox="0 0 50 50" className="ldr-spin size-full">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth="5" />
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )}

      {variant === "dots" && (
        <span aria-hidden className="flex h-1/2 w-full items-end justify-between px-[4%]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="ldr-dot aspect-square w-[24%] rounded-full bg-current" style={delay(i, 0.14)} />
          ))}
        </span>
      )}

      {variant === "bars" && (
        <span aria-hidden className="flex h-3/4 w-full items-center justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="ldr-bar h-full w-[13%] rounded-full bg-current" style={delay(i, 0.1)} />
          ))}
        </span>
      )}

      {variant === "pulse" && (
        <>
          {[0, 1].map((i) => (
            <span aria-hidden key={i} className="ldr-ripple absolute inset-0 rounded-full border-2 border-current" style={delay(i, 0.9)} />
          ))}
          <span aria-hidden className="ldr-core size-1/3 rounded-full bg-current" />
        </>
      )}

      {variant === "orbit" &&
        [0, 1, 2].map((i) => (
          <span aria-hidden key={i} className="ldr-orbit absolute inset-0" style={delay(i, 0.12)}>
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-current"
              style={{ width: `${26 - i * 6}%`, height: `${26 - i * 6}%`, opacity: 1 - i * 0.25 }}
            />
          </span>
        ))}
    </span>
  );
}
