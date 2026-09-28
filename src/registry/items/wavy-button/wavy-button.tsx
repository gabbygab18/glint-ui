"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

export interface WavyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Seconds per wave cycle. */
  speed?: number;
  /** Liquid level at rest, % of the button height. */
  restLevel?: number;
}

const css = `@keyframes wavy-button-flow{to{transform:translateX(-50%)}}`;
// Two full wave periods across a 100-wide box, so shifting by half loops seamlessly.
const wave = "M0 6Q12.5 0 25 6T50 6T75 6T100 6V12H0Z";
const waveCls = "absolute bottom-[calc(100%-1px)] left-0 w-[200%] motion-reduce:[animation:none]";

export function WavyButton({ speed = 2.4, restLevel = 14, className, style, children, ...props }: WavyButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`group relative isolate inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-primary/50 bg-card px-8 text-sm font-semibold text-foreground transition-[color,scale,border-color] duration-500 focus-visible:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:hover:border-primary enabled:hover:text-primary-foreground enabled:hover:delay-150 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      style={{ "--wb-rest": `${100 - restLevel}%`, ...style } as CSSProperties}
    >
      <style href="wavy-button" precedence="default">
        {css}
      </style>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 translate-y-(--wb-rest) transition-[translate] duration-900 ease-[cubic-bezier(.25,.9,.3,1)] group-focus-visible:translate-y-0 group-enabled:group-hover:translate-y-0 motion-reduce:transition-none"
      >
        <svg
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className={`${waveCls} h-3.5 text-primary/40 [animation:wavy-button-flow_1s_linear_infinite_reverse]`}
          style={{ animationDuration: `${speed * 1.6}s` }}
        >
          <path d={wave} fill="currentColor" />
        </svg>
        <svg
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className={`${waveCls} h-2.5 text-primary [animation:wavy-button-flow_1s_linear_infinite]`}
          style={{ animationDuration: `${speed}s` }}
        >
          <path d={wave} fill="currentColor" />
        </svg>
        <span className="absolute inset-0 bg-primary" />
      </span>
      {children}
    </button>
  );
}
