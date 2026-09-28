"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";

export interface JellyRadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface JellyRadioProps {
  options?: JellyRadioOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Group label, shown above the options. */
  label?: string;
  /** Form field name for the native radios. */
  name?: string;
  /** Dot and ring color. */
  color?: string;
  /** How wobbly the dot is, 0-1. */
  wobble?: number;
  className?: string;
}

const defaultOptions: JellyRadioOption[] = [
  { value: "starter", label: "Starter", description: "For side projects" },
  { value: "pro", label: "Pro", description: "For growing teams" },
  { value: "enterprise", label: "Enterprise", description: "SSO, audit logs, SLA" },
];

const DOT = 12;

export function JellyRadio({
  options = defaultOptions,
  value,
  defaultValue = "pro",
  onValueChange,
  label = "Plan",
  name,
  color = "#fb7185",
  wobble = 0.6,
  className,
}: JellyRadioProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const idx = options.findIndex((o) => o.value === current);
  const autoName = useId();
  const labelId = useId();
  const reduce = useReducedMotion();

  const rings = useRef<(HTMLSpanElement | null)[]>([]);
  const blob = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const x = useMotionValue(0);
  const visible = useMotionValue(0);

  const y = useMotionValue(0);
  const vy = useVelocity(y);
  // Stretch along the direction of travel, thin out sideways (area stays roughly constant).
  const scaleY = useTransform(vy, (v) => 1 + Math.min(Math.abs(v), 2200) / 1500);
  const scaleX = useTransform(scaleY, (s) => 1 / Math.sqrt(s));

  useEffect(() => {
    const ring = rings.current[idx];
    if (!ring) return;
    const ty = ring.offsetTop + (ring.offsetHeight - DOT) / 2;
    const tx = ring.offsetLeft + (ring.offsetWidth - DOT) / 2;
    if (!placed.current || reduce) {
      // Next frame: values set before Motion has mounted the element never reach the DOM.
      const id = requestAnimationFrame(() => {
        x.set(tx);
        y.set(ty);
        visible.set(1);
        placed.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
    x.set(tx);
    const travel = Math.abs(ty - y.get());
    animate(y, ty, { type: "spring", stiffness: 340, damping: 26 - 14 * wobble, mass: 1 });
    // Splat on landing, then jiggle back into a circle.
    if (blob.current)
      animate(
        blob.current,
        { scaleX: [1, 1, 1 + 0.5 * wobble, 1 - 0.18 * wobble, 1 + 0.08 * wobble, 1], scaleY: [1, 1, 1 - 0.4 * wobble, 1 + 0.2 * wobble, 1 - 0.06 * wobble, 1] },
        { duration: 0.35 + travel / 900, times: [0, 0.42, 0.55, 0.72, 0.86, 1], ease: "easeOut" },
      );
  }, [idx, reduce, wobble, options.length, x, y, visible]);

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      className={`relative grid w-72 gap-1 rounded-2xl border border-border bg-card p-2 text-foreground shadow-xl ${className ?? ""}`}
    >
      <p id={labelId} className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      {options.map((o, i) => {
        const on = i === idx;
        return (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
          >
            <input
              type="radio"
              name={name ?? autoName}
              value={o.value}
              checked={on}
              onChange={() => {
                setInner(o.value);
                onValueChange?.(o.value);
              }}
              className="peer sr-only"
            />
            <motion.span
              ref={(el) => {
                rings.current[i] = el;
              }}
              aria-hidden
              className="size-[22px] shrink-0 rounded-full border-2 transition-colors duration-200 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card"
              style={{ borderColor: on ? color : "var(--border)" }}
              whileTap={{ scale: 0.85 }}
            />
            <span className="grid leading-tight">
              <span className="text-sm font-medium">{o.label}</span>
              {o.description && <span className="text-xs text-muted-foreground">{o.description}</span>}
            </span>
          </label>
        );
      })}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
        style={{ x, y, scaleX, scaleY, width: DOT, height: DOT, opacity: idx < 0 ? 0 : visible }}
      >
        <span
          ref={blob}
          className="block size-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px -2px ${color}` }}
        />
      </motion.span>
    </div>
  );
}
