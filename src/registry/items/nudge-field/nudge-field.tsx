"use client";

import { AnimatePresence, MotionConfig, motion, useAnimate } from "motion/react";
import { useEffect, useId, useRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface NudgeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  /** Error message. The field shakes when it appears or changes. */
  error?: string;
  /** Bump this on every failed submit to shake again with the same error. */
  attempt?: number;
  /** Shake distance in px. */
  intensity?: number;
  /** Shake length in seconds. */
  duration?: number;
  className?: string;
}

/**
 * A text field that answers a bad value with a quick, damped head-shake,
 * turns its border to the destructive color and slides the message in below.
 */
export function NudgeField({
  label,
  error,
  attempt = 0,
  intensity = 9,
  duration = 0.45,
  className,
  id,
  ...input
}: NudgeFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const msgId = `${fieldId}-error`;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!error || !scope.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Damped: each swing is smaller than the last, then it settles at rest.
    const i = intensity;
    animate(scope.current, { x: [0, -i, i * 0.8, -i * 0.55, i * 0.35, -i * 0.15, 0] }, { duration, ease: "easeOut" });
  }, [error, attempt, intensity, duration, animate, scope]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("grid gap-1.5", className)}>
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div ref={scope}>
          <input
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={error ? msgId : undefined}
            className={cn(
              "h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground",
              error
                ? "border-destructive focus:ring-[3px] focus:ring-destructive/25"
                : "border-border focus:border-ring focus:ring-[3px] focus:ring-ring/30",
            )}
            {...input}
          />
        </div>
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              key="error"
              id={msgId}
              role="alert"
              className="overflow-hidden text-xs font-medium text-destructive"
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
