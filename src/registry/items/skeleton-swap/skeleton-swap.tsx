"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface SkeletonSwapProps {
  /** Show the skeleton while true; the content cross-fades in when it turns false. */
  loading: boolean;
  /** The real content. */
  children: ReactNode;
  /** Custom placeholder. Defaults to an avatar and text lines. */
  skeleton?: ReactNode;
  /** Text lines in the default placeholder. */
  lines?: number;
  /** Show a round avatar in the default placeholder. */
  avatar?: boolean;
  /** Sweep a highlight across the placeholder. */
  shimmer?: boolean;
  /** Cross-fade length in seconds. */
  duration?: number;
  className?: string;
}

// Deterministic widths so server and client render the same placeholder.
const WIDTHS = [92, 78, 85, 64, 88, 71];

const css = `
@keyframes skeleton-swap-sweep { from { background-position: 150% 0 } to { background-position: -50% 0 } }
.skeleton-swap-bar {
  background: color-mix(in oklab, var(--muted-foreground) 16%, transparent);
}
.skeleton-swap-shimmer .skeleton-swap-bar {
  background-image: linear-gradient(100deg, transparent 30%, color-mix(in oklab, var(--foreground) 9%, transparent) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: skeleton-swap-sweep 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) { .skeleton-swap-shimmer .skeleton-swap-bar { animation: none } }
`;

function DefaultSkeleton({ lines, avatar }: { lines: number; avatar: boolean }) {
  return (
    <div className="flex gap-3">
      {avatar && <div className="skeleton-swap-bar size-10 shrink-0 rounded-full" />}
      <div className="flex-1 space-y-2.5 pt-1">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="skeleton-swap-bar h-3 rounded-full" style={{ width: `${i === 0 ? 45 : WIDTHS[i % WIDTHS.length]}%` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Holds a pulsing placeholder while data loads, then dissolves it into the real
 * content: the placeholder blurs out, the content sharpens in, and the box eases
 * to the content's height instead of jumping.
 */
export function SkeletonSwap({
  loading,
  children,
  skeleton,
  lines = 3,
  avatar = true,
  shimmer = true,
  duration = 0.45,
  className,
}: SkeletonSwapProps) {
  const [ref, { height }] = useMeasure();
  const fade = { duration, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionConfig reducedMotion="user">
      <style href="skeleton-swap" precedence="default">
        {css}
      </style>
      <motion.div
        className={cn("relative overflow-hidden", shimmer && "skeleton-swap-shimmer", className)}
        animate={{ height: height || "auto" }}
        initial={false}
        transition={fade}
        aria-busy={loading}
      >
        <div ref={ref} className="grid">
          <AnimatePresence initial={false}>
            {loading ? (
              <motion.div
                key="skeleton"
                aria-hidden
                className="[grid-area:1/1]"
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={fade}
              >
                {skeleton ?? <DefaultSkeleton lines={lines} avatar={avatar} />}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                className="[grid-area:1/1]"
                initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={fade}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
