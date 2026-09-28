"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

export interface GlideSelectProps {
  /** Option labels (also used as values). */
  options?: string[];
  /** Controlled selected option. */
  value?: string;
  /** Initial option when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected option. */
  onValueChange?: (value: string) => void;
  /** Accessible name of the group. */
  label?: string;
  /** Highlight color; defaults to the theme primary. */
  color?: string;
  /** How much the highlight stretches while travelling, 0-1. */
  stretch?: number;
  className?: string;
}

export function GlideSelect({
  options = ["Day", "Week", "Month", "Year"],
  value,
  defaultValue,
  onValueChange,
  label = "Time range",
  color,
  stretch = 0.6,
  className,
}: GlideSelectProps) {
  const [inner, setInner] = useState(defaultValue ?? options[0]);
  const current = value ?? inner;
  const idx = Math.max(0, options.indexOf(current));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const prev = useRef(-1);
  const reduce = useReducedMotion();

  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const target = useRef(0);
  const width = useTransform(() => right.get() - left.get());
  // Thin out while stretched, like a drop of liquid pulled between two points.
  const scaleY = useTransform(() => Math.max(0.72, 1 - Math.max(0, width.get() - target.current) / 260));

  const place = (i: number, glide: boolean) => {
    const el = refs.current[i];
    if (!el) return;
    const l = el.offsetLeft;
    const r = l + el.offsetWidth;
    target.current = el.offsetWidth;
    if (!glide) {
      // Next frame: values set before Motion has mounted the element never reach the DOM.
      requestAnimationFrame(() => {
        left.set(l);
        right.set(r);
      });
      return;
    }
    // The leading edge snaps ahead on a stiff spring, the trailing edge catches up on a loose one.
    const fast = { type: "spring", stiffness: 520, damping: 34 } as const;
    const slow = { type: "spring", stiffness: 520 - 360 * stretch, damping: 34 - 14 * stretch } as const;
    const forward = i > prev.current;
    animate(left, l, forward ? slow : fast);
    animate(right, r, forward ? fast : slow);
  };

  useEffect(() => {
    place(idx, prev.current >= 0 && prev.current !== idx && !reduce);
    prev.current = idx;
    // place only touches refs and motion values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, reduce, options.length]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => place(prev.current, false));
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (i: number, focus = false) => {
    const next = options[(i + options.length) % options.length];
    if (focus) refs.current[options.indexOf(next)]?.focus();
    if (next === current) return;
    setInner(next);
    onValueChange?.(next);
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: idx + 1,
      ArrowDown: idx + 1,
      ArrowLeft: idx - 1,
      ArrowUp: idx - 1,
      Home: 0,
      End: options.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  return (
    <div
      ref={root}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={`relative inline-flex rounded-full border border-border bg-muted/60 p-1 shadow-[inset_0_1px_3px_rgb(0_0_0/.25)] ${className ?? ""}`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-1 left-0 rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/.35),0_6px_18px_-8px_rgb(0_0_0/.6)]"
        style={{ x: left, width, scaleY, background: color ?? "var(--primary)" }}
      />
      {options.map((o, i) => {
        const on = i === idx;
        return (
          <motion.button
            key={o}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => select(i)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/60 ${
              on ? (color ? "text-white" : "text-primary-foreground") : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </motion.button>
        );
      })}
    </div>
  );
}
