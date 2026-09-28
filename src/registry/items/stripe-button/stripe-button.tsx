"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

export interface StripeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Stripe tile size in px (two stripes per tile). */
  stripeSize?: number;
  /** Seconds for the stripes to scroll one tile. */
  speed?: number;
}

const css = `@keyframes stripe-button-scroll{to{background-position:var(--sb-size) 0}}`;

export function StripeButton({ stripeSize = 18, speed = 0.5, className, style, children, ...props }: StripeButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`group relative isolate inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.4),inset_0_-2px_0_rgb(0_0_0/.1),0_8px_24px_-12px_var(--primary)] transition-[scale,translate,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:hover:-translate-y-px enabled:hover:shadow-[inset_0_1px_0_rgb(255_255_255/.4),inset_0_-2px_0_rgb(0_0_0/.1),0_12px_30px_-10px_var(--primary)] enabled:active:translate-y-0 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      style={{ "--sb-size": `${stripeSize}px`, ...style } as CSSProperties}
    >
      <style href="stripe-button" precedence="default">
        {css}
      </style>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 opacity-45 transition-opacity duration-300 [animation:stripe-button-scroll_1s_linear_infinite] [animation-play-state:paused] group-focus-visible:opacity-100 group-focus-visible:[animation-play-state:running] group-enabled:group-hover:opacity-100 group-enabled:group-hover:[animation-play-state:running] motion-reduce:[animation:none]"
        style={
          {
            "--sb-c": "color-mix(in oklab, var(--primary-foreground) 16%, transparent)",
            backgroundImage:
              "linear-gradient(135deg, var(--sb-c) 25%, transparent 25% 50%, var(--sb-c) 50% 75%, transparent 75%)",
            backgroundSize: "var(--sb-size) var(--sb-size)",
            animationDuration: `${speed}s`,
          } as CSSProperties
        }
      />
      {/* Soft top sheen so the stripes read as under glass. */}
      <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
      {children}
    </button>
  );
}
