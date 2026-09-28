"use client";

import type { PointerEvent, ReactNode } from "react";

export interface SpotlightCardProps {
  children: ReactNode;
  spotlightColor?: string;
  /** Spotlight diameter in px. */
  size?: number;
  className?: string;
}

export function SpotlightCard({
  children,
  spotlightColor = "rgba(198, 255, 61, 0.18)",
  size = 400,
  className,
}: SpotlightCardProps) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  return (
    <div
      onPointerMove={onMove}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-8 ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${size / 2}px circle at var(--spot-x) var(--spot-y), ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
