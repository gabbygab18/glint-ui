"use client";

import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface UndoBarProps {
  /** Show the bar. Set it again to restart the countdown. */
  open: boolean;
  /** What just happened, e.g. "Message deleted". */
  message: string;
  /** Called when Undo is pressed. */
  onUndo?: () => void;
  /** Called when the countdown runs out without an undo. */
  onExpire?: () => void;
  /** Seconds before the action is final. */
  duration?: number;
  /** Undo button text. */
  actionLabel?: string;
  /** "fixed" pins it to the viewport; "absolute" keeps it inside the nearest positioned parent. */
  position?: "fixed" | "absolute";
  className?: string;
}

const R = 9;
const C = 2 * Math.PI * R;

/**
 * A snackbar for reversible actions: it rises in after a delete, a ring counts
 * down the seconds left to undo, and hovering or focusing it pauses the clock.
 */
export function UndoBar({
  open,
  message,
  onUndo,
  onExpire,
  duration = 5,
  actionLabel = "Undo",
  position = "fixed",
  className,
}: UndoBarProps) {
  const progress = useMotionValue(1);
  const dash = useTransform(progress, (p) => C * (1 - p));
  const seconds = useTransform(progress, (p) => Math.max(1, Math.ceil(p * duration)));
  const clock = useRef<AnimationPlaybackControls | null>(null);
  const expire = useRef(onExpire);

  useEffect(() => {
    expire.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!open) return;
    progress.set(1);
    const c = animate(progress, 0, { duration, ease: "linear", onComplete: () => expire.current?.() });
    clock.current = c;
    return () => c.stop();
  }, [open, duration, message, progress]);

  const pause = () => clock.current?.pause();
  const resume = () => clock.current?.play();

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "pointer-events-none inset-x-0 bottom-4 z-50 flex justify-center px-4",
          position === "fixed" ? "fixed" : "absolute",
          className,
        )}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              key="undo-bar"
              role="status"
              aria-live="polite"
              onPointerEnter={pause}
              onPointerLeave={resume}
              onFocus={pause}
              onBlur={resume}
              className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-foreground py-1.5 pl-2 pr-1.5 text-sm text-background shadow-2xl"
              initial={{ y: 24, opacity: 0, scale: 0.92, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ y: 16, opacity: 0, scale: 0.96, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}
            >
              <span className="relative grid size-7 place-items-center" aria-hidden>
                <svg viewBox="0 0 24 24" className="absolute inset-0 size-full -rotate-90">
                  <circle cx="12" cy="12" r={R} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r={R}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    style={{ strokeDashoffset: dash }}
                  />
                </svg>
                <motion.span className="text-[11px] font-semibold tabular-nums">{seconds}</motion.span>
              </span>
              <span className="whitespace-nowrap font-medium">{message}</span>
              <button
                type="button"
                onClick={onUndo}
                className="rounded-full bg-background/15 px-3 py-1 text-sm font-semibold transition-colors hover:bg-background/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/70"
              >
                {actionLabel}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
