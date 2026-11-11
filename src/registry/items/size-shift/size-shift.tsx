"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface SizeShiftProps {
  children: ReactNode;
  /** Which sides follow the content. "height" keeps the width from the parent. */
  axis?: "both" | "height";
  /** Change this when the content changes to fade the new content in. */
  contentKey?: string | number;
  /** Spring bounce, 0 (none) to 0.6 (springy). */
  bounce?: number;
  /** Resize length in seconds. */
  duration?: number;
  className?: string;
}

/**
 * A box that eases to the size of whatever is inside it. Swap the content and
 * the box glides to the new width and height instead of snapping, while the new
 * content fades up from a soft blur.
 */
export function SizeShift({
  children,
  axis = "both",
  contentKey,
  bounce = 0.18,
  duration = 0.45,
  className,
}: SizeShiftProps) {
  const [ref, { width, height }] = useMeasure();
  const both = axis === "both";
  const spring = { type: "spring" as const, bounce, duration };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={cn("overflow-hidden", both && "w-fit", className)}
        initial={false}
        animate={{ width: both && width ? width : "auto", height: height || "auto" }}
        transition={spring}
      >
        <div ref={ref} className={cn("relative", both && "w-max")}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={contentKey ?? "content"}
              initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } }}
              transition={{ duration: duration * 0.8, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
