"use client";

import type { ButtonHTMLAttributes, PointerEvent } from "react";

export interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  gradientFrom?: string;
  gradientTo?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-13 px-8 text-base" };

export function ShinyButton({
  gradientFrom = "#c6ff3d",
  gradientTo = "#22d3ee",
  size = "md",
  className,
  children,
  onPointerMove,
  ...props
}: ShinyButtonProps) {
  const track = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--shine-x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--shine-y", `${e.clientY - r.top}px`);
    onPointerMove?.(e);
  };

  return (
    <button
      {...props}
      onPointerMove={track}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium text-foreground outline-offset-4 transition-transform active:scale-[0.97] ${sizes[size]} ${className ?? ""}`}
      style={{
        background: `radial-gradient(160px circle at var(--shine-x, 50%) var(--shine-y, 50%), ${gradientFrom}, ${gradientTo} 45%, rgba(255,255,255,.12) 70%)`,
      }}
    >
      {/* Inner fill leaves a 1px ring where the gradient shows as a border. */}
      <span
        aria-hidden
        className="absolute inset-px rounded-full bg-card transition-colors group-hover:bg-muted"
      />
      <span
        aria-hidden
        className="absolute inset-px rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120px circle at var(--shine-x, 50%) var(--shine-y, 50%), ${gradientFrom}33, transparent 70%)`,
        }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}
