"use client";

import { useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

type NativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

export interface SlingButtonProps extends NativeProps {
  /** Px the button must be pulled back to fire on release. */
  threshold?: number;
  /** How far the button follows the pointer while pulled, 0-1. */
  elasticity?: number;
}

const css = `@keyframes sling-button-ping{from{transform:scale(1);opacity:.8}to{transform:scale(1.6);opacity:0}}`;
const origin = { top: 0, left: 0, right: 0, bottom: 0 };

export function SlingButton({
  threshold = 50,
  elasticity = 0.5,
  className,
  style,
  children,
  disabled,
  onClick,
  onPointerDown,
  ...props
}: SlingButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const down = useRef<{ x: number; y: number } | null>(null);
  const reduce = useReducedMotion();
  const [shots, setShots] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dist = useTransform(() => Math.hypot(x.get(), y.get()));
  const bandOpacity = useTransform(dist, [0, 10], [0, 1]);
  const bandWidth = useTransform(dist, [0, threshold * 2], [3, 1.25]);
  const bandColor = useTransform(dist, (d) =>
    d >= threshold ? "var(--primary)" : "var(--muted-foreground)",
  );
  const ring = useTransform(dist, (d) =>
    d >= threshold
      ? "0 0 0 3px color-mix(in oklab, var(--primary) 45%, transparent), 0 14px 30px -12px var(--primary)"
      : "0 0 0 0px transparent, 0 10px 24px -14px rgb(0 0 0 / .6)",
  );

  const release = () => {
    const fire = dist.get() >= threshold;
    if (reduce) {
      x.set(0);
      y.set(0);
    } else {
      // Low damping when fired so it whips past the anchor and wobbles home.
      const spring = { type: "spring", stiffness: 520, damping: fire ? 9 : 24 } as const;
      animate(x, 0, spring);
      animate(y, 0, spring);
    }
    if (fire) {
      setShots((s) => s + 1);
      ref.current?.click(); // detail === 0, so handleClick lets it through
    }
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const d = down.current;
    // A real click landing after a drag is just the tail of the pull: ignore it.
    if (e.detail > 0 && d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
    onClick?.(e);
  };

  return (
    <span className="relative inline-grid place-items-center">
      <style href="sling-button" precedence="default">
        {css}
      </style>
      {/* Rubber bands: anchored at the resting left/right edges, stretched to where the button is now. */}
      {["left-0", "right-0"].map((side) => (
        <svg key={side} aria-hidden className={`pointer-events-none absolute top-1/2 ${side} size-px overflow-visible`}>
          <motion.line
            x1={0}
            y1={0}
            x2={x}
            y2={y}
            strokeLinecap="round"
            style={{ opacity: bandOpacity, strokeWidth: bandWidth, stroke: bandColor }}
          />
          <motion.circle r={3.5} style={{ opacity: bandOpacity, fill: bandColor }} />
        </svg>
      ))}
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        {...props}
        drag={!disabled}
        dragConstraints={origin}
        dragElastic={elasticity}
        dragMomentum={false}
        onDragEnd={release}
        onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
          down.current = { x: e.clientX, y: e.clientY };
          onPointerDown?.(e);
        }}
        onClick={handleClick}
        style={{ ...style, x, y, boxShadow: ring }}
        className={`relative inline-flex h-12 cursor-grab touch-none select-none items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-[scale] duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring enabled:active:scale-[0.96] enabled:active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      >
        <span aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/.45)]" />
        {shots > 0 && (
          <span
            key={shots}
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-primary [animation:sling-button-ping_.6s_ease-out_forwards] motion-reduce:hidden"
          />
        )}
        <span className="relative">{children}</span>
      </motion.button>
    </span>
  );
}
