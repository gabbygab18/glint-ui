"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

export interface RubberSegmentProps {
  /** Segment labels. */
  options?: string[];
  /** Controlled selected option. */
  value?: string;
  /** Initial option when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected option. */
  onChange?: (value: string) => void;
  /** How stretchy the indicator is: 0 snaps rigidly, 1 is very gooey. */
  stretch?: number;
  /** Accessible name of the group. */
  label?: string;
  className?: string;
}

const DEFAULT_OPTIONS = ["Day", "Week", "Month", "Year"];

export function RubberSegment({
  options = DEFAULT_OPTIONS,
  value,
  defaultValue,
  onChange,
  stretch = 0.6,
  label = "View",
  className,
}: RubberSegmentProps) {
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultValue ?? options[0]);
  const current = value ?? inner;
  const index = Math.max(0, options.indexOf(current));
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const first = useRef(true);
  const indexRef = useRef(index);
  useLayoutEffect(() => {
    indexRef.current = index;
  });

  // The indicator is two independent edges. The leading edge races ahead on a stiff
  // spring, the trailing edge lags on a soft one, so it stretches then snaps shut.
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const width = useTransform(() => right.get() - left.get());
  const rest = useRef(0);
  // Keep the area roughly constant: longer = thinner.
  const scaleY = useTransform(width, (w) => (rest.current ? Math.min(1, Math.max(0.72, rest.current / w) ** 0.5) : 1));

  const place = (i: number, instant: boolean) => {
    const el = btns.current[i];
    if (!el) return;
    const l = el.offsetLeft;
    const r = l + el.offsetWidth;
    rest.current = el.offsetWidth;
    if (instant || reduce) {
      left.jump(l);
      right.jump(r);
      return;
    }
    const goingRight = l > left.get();
    const lead = { type: "spring", stiffness: 700, damping: 38 } as const;
    const lag = { type: "spring", stiffness: 700 - 520 * stretch, damping: 38 - 20 * stretch } as const;
    animate(left, l, goingRight ? lag : lead);
    animate(right, r, goingRight ? lead : lag);
  };
  const placeRef = useRef(place);
  useLayoutEffect(() => {
    placeRef.current = place;
  });

  useLayoutEffect(() => {
    placeRef.current(index, first.current);
    first.current = false;
  }, [index, options]);

  useLayoutEffect(() => {
    const parent = btns.current[0]?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => placeRef.current(indexRef.current, true));
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const select = (i: number) => {
    const next = options[(i + options.length) % options.length];
    if (value === undefined) setInner(next);
    if (next !== current) onChange?.(next);
    btns.current[(i + options.length) % options.length]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) select(index + step);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(options.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={`relative inline-flex rounded-full border border-border bg-muted p-1 ${className ?? ""}`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-1 left-0 rounded-full bg-background shadow-[0_1px_2px_rgb(0_0_0/.2),0_4px_14px_-4px_rgb(0_0_0/.35)] ring-1 ring-border"
        style={{ x: left, width, scaleY }}
      />
      {options.map((o, i) => (
        <button
          key={o}
          ref={(el) => {
            btns.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          tabIndex={i === index ? 0 : -1}
          onClick={() => select(i)}
          className={`relative z-10 h-9 select-none rounded-full px-5 text-sm font-medium outline-none transition-[color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-95 ${
            i === index ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
