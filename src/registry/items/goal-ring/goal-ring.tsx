"use client";

import { MotionConfig, animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface Ring {
  label: string;
  value: number;
  goal: number;
  color: string;
  /** Unit shown in the legend, e.g. "kcal". */
  unit?: string;
}

export interface GoalRingProps {
  rings?: Ring[];
  /** Diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** Space between rings in px. */
  gap?: number;
  /** Fill length in seconds. */
  duration?: number;
  /** List each ring's label and progress below. */
  showLegend?: boolean;
  className?: string;
}

const DEFAULT_RINGS: Ring[] = [
  { label: "Move", value: 420, goal: 500, color: "#f43f5e", unit: "kcal" },
  { label: "Exercise", value: 24, goal: 30, color: "#b5e61d", unit: "min" },
  { label: "Stand", value: 10, goal: 12, color: "#38bdf8", unit: "hr" },
];

/**
 * Concentric progress rings that fill when they scroll into view, each one a
 * beat after the last, while the center counts up to the outer ring's percent.
 */
export function GoalRing({
  rings = DEFAULT_RINGS,
  size = 200,
  thickness = 16,
  gap = 5,
  duration = 1.4,
  showLegend = true,
  className,
}: GoalRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const lead = rings[0];
  const target = lead ? Math.round((lead.value / lead.goal) * 100) : 0;
  const count = useMotionValue(0);
  const shown = useTransform(count, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    if (!seen) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = animate(count, target, { duration: reduce ? 0 : duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [seen, target, duration, count]);

  const c = size / 2;

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className={cn("grid max-w-full justify-items-center gap-5", className)}>
        {/* Shrinks with its container; the SVG scales through its viewBox. */}
        <div className="relative aspect-square max-w-full" style={{ width: size, containerType: "inline-size" }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" aria-hidden>
            {rings.map((r, i) => {
              const radius = c - thickness / 2 - i * (thickness + gap);
              if (radius <= thickness / 2) return null;
              const p = Math.min(1, r.value / r.goal);
              return (
                <g key={r.label}>
                  <circle cx={c} cy={c} r={radius} fill="none" stroke={r.color} strokeOpacity={0.16} strokeWidth={thickness} />
                  <motion.circle
                    cx={c}
                    cy={c}
                    r={radius}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: seen ? p : 0 }}
                    transition={{ duration, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    style={{ filter: `drop-shadow(0 0 6px ${r.color}55)` }}
                  />
                </g>
              );
            })}
          </svg>
          {lead && (
            <div className="absolute inset-0 grid place-content-center text-center">
              <motion.span className="font-bold tabular-nums text-foreground" style={{ fontSize: "max(18px, 15cqw)" }}>
                {shown}
              </motion.span>
              <span className="text-xs text-muted-foreground">{lead.label}</span>
            </div>
          )}
        </div>
        {showLegend && (
          <ul className="grid w-full gap-1.5">
            {rings.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: r.color }} aria-hidden />
                <span className="flex-1 text-foreground">{r.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {r.value}/{r.goal}
                  {r.unit ? ` ${r.unit}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MotionConfig>
  );
}
