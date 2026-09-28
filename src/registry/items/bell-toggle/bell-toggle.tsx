"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

export interface BellToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled on/off state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the new state after each toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label next to the switch; also the accessible name. */
  label?: string;
  /** Track and bell color when enabled. */
  color?: string;
}

const knobSpring = { type: "spring", stiffness: 520, damping: 30 } as const;

export function BellToggle({
  checked,
  defaultChecked = true,
  onCheckedChange,
  label = "Notifications",
  color = "#f59e0b",
  className,
  onClick,
  ...props
}: BellToggleProps) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`inline-flex items-center gap-4 ${className ?? ""}`}>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          {...props}
          onClick={(e) => {
            setInner(!on);
            onCheckedChange?.(!on);
            onClick?.(e);
          }}
          className="group relative h-11 w-[84px] shrink-0 rounded-full p-1 outline-none transition-[background-color,box-shadow] duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: on ? color : "var(--muted)",
            boxShadow: on ? `inset 0 1px 2px rgb(0 0 0/.18), 0 6px 22px -8px ${color}` : "inset 0 1px 3px rgb(0 0 0/.25)",
          }}
        >
          <motion.span
            initial={false}
            animate={{ x: on ? 40 : 0 }}
            whileTap={{ scaleX: 1.18, scaleY: 0.9 }}
            transition={knobSpring}
            className="relative grid size-9 place-items-center rounded-full bg-background shadow-[0_2px_6px_rgb(0_0_0/.25),inset_0_1px_0_rgb(255_255_255/.35)]"
          >
            {/* Sound waves that burst out once each time the bell turns on. */}
            <AnimatePresence>
              {on && (
                <motion.svg
                  key="waves"
                  aria-hidden
                  viewBox="0 0 64 36"
                  className="pointer-events-none absolute -inset-x-3.5 top-0 h-9 w-16 overflow-visible"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1.15, 1.3] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1], delay: 0.08 }}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                >
                  <path d="M8 11q-4 7 0 14M3 7q-6 11 0 22M56 11q4 7 0 14M61 7q6 11 0 22" />
                </motion.svg>
              )}
            </AnimatePresence>

            <motion.span
              aria-hidden
              className="block size-6"
              style={{ transformOrigin: "50% 10%", color: on ? color : "var(--muted-foreground)" }}
              initial={false}
              animate={on ? { rotate: [0, 26, -22, 16, -11, 6, -3, 0], scale: [1, 1.12, 1] } : { rotate: [0, -8, 0], scale: [1, 0.9, 1] }}
              transition={{ rotate: { duration: on ? 0.9 : 0.3, ease: "easeOut" }, scale: { duration: 0.35 } }}
            >
              <svg viewBox="0 0 24 24" className="size-6 overflow-visible transition-colors duration-300">
                <motion.circle
                  cx={12}
                  cy={19.6}
                  r={2.1}
                  fill="currentColor"
                  initial={false}
                  animate={on ? { cx: [12, 9.4, 14.6, 10.2, 13.4, 11.3, 12] } : { cx: 12 }}
                  transition={{ duration: 0.95, delay: 0.05, ease: "easeOut" }}
                />
                <path
                  fill="currentColor"
                  d="M18 16.4V11a6 6 0 0 0-4.6-5.84V4.4a1.4 1.4 0 0 0-2.8 0v.76A6 6 0 0 0 6 11v5.4L4.4 18.2h15.2z"
                />
                {/* Slash: a background-colored cut behind a thin stroke. */}
                <motion.path
                  d="M4 3.5L20 20.5"
                  strokeWidth={4.4}
                  strokeLinecap="round"
                  className="stroke-background"
                  initial={false}
                  animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }}
                  transition={{ duration: 0.28, ease: "easeOut", delay: on ? 0 : 0.08 }}
                />
                <motion.path
                  d="M4 3.5L20 20.5"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  stroke="currentColor"
                  initial={false}
                  animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }}
                  transition={{ duration: 0.28, ease: "easeOut", delay: on ? 0 : 0.08 }}
                />
              </svg>
            </motion.span>
          </motion.span>
        </button>

        {label && (
          <span aria-hidden className="grid select-none leading-tight">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="relative h-4 overflow-hidden text-xs text-muted-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={on ? "on" : "off"}
                  className="block"
                  initial={{ y: on ? 14 : -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: on ? -14 : 14, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                >
                  {on ? "On" : "Muted"}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        )}
      </div>
    </MotionConfig>
  );
}
