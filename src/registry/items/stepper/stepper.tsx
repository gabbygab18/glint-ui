"use client";

import { Children, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface StepProps {
  /** Label under the step's dot. */
  title?: string;
  children?: ReactNode;
}

/** One step of a `Stepper`. Renders its children when active. */
export function Step({ children }: StepProps) {
  return <>{children}</>;
}

export interface StepperProps {
  /** `Step` elements, one per step. */
  children: ReactNode;
  /** 1-based step to start on. */
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  backText?: string;
  nextText?: string;
  completeText?: string;
  /** Shown after the last step is completed. */
  completedContent?: ReactNode;
  /** Let users jump to a step by clicking its dot. */
  clickableSteps?: boolean;
  /** Active and completed color. */
  accentColor?: string;
  /** Text/icon color on top of the accent. */
  accentForeground?: string;
  className?: string;
}

const spring = { type: "spring", stiffness: 380, damping: 34 } as const;

export function Stepper({
  children,
  initialStep = 1,
  onStepChange,
  onComplete,
  backText = "Back",
  nextText = "Continue",
  completeText = "Complete",
  completedContent,
  clickableSteps = true,
  accentColor = "#c6ff3d",
  accentForeground = "#0a0a0a",
  className,
}: StepperProps) {
  const steps = Children.toArray(children) as ReactElement<StepProps>[];
  const total = steps.length;
  const [{ step, dir, done }, setNav] = useState(() => ({ step: Math.min(Math.max(1, initialStep), total), dir: 1, done: false }));
  const reduce = useReducedMotion();
  const [measure, bounds] = useMeasure();

  const go = (next: number) => {
    if (next === step || next < 1 || next > total) return;
    setNav({ step: next, dir: next > step ? 1 : -1, done: false });
    onStepChange?.(next);
  };
  const finish = () => {
    setNav({ step, dir: 1, done: true });
    onComplete?.();
  };
  const restart = () => {
    setNav({ step: 1, dir: -1, done: false });
    onStepChange?.(1);
  };

  const slide = reduce ? 0 : 48;
  const variants = {
    enter: (d: number) => ({ x: d * slide, opacity: 0, filter: reduce ? "none" : "blur(4px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d: number) => ({ x: -d * slide, opacity: 0, filter: reduce ? "none" : "blur(4px)" }),
  };
  const vars = { "--st-accent": accentColor, "--st-fg": accentForeground } as CSSProperties;
  const current = done ? total + 1 : step;

  return (
    <div className={cn("w-full max-w-md rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl sm:p-8", className)} style={vars}>
      {/* Indicator row */}
      <ol className={cn("flex items-center", steps.some((x) => x.props.title) && "sm:pb-7")} aria-label="Progress">
        {steps.map((s, i) => {
          const n = i + 1;
          const state = n < current ? "complete" : n === current ? "active" : "upcoming";
          const canClick = clickableSteps && !done && n !== step;
          return (
            <li key={n} className={cn("flex items-center", n < total && "flex-1")}>
              <button
                type="button"
                disabled={!canClick}
                onClick={() => go(n)}
                aria-current={state === "active" ? "step" : undefined}
                aria-label={`Step ${n}${s.props.title ? `: ${s.props.title}` : ""}, ${state}`}
                className="group relative rounded-full outline-none enabled:cursor-pointer disabled:cursor-default"
              >
                <motion.span
                  className="relative grid size-9 place-items-center rounded-full text-sm font-semibold group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card"
                  initial={false}
                  animate={{
                    backgroundColor: state === "upcoming" ? "var(--muted)" : "var(--st-accent)",
                    color: state === "upcoming" ? "var(--muted-foreground)" : "var(--st-fg)",
                    scale: state === "active" ? 1.08 : 1,
                  }}
                  transition={spring}
                >
                  {state === "active" && !reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: "0 0 0 0 var(--st-accent)" }}
                      animate={{ boxShadow: ["0 0 0 0px color-mix(in oklab, var(--st-accent) 55%, transparent)", "0 0 0 10px color-mix(in oklab, var(--st-accent) 0%, transparent)"] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  {state === "complete" ? (
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        initial={{ pathLength: reduce ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                      />
                    </svg>
                  ) : state === "active" ? (
                    <motion.span
                      key="dot"
                      className="size-2.5 rounded-full bg-current"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={spring}
                    />
                  ) : (
                    n
                  )}
                </motion.span>
                {s.props.title && (
                  <span
                    className={cn(
                      "absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-colors sm:block",
                      state === "upcoming" ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {s.props.title}
                  </span>
                )}
              </button>
              {n < total && (
                <span aria-hidden className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-[var(--st-accent)]"
                    initial={false}
                    animate={{ scaleX: n < current ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: [0.65, 0, 0.35, 1] }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Sliding content, with the height following whatever is inside. */}
      <motion.div
        className="relative mt-8 overflow-hidden"
        animate={{ height: bounds.height || "auto" }}
        transition={reduce ? { duration: 0 } : spring}
      >
        <div ref={measure}>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={done ? "done" : step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ...spring, opacity: { duration: 0.2 } }}
              aria-live="polite"
            >
              {done
                ? (completedContent ?? (
                    <div className="flex flex-col items-center py-4 text-center">
                      <span className="grid size-14 place-items-center rounded-full bg-[var(--st-accent)] text-[var(--st-fg)]">
                        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                        </svg>
                      </span>
                      <p className="mt-4 text-lg font-semibold">All done</p>
                      <p className="mt-1 text-sm text-muted-foreground">Every step is complete.</p>
                    </div>
                  ))
                : steps[step - 1]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {done ? (
          <button
            type="button"
            onClick={restart}
            className="ml-auto rounded-full px-4 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start over
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 1}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground outline-none transition-[color,opacity] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0"
            >
              {backText}
            </button>
            <motion.button
              type="button"
              onClick={() => (step === total ? finish() : go(step + 1))}
              whileTap={{ scale: 0.96 }}
              className="rounded-full bg-[var(--st-accent)] px-6 py-2.5 text-sm font-semibold text-[var(--st-fg)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {step === total ? completeText : nextText}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
