"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PixelTransitionProps {
  /** Face shown at rest. */
  children: ReactNode;
  /** Face revealed on hover, focus or tap. */
  back: ReactNode;
  /** Pixels per row and column. */
  gridSize?: number;
  pixelColor?: string;
  /** Total ms for cover + reveal. */
  duration?: number;
  /** Accessible label for the card. */
  label?: string;
  className?: string;
}

const shuffle = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function PixelTransition({
  children,
  back,
  gridSize = 12,
  pixelColor = "#c6ff3d",
  duration = 700,
  label = "Flip card",
  className,
}: PixelTransitionProps) {
  const grid = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const rear = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showing = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const swapFaces = (toBack: boolean) => {
    front.current!.style.visibility = toBack ? "hidden" : "visible";
    rear.current!.style.visibility = toBack ? "visible" : "hidden";
  };

  const run = (toBack: boolean) => {
    if (showing.current === toBack) return;
    showing.current = toBack;
    clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return swapFaces(toBack);

    const pixels = Array.from(grid.current!.children) as HTMLElement[];
    const half = duration / 2;
    // Each pixel pops in at a random step, the face swaps under full cover, then pixels pop out in a new order.
    shuffle(pixels.length).forEach((rank, i) => {
      pixels[i].style.transitionDelay = `${(rank / pixels.length) * half}ms`;
      pixels[i].style.opacity = "1";
    });
    timer.current = setTimeout(() => {
      swapFaces(toBack);
      shuffle(pixels.length).forEach((rank, i) => {
        pixels[i].style.transitionDelay = `${(rank / pixels.length) * half}ms`;
        pixels[i].style.opacity = "0";
      });
    }, half);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onPointerEnter={(e) => e.pointerType === "mouse" && run(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && run(false)}
      onClick={() => run(!showing.current)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          run(!showing.current);
        }
      }}
    >
      <div ref={front} className="absolute inset-0">
        {children}
      </div>
      <div ref={rear} className="absolute inset-0" style={{ visibility: "hidden" }}>
        {back}
      </div>
      <div
        ref={grid}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, i) => (
          // Slight overdraw hides hairline seams between neighbouring pixels.
          <span key={i} style={{ background: pixelColor, opacity: 0, transition: "opacity 0s", margin: -0.5 }} />
        ))}
      </div>
    </div>
  );
}
