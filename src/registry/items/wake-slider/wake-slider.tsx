"use client";

import { useEffect, useId, useState, type ChangeEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

export interface WakeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  /** Controlled value. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  color?: string;
  /** How long the wake lingers behind the thumb, 0-1. */
  trail?: number;
  disabled?: boolean;
  className?: string;
}

const THUMB = 22;
// The native range is invisible but sized so its thumb lands exactly where ours is drawn.
const css = `.wake-slider-input{-webkit-appearance:none;appearance:none;background:transparent}
.wake-slider-input:focus-visible{outline:none}
.wake-slider-input::-webkit-slider-thumb{-webkit-appearance:none;width:${THUMB}px;height:${THUMB}px}
.wake-slider-input::-moz-range-thumb{width:${THUMB}px;height:${THUMB}px;border:0}`;
const at = (p: number) => `calc(${p * 100}% + ${THUMB / 2 - p * THUMB}px)`;

export function WakeSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 40,
  onChange,
  label = "Volume",
  showValue = true,
  color = "#38bdf8",
  trail = 0.6,
  disabled = false,
  className,
}: WakeSliderProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultValue);
  const v = value ?? inner;
  const pct = max > min ? (Math.min(max, Math.max(min, v)) - min) / (max - min) : 0;

  const target = useMotionValue(pct);
  useEffect(() => target.set(pct), [pct, target]);
  const head = useSpring(target, { stiffness: 900, damping: 60 });
  const k = 10 + 400 * (1 - trail) ** 2;
  const soft = useSpring(target, { stiffness: k, damping: 1.8 * Math.sqrt(k) });
  const tail = reduce ? head : soft;

  const lo = useTransform(() => Math.min(head.get(), tail.get()));
  const span = useTransform(() => Math.abs(head.get() - tail.get()));
  const wakeLeft = useTransform(lo, at);
  const wakeWidth = useTransform(span, (s) => `calc(${s * 100}% - ${s * THUMB}px)`);
  const wakeBg = useTransform(
    () =>
      `linear-gradient(${head.get() >= tail.get() ? 90 : 270}deg, transparent, ${color} 55%, color-mix(in oklab, ${color} 45%, white))`,
  );
  const fillWidth = useTransform(head, at);
  const thumbLeft = useTransform(head, at);
  // Squash-and-stretch from the gap between thumb and wake: fast moves flatten the thumb.
  const squash = useTransform(span, (s) => Math.min(s * 2.2, 0.35));
  const scaleX = useTransform(squash, (s) => 1 + s);
  const scaleY = useTransform(squash, (s) => 1 - s * 0.6);
  const glow = useTransform(squash, (s) => `0 0 ${8 + s * 60}px ${2 + s * 12}px color-mix(in oklab, ${color} ${40 + s * 150}%, transparent)`);

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    setInner(n);
    onChange?.(n);
  };

  return (
    <div className={`w-full max-w-sm ${disabled ? "opacity-50" : ""} ${className ?? ""}`}>
      <style href="wake-slider" precedence="default">
        {css}
      </style>
      {(label || showValue) && (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <label htmlFor={id} className="font-medium text-foreground">
            {label}
          </label>
          {showValue && <output htmlFor={id} className="text-muted-foreground tabular-nums">{v}</output>}
        </div>
      )}
      <div className="relative h-8">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          disabled={disabled}
          onChange={change}
          className="wake-slider-input peer absolute inset-0 z-10 m-0 size-full cursor-pointer outline-none disabled:cursor-not-allowed"
        />
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
        <motion.span
          aria-hidden
          className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full"
          style={{ width: fillWidth, background: `color-mix(in oklab, ${color} 35%, transparent)` }}
        />
        {/* The wake: a blurred glow plus a crisp core, stretching from the lagging tail to the thumb. */}
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full opacity-90 blur-md"
          style={{ left: wakeLeft, width: wakeWidth, background: wakeBg }}
        />
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{ left: wakeLeft, width: wakeWidth, background: wakeBg }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-1/2 rounded-full border-[3px] bg-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
          style={{
            left: thumbLeft,
            width: THUMB,
            height: THUMB,
            marginLeft: -THUMB / 2,
            marginTop: -THUMB / 2,
            borderColor: color,
            scaleX,
            scaleY,
            boxShadow: glow,
          }}
        />
      </div>
    </div>
  );
}
