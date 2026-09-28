"use client";

import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

export interface CurvedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange"> {
  /** Width in px. */
  width?: number;
  /** Text size in px. */
  fontSize?: number;
  /** Px the middle of the arc sags while idle. Negative arcs upwards. */
  bend?: number;
  placeholder?: string;
  defaultValue?: string;
  /** Accessible label. */
  label?: string;
  /** Underline gradient start. */
  colorFrom?: string;
  /** Underline gradient end. */
  colorTo?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function CurvedInput({
  width = 380,
  fontSize = 30,
  bend = 40,
  placeholder = "Type your name",
  defaultValue = "",
  label = "Name",
  colorFrom = "#a78bfa",
  colorTo = "#22d3ee",
  onValueChange,
  className,
  ...rest
}: CurvedInputProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const b = useSpring(bend, reduce ? { duration: 0 } : { stiffness: 220, damping: 14, mass: 0.9 });

  useEffect(() => {
    b.set(focused ? 0 : bend);
  }, [b, bend, focused]);

  const pad = Math.abs(bend) + 8;
  const base = pad + fontSize * 1.05; // text baseline when flat
  const line = base + fontSize * 0.45; // underline
  const height = line + pad + 8;
  const curve = (y: number) => (v: number) => `M 4 ${y} Q ${width / 2} ${y + 2 * v} ${width - 4} ${y}`;
  const textD = useTransform(b, curve(base));
  const lineD = useTransform(b, curve(line));
  const showText = value || placeholder;
  const swap = reduce ? "0s" : focused ? ".18s .22s" : "0s";

  return (
    <label className={`relative block cursor-text ${className ?? ""}`} style={{ width, height }}>
      <svg aria-hidden width={width} height={height} className="pointer-events-none absolute inset-0 overflow-visible">
        <defs>
          <motion.path id={`${id}-t`} d={textD} />
          <linearGradient id={`${id}-g`} x1="0" x2="1">
            <stop offset="0" stopColor={colorFrom} />
            <stop offset="1" stopColor={colorTo} />
          </linearGradient>
        </defs>
        <text
          className={value ? "fill-foreground" : "fill-muted-foreground"}
          style={{ fontSize, fontWeight: 600, letterSpacing: "-0.01em", opacity: focused ? 0 : 1, transition: `opacity ${swap}` }}
        >
          <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">
            {showText}
          </textPath>
        </text>
        <motion.path d={lineD} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-border" />
        <motion.path
          d={lineD}
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth={3}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: focused ? 1 : value ? 0.35 : 0, opacity: focused || value ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <input
        {...rest}
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          onValueChange?.(e.target.value);
        }}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        className={`absolute inset-x-0 w-full bg-transparent text-center font-semibold tracking-[-0.01em] text-foreground caret-foreground outline-none ${focused ? "placeholder:text-muted-foreground" : "placeholder:text-transparent"}`}
        style={{
          top: base - fontSize * 1.05,
          height: fontSize * 1.4,
          fontSize,
          color: focused ? undefined : "transparent",
          transition: `color ${swap}`,
        }}
      />
    </label>
  );
}
