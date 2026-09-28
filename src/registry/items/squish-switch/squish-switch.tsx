"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";

export interface SquishSwitchProps {
  /** Controlled state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Visible label (also the accessible name). */
  label?: ReactNode;
  /** Track color when on. */
  color?: string;
  /** Spring bounciness, 0 stiff to 1 wobbly. */
  bounce?: number;
  disabled?: boolean;
  className?: string;
}

const TRACK_W = 60;
const THUMB = 26;
const PAD = 3;
const TRAVEL = TRACK_W - THUMB - PAD * 2;

export function SquishSwitch({
  checked,
  defaultChecked = false,
  onChange,
  label = "Airplane mode",
  color = "#22c55e",
  bounce = 0.6,
  disabled = false,
  className,
}: SquishSwitchProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultChecked);
  const [pressed, setPressed] = useState(false);
  const on = checked ?? inner;
  const first = useRef(true);

  const x = useMotionValue(on ? TRAVEL : 0);
  const v = useVelocity(x);
  // Stretch along the direction of travel, flatten to keep the volume.
  const scaleX = useTransform(v, (s) => 1 + Math.min(Math.abs(s) / 900, 0.55));
  const scaleY = useTransform(v, (s) => 1 - Math.min(Math.abs(s) / 2200, 0.24));

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const to = on ? TRAVEL : 0;
    if (reduce) x.set(to);
    else animate(x, to, { type: "spring", stiffness: 520, damping: 34 - bounce * 26, velocity: on ? 400 : -400 });
  }, [on, reduce, bounce, x]);

  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInner(!on);
    onChange?.(!on);
  };

  return (
    <div className={`inline-flex items-center gap-3 ${disabled ? "opacity-50" : ""} ${className ?? ""}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onKeyDown={(e) => e.key === " " && !e.repeat && setPressed(true)}
        onKeyUp={() => setPressed(false)}
        onBlur={() => setPressed(false)}
        className="relative shrink-0 cursor-pointer rounded-full outline-none transition-[background-color,box-shadow] duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
        style={{
          width: TRACK_W,
          height: THUMB + PAD * 2,
          background: on ? color : "color-mix(in oklab, var(--muted-foreground) 32%, transparent)",
          boxShadow: "inset 0 1px 3px rgb(0 0 0 / .3)",
        }}
      >
        <motion.span
          aria-hidden
          className="absolute rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/.3),0_0_0_.5px_rgb(0_0_0/.08)]"
          style={{ top: PAD, left: PAD, height: THUMB, x, scaleX, scaleY, originX: on ? 1 : 0 }}
          // Anticipation: the thumb widens toward where it's about to go while held.
          animate={{ width: pressed && !disabled ? THUMB + 7 : THUMB, marginLeft: pressed && on && !disabled ? -7 : 0 }}
          initial={false}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
        />
      </button>
      {label && (
        <label htmlFor={id} className={`select-none text-sm font-medium text-foreground ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
          {label}
        </label>
      )}
    </div>
  );
}
