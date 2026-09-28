"use client";

import type { ButtonHTMLAttributes, PointerEvent } from "react";

export interface SpecularButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Color of the specular highlight and edge light. */
  tint?: string;
}

// Registered properties so the highlight glides instead of jumping.
const css = `
@property --specular-x{syntax:"<length-percentage>";inherits:true;initial-value:50%}
@property --specular-y{syntax:"<length-percentage>";inherits:true;initial-value:0%}
.specular-button{transition:--specular-x .18s ease-out,--specular-y .18s ease-out,scale .2s,background-color .3s}
@media (prefers-reduced-motion:reduce){.specular-button{transition:none}}`;

export function SpecularButton({
  tint = "#ffffff",
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: SpecularButtonProps) {
  const track = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--specular-x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--specular-y", `${e.clientY - r.top}px`);
    onPointerMove?.(e);
  };
  const reset = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.removeProperty("--specular-x");
    e.currentTarget.style.removeProperty("--specular-y");
    onPointerLeave?.(e);
  };
  const mix = (pct: number) => `color-mix(in srgb, ${tint} ${pct}%, transparent)`;

  return (
    <button
      type="button"
      {...props}
      onPointerMove={track}
      onPointerLeave={reset}
      className={`specular-button group relative isolate inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground/[.06] px-8 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.22),inset_0_-1px_0_rgb(0_0_0/.12),0_12px_32px_-12px_rgb(0_0_0/.55)] backdrop-blur-xl backdrop-saturate-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:hover:bg-foreground/[.1] enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    >
      <style href="specular-button" precedence="default">
        {css}
      </style>
      {/* Glossy cap on the top half. */}
      <span aria-hidden className="absolute inset-x-3 top-px -z-10 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 to-white/0" />
      {/* Specular hotspot under the pointer. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 transition-opacity duration-300 group-enabled:group-hover:opacity-100 group-enabled:group-active:opacity-100"
        style={{
          background: `radial-gradient(70px 42px at var(--specular-x) var(--specular-y), ${mix(55)}, ${mix(12)} 55%, transparent 80%)`,
        }}
      />
      {/* Edge light: a pointer-centered glow masked down to a 1px rim. */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] p-px opacity-60 transition-opacity duration-300 group-enabled:group-hover:opacity-100"
        style={{
          background: `radial-gradient(110px circle at var(--specular-x) var(--specular-y), ${tint}, ${mix(18)} 70%)`,
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      />
      {children}
    </button>
  );
}
