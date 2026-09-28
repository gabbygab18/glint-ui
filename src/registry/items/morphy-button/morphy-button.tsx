"use client";

import type { ButtonHTMLAttributes } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

export type MorphyStatus = "idle" | "loading" | "success";

export interface MorphyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual state: pill label, spinner circle, or check. */
  status?: MorphyStatus;
  /** Fill color in the success state. */
  successColor?: string;
}

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;
const swap = {
  initial: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
  transition: { duration: 0.22 },
};

export function MorphyButton({
  status = "idle",
  successColor = "#22c55e",
  className,
  children,
  ...props
}: MorphyButtonProps) {
  const idle = status === "idle";
  const success = status === "success";

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        aria-busy={status === "loading"}
        {...props}
        className={`group inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      >
        <motion.span
          initial={false}
          animate={{ width: idle ? "auto" : 48, scale: success ? [1, 1.12, 1] : 1 }}
          transition={{ width: spring, scale: { duration: 0.45, ease: "easeOut" } }}
          className={`relative flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.4),0_8px_24px_-12px_var(--primary)] transition-[background-color,filter] duration-300 group-enabled:group-hover:brightness-110`}
          style={success ? { backgroundColor: successColor, color: "#fff" } : undefined}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {idle && (
              <motion.span key="label" {...swap} className="flex items-center gap-2 whitespace-nowrap px-8">
                {children}
              </motion.span>
            )}
            {status === "loading" && (
              <motion.span key="spin" {...swap} className="grid place-items-center">
                <svg viewBox="0 0 24 24" fill="none" className="size-5 animate-spin" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
                  <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.span>
            )}
            {success && (
              <motion.span key="check" {...swap} className="grid place-items-center">
                <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
                  />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
        <span className="sr-only" aria-live="polite">
          {status === "loading" ? "Loading" : success ? "Done" : ""}
        </span>
      </button>
    </MotionConfig>
  );
}
