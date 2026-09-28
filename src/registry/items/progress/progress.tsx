"use client";

import { useEffect, useId, type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const css = `
@keyframes ui-progress-shine{from{translate:-100% 0}to{translate:300% 0}}
@keyframes ui-progress-slide{0%{left:-40%;width:40%}60%{width:55%}100%{left:100%;width:30%}}
@keyframes ui-progress-spin{to{rotate:360deg}}
@keyframes ui-progress-arc{0%{stroke-dasharray:1 100;stroke-dashoffset:0}50%{stroke-dasharray:60 100;stroke-dashoffset:-15}100%{stroke-dasharray:60 100;stroke-dashoffset:-99}}
.ui-progress-shine{animation:ui-progress-shine 2.2s cubic-bezier(.4,0,.2,1) infinite}
.ui-progress-slide{animation:ui-progress-slide 1.4s cubic-bezier(.65,0,.35,1) infinite}
.ui-progress-spin{animation:ui-progress-spin 1.4s linear infinite}
.ui-progress-arc{animation:ui-progress-arc 1.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.ui-progress-shine{animation:none;opacity:0}.ui-progress-slide,.ui-progress-spin,.ui-progress-arc{animation-duration:3s}}
`;

export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current value (undefined counts as 0). `null` = indeterminate (unknown duration). */
  value?: number | null;
  max?: number;
  variant?: "linear" | "circular";
  size?: ProgressSize;
  /** Visible label, also used as the accessible name. */
  label?: ReactNode;
  /** Show the percentage (animated count). */
  showValue?: boolean;
}

const bar: Record<ProgressSize, string> = { sm: "h-1", md: "h-2", lg: "h-3" };
const ring: Record<ProgressSize, { px: number; stroke: number; text: string }> = {
  sm: { px: 36, stroke: 4, text: "text-[10px]" },
  md: { px: 56, stroke: 5, text: "text-xs" },
  lg: { px: 88, stroke: 7, text: "text-base" },
};

export function Progress({
  value,
  max = 100,
  variant = "linear",
  size = "md",
  label,
  showValue = true,
  className,
  ...props
}: ProgressProps) {
  const id = useId();
  const indeterminate = value === null;
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, ((value ?? 0) / max) * 100));
  const reduce = useReducedMotion();
  const spring = useSpring(0, { stiffness: 90, damping: 18, mass: 0.8 });
  useEffect(() => {
    if (reduce) spring.jump(pct);
    else spring.set(pct);
  }, [pct, reduce, spring]);
  const text = useTransform(spring, (v) => `${Math.round(v)}%`);
  const x = useTransform(spring, (v) => `${v - 100}%`);
  const offset = useTransform(spring, (v) => 100 - v);

  const aria = {
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-valuenow": indeterminate ? undefined : (value ?? 0),
    "aria-valuetext": indeterminate ? "Loading" : `${Math.round(pct)}%`,
    "aria-labelledby": label ? `${id}-label` : undefined,
    "aria-busy": indeterminate || undefined,
  } as const;

  const style = (
    <style href="ui-progress" precedence="default">
      {css}
    </style>
  );

  if (variant === "circular") {
    const { px, stroke, text: textSize } = ring[size];
    const r = (px - stroke) / 2;
    return (
      <div {...props} className={cn("inline-flex flex-col items-center gap-2", className)}>
        {style}
        <div {...aria} className="relative grid place-items-center" style={{ width: px, height: px }}>
          <svg aria-hidden viewBox={`0 0 ${px} ${px}`} className={cn("absolute inset-0 -rotate-90", indeterminate && "ui-progress-spin")}>
            <circle cx={px / 2} cy={px / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
            <motion.circle
              cx={px / 2}
              cy={px / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100 100"
              className={cn(
                "stroke-primary drop-shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_45%,transparent)]",
                indeterminate && "ui-progress-arc",
              )}
              style={indeterminate ? undefined : { strokeDashoffset: offset }}
            />
          </svg>
          {showValue && !indeterminate && (
            <motion.span aria-hidden className={cn("relative font-medium tabular-nums text-foreground", textSize)}>
              {text}
            </motion.span>
          )}
        </div>
        {label && (
          <span id={`${id}-label`} className="text-sm text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div {...props} className={cn("grid w-full gap-2", className)}>
      {style}
      {(label || (showValue && !indeterminate)) && (
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span id={`${id}-label`} className="font-medium text-foreground">
            {label}
          </span>
          {showValue && !indeterminate && (
            <motion.span aria-hidden className="tabular-nums text-muted-foreground">
              {text}
            </motion.span>
          )}
        </div>
      )}
      <div {...aria} className={cn("relative w-full overflow-hidden rounded-full bg-muted", bar[size])}>
        {indeterminate ? (
          <span className="ui-progress-slide absolute inset-y-0 rounded-full bg-primary" />
        ) : (
          <motion.div className="absolute inset-0 overflow-hidden rounded-full bg-primary" style={{ x }}>
            <span className="ui-progress-shine absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/45 to-transparent" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
