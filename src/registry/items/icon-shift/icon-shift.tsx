"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface IconShiftProps {
  /** Identifies the current icon. Changing it swaps the icon with the transition. */
  swapKey: string | number | boolean;
  /** The icon to show for the current key. */
  children: ReactNode;
  /** Degrees the old icon turns away and the new one turns in from. */
  rotate?: number;
  /** Blur in px at the start and end of the swap. */
  blur?: number;
  /** Scale the icons shrink to while swapping (0 to 1). */
  shrink?: number;
  /** Swap length in seconds. */
  duration?: number;
  className?: string;
}

/**
 * Swaps one icon for another in place: the old icon shrinks, blurs and turns
 * away while the new one turns in from the other side and pops to full size.
 */
export function IconShift({
  swapKey,
  children,
  rotate = 45,
  blur = 4,
  shrink = 0.4,
  duration = 0.28,
  className,
}: IconShiftProps) {
  const hidden = (dir: 1 | -1) => ({ opacity: 0, scale: shrink, rotate: rotate * dir, filter: `blur(${blur}px)` });

  return (
    <MotionConfig reducedMotion="user">
      <span className={cn("relative inline-grid place-items-center [&>*]:[grid-area:1/1]", className)}>
        <AnimatePresence initial={false}>
          <motion.span
            key={String(swapKey)}
            className="inline-grid place-items-center"
            initial={hidden(-1)}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={hidden(1)}
            transition={{ duration, ease: [0.34, 1.4, 0.64, 1] }}
          >
            {children}
          </motion.span>
        </AnimatePresence>
      </span>
    </MotionConfig>
  );
}
