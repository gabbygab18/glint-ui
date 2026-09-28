"use client";

import { useId, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";

export interface SpringCheckProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  /** Fill color when checked. */
  color?: string;
  /** Box size in px. */
  size?: number;
  disabled?: boolean;
  /** Form field name. */
  name?: string;
  className?: string;
}

const SPARKS = 6;

export function SpringCheck({
  checked,
  defaultChecked = false,
  onChange,
  label = "Ship it",
  color = "#22c55e",
  size = 28,
  disabled = false,
  name,
  className,
}: SpringCheckProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultChecked);
  const [pops, setPops] = useState(0);
  const on = checked ?? inner;

  const toggle = () => {
    const next = !on;
    if (checked === undefined) setInner(next);
    if (next) setPops((p) => p + 1);
    onChange?.(next);
  };

  return (
    <MotionConfig reducedMotion="user">
      <label
        htmlFor={id}
        className={`group inline-flex select-none items-center gap-3 text-sm font-medium text-foreground ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className ?? ""}`}
      >
        <span
          className={`relative grid shrink-0 place-items-center transition-[scale] duration-150 motion-reduce:transition-none ${disabled ? "" : "group-active:scale-[0.82]"}`}
          style={{ width: size, height: size }}
        >
          <input
            id={id}
            type="checkbox"
            name={name}
            checked={on}
            disabled={disabled}
            onChange={toggle}
            className="peer absolute inset-0 m-0 cursor-[inherit] appearance-none rounded-[28%] outline-none"
          />
          {/* Sparks fly off the corners on each check. */}
          {on && pops > 0 && (
            <span key={pops} aria-hidden className="pointer-events-none absolute inset-0">
              {Array.from({ length: SPARKS }, (_, i) => {
                const a = (i / SPARKS) * 360 + 30;
                return (
                  <span key={i} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ rotate: `${a}deg` }}>
                    <motion.span
                      className="absolute -top-px left-0 h-0.5 rounded-full"
                      style={{ background: color, width: size * 0.3 }}
                      initial={{ x: size * 0.45, scaleX: 0, opacity: 1 }}
                      animate={{ x: size * 0.95, scaleX: [0, 1, 0], opacity: [1, 1, 0] }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
                    />
                  </span>
                );
              })}
            </span>
          )}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28%] border-2 bg-background transition-[border-color,box-shadow] duration-200 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/60"
            style={{ borderColor: on ? color : "color-mix(in oklab, var(--muted-foreground) 55%, transparent)" }}
            initial={false}
            animate={
              on
                ? { scale: [0.78, 1.18, 0.94, 1.03, 1], rotate: [0, -8, 4, 0] }
                : { scale: [0.86, 1.06, 1], rotate: 0 }
            }
            transition={{ duration: on ? 0.55 : 0.3, ease: "easeOut" }}
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: color }}
              initial={false}
              animate={{ scale: on ? 1.5 : 0 }}
              transition={on ? { type: "spring", stiffness: 380, damping: 22 } : { duration: 0.18 }}
            />
            <svg viewBox="0 0 24 24" fill="none" className="absolute inset-0 size-full p-[18%]">
              <motion.path
                d="M4.5 12.5l5 5L19.5 7"
                stroke="white"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                transition={
                  on
                    ? { pathLength: { type: "spring", stiffness: 300, damping: 14, delay: 0.08 }, opacity: { duration: 0.05, delay: 0.08 } }
                    : { duration: 0.15 }
                }
              />
            </svg>
          </motion.span>
        </span>
        {label}
      </label>
    </MotionConfig>
  );
}
