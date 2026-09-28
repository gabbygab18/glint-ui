"use client";

import { useEffect, useId, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";

export interface MorphSliderProps {
  min?: number;
  max?: number;
  step?: number;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Thumb, fill and bubble color. */
  color?: string;
  /** Value text color inside the bubble. */
  textColor?: string;
  /** Text appended to the value, e.g. "%". */
  suffix?: string;
  /** Accessible name. */
  label?: string;
  className?: string;
}

export function MorphSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 42,
  onChange,
  color = "#c6ff3d",
  textColor = "#0a0a0a",
  suffix = "%",
  label = "Value",
  className,
}: MorphSliderProps) {
  const [inner, setInner] = useState(defaultValue);
  const [active, setActive] = useState(false);
  const reduce = useReducedMotion();
  const goo = `goo-${useId().replace(/:/g, "")}`;
  const v = Math.min(max, Math.max(min, value ?? inner));
  const pct = max > min ? ((v - min) / (max - min)) * 100 : 0;

  // Position in % drives the thumb; its velocity stretches the thumb and tilts the bubble.
  const pos = useMotionValue(pct);
  useEffect(() => {
    pos.set(pct);
  }, [pct, pos]);
  const left = useSpring(pos, { stiffness: 700, damping: 45 });
  const leftCss = useTransform(left, (p) => `${p}%`);
  const vel = useVelocity(left);
  const stretch = useSpring(useTransform(vel, [-600, 0, 600], [1.6, 1, 1.6]), { stiffness: 400, damping: 30 });
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));
  const tilt = useSpring(useTransform(vel, [-600, 600], [22, -22]), { stiffness: 300, damping: 20 });

  const set = (n: number) => {
    if (value === undefined) setInner(n);
    onChange?.(n);
  };

  const bubble = active && !reduce;
  const pop = { type: "spring" as const, stiffness: 420, damping: bubble ? 16 : 26 };

  return (
    <div className={`relative w-full max-w-md select-none py-16 ${className ?? ""}`}>
      <svg aria-hidden className="absolute size-0">
        <filter id={goo} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </svg>

      {/* Track + fill */}
      <div className="relative h-2 rounded-full bg-muted">
        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width: leftCss, background: color }} />
      </div>

      {/* Gooey layer: the bubble drips out of the thumb and melts back in. */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ filter: `url(#${goo})` }}>
        <motion.div className="absolute top-1/2" style={{ left: leftCss }}>
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: color, scaleX: stretch, scaleY: squash }}
            initial={false}
            animate={{ width: active ? 30 : 22, height: active ? 30 : 22 }}
            transition={pop}
          />
          <motion.div
            className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: color, rotate: tilt }}
            initial={false}
            animate={{ y: bubble ? -46 : 0, scale: bubble ? 1 : 0.3 }}
            transition={pop}
          />
        </motion.div>
      </div>

      {/* Crisp overlays: thumb core + value text (outside the filter so they stay sharp). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div className="absolute top-1/2" style={{ left: leftCss }}>
          <motion.span
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: textColor, opacity: 0.75 }}
            initial={false}
            animate={{ scale: active ? 0.6 : 1 }}
          />
          <motion.span
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold tabular-nums"
            style={{ color: textColor }}
            initial={false}
            animate={{ y: bubble ? -46 : 0, opacity: bubble ? 1 : 0, scale: bubble ? 1 : 0.5 }}
            transition={pop}
          >
            {v}
            {suffix}
          </motion.span>
        </motion.div>
      </div>

      {/* Native range input: pointer, touch and keyboard for free. */}
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        onPointerDown={() => {
          setActive(true);
          window.addEventListener("pointerup", () => setActive(false), { once: true });
        }}
        onKeyDown={() => setActive(true)}
        onKeyUp={() => setActive(false)}
        onBlur={() => setActive(false)}
        className="peer absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 cursor-grab appearance-none opacity-0 active:cursor-grabbing [&::-moz-range-thumb]:h-10 [&::-moz-range-thumb]:w-px [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:w-px [&::-webkit-slider-thumb]:appearance-none"
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 hidden size-9 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ring ring-offset-2 ring-offset-background peer-focus-visible:block"
        style={{ left: leftCss }}
      />
    </div>
  );
}
