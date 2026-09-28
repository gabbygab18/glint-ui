"use client";

import type { ButtonHTMLAttributes, PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export interface OrbButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Orb core color. */
  colorA?: string;
  /** Orb outer color. */
  colorB?: string;
}

const css = `@keyframes orb-button-drift{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.18) rotate(180deg)}}`;
const follow = { stiffness: 180, damping: 20, mass: 0.6 };

export function OrbButton({
  colorA = "#a78bfa",
  colorB = "#22d3ee",
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: OrbButtonProps) {
  // Offsets from the button center; the orb eases toward them.
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, follow);
  const y = useSpring(ty, follow);

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    tx.set(e.clientX - r.left - r.width / 2);
    ty.set(e.clientY - r.top - r.height / 2);
    onPointerMove?.(e);
  };
  const leave = (e: PointerEvent<HTMLButtonElement>) => {
    tx.set(0);
    ty.set(0);
    onPointerLeave?.(e);
  };

  return (
    <button
      type="button"
      {...props}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`group relative isolate inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full border border-border bg-card px-8 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.08),0_10px_30px_-12px_rgb(0_0_0/.5)] transition-[scale,border-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:hover:border-foreground/20 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    >
      <style href="orb-button" precedence="default">
        {css}
      </style>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -ml-14 -mt-14 size-28"
        style={{ x, y }}
      >
        <span className="block size-full scale-[.6] opacity-70 blur-lg transition-[scale,opacity] duration-500 ease-out group-focus-visible:scale-100 group-focus-visible:opacity-100 group-enabled:group-hover:scale-100 group-enabled:group-hover:opacity-100">
          <span
            className="block size-full rounded-full [animation:orb-button-drift_7s_ease-in-out_infinite] motion-reduce:[animation:none]"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgb(255 255 255 / .5), transparent 22%), radial-gradient(circle at 38% 36%, ${colorA}, ${colorB} 52%, transparent 72%)`,
            }}
          />
        </span>
      </motion.span>
      <span aria-hidden className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-white/[.07] to-transparent" />
      {children}
    </button>
  );
}
