"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";

export interface LayeredButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Number of layers stacked under the face. */
  layers?: number;
  /** Px between layers at rest. */
  depth?: number;
}

// Hover spreads the stack, press collapses it; release springs back with overshoot.
const motionCls =
  "transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-active:duration-75 group-active:ease-out motion-reduce:transition-none";

export function LayeredButton({ layers = 3, depth = 4, className, style, children, ...props }: LayeredButtonProps) {
  const total = layers * depth;
  // The bottom layer stays put; everything above it is spaced by --lb-gap.
  const shift = (i: number) => `translateY(calc(${total}px - ${layers - i} * var(--lb-gap)))`;

  return (
    <button
      type="button"
      {...props}
      className={`group relative inline-block select-none rounded-2xl [--lb-gap:var(--lb-depth)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring enabled:hover:[--lb-gap:calc(var(--lb-depth)*1.5)] enabled:active:[--lb-gap:calc(var(--lb-depth)*0.15)] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      style={{ "--lb-depth": `${depth}px`, paddingBottom: total, ...style } as CSSProperties}
    >
      {Array.from({ length: layers }, (_, k) => {
        const i = layers - k; // paint back to front
        return (
          <span
            key={i}
            aria-hidden
            className={`absolute inset-x-0 top-0 rounded-2xl ${motionCls}`}
            style={{
              bottom: total,
              transform: shift(i),
              background: `color-mix(in oklab, var(--primary) ${Math.round(100 - (i / layers) * 58)}%, black)`,
              boxShadow:
                i === layers ? "0 14px 28px -10px rgb(0 0 0 / .55)" : "inset 0 1px 0 rgb(255 255 255 / .12)",
            }}
          />
        );
      })}
      <span
        className={`relative flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.5),inset_0_-2px_0_rgb(0_0_0/.08)] ${motionCls}`}
        style={{ transform: shift(0) }}
      >
        {children}
      </span>
    </button>
  );
}
