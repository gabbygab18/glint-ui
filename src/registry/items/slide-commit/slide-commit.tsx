"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { Check, ChevronsRight } from "lucide-react";

export interface SlideCommitProps {
  label?: string;
  confirmedLabel?: string;
  /** Fill color once committed. */
  color?: string;
  /** Fraction of the track (0-1) the knob must pass to commit on release. */
  threshold?: number;
  /** Ms before it resets itself after committing. 0 stays committed. */
  resetAfter?: number;
  /** Called once the knob reaches the end. */
  onCommit?: () => void;
  className?: string;
}

const css = `@keyframes slide-commit-shine{from{background-position:150% 0}to{background-position:-50% 0}}`;
const KNOB = 48;

export function SlideCommit({
  label = "Slide to confirm",
  confirmedLabel = "Confirmed",
  color = "#22c55e",
  threshold = 0.9,
  resetAfter = 2500,
  onCommit,
  className,
}: SlideCommitProps) {
  const reduce = useReducedMotion();
  const rail = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const x = useMotionValue(0);
  const v = useVelocity(x);
  const span = useMotionValue(0);
  const progress = useTransform(() => (span.get() ? x.get() / span.get() : 0));
  const labelOpacity = useTransform(progress, [0, 0.6], [1, 0]);
  const fillWidth = useTransform(x, (n) => n + KNOB);
  const fillOpacity = useTransform(progress, [0, 1], [0.25, 1]);
  const scaleX = useTransform(v, (s) => 1 + Math.min(Math.abs(s) / 2600, 0.32));
  const scaleY = useTransform(v, (s) => 1 - Math.min(Math.abs(s) / 5200, 0.16));

  useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMax(el.clientWidth - KNOB);
      span.set(el.clientWidth - KNOB);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [span]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const to = (target: number, bouncy = false) =>
    reduce ? x.set(target) : animate(x, target, { type: "spring", stiffness: 520, damping: bouncy ? 13 : 30 });

  const commit = () => {
    if (done) return;
    to(max);
    setDone(true);
    setPct(100);
    onCommit?.();
    if (resetAfter > 0)
      timer.current = window.setTimeout(() => {
        setDone(false);
        setPct(0);
        to(0, true);
      }, resetAfter);
  };

  const release = () => {
    if (x.get() >= max * threshold) commit();
    else {
      to(0, true); // springs home with a little overshoot
      setPct(0);
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (done) return;
    const now = max ? x.get() / max : 0;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(1, now + 0.25);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, now - 0.25);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End" || e.key === "Enter") next = 1;
    if (next === null) return;
    e.preventDefault();
    if (next >= 1) return commit();
    to(next * max);
    setPct(Math.round(next * 100));
  };

  return (
    <div
      className={`relative h-14 w-72 select-none overflow-hidden rounded-full border border-border bg-muted p-1 shadow-[inset_0_2px_6px_rgb(0_0_0/.25)] ${className ?? ""}`}
    >
      <style href="slide-commit" precedence="default">
        {css}
      </style>
      <motion.span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full"
        style={{ width: fillWidth, opacity: fillOpacity, background: color }}
      />
      <motion.span
        aria-hidden
        style={{ opacity: done ? 0 : labelOpacity }}
        className="pointer-events-none absolute inset-0 grid place-items-center pl-10 text-sm font-medium"
      >
        <span
          className="bg-clip-text text-transparent [animation:slide-commit-shine_2.4s_linear_infinite] motion-reduce:[animation:none]"
          style={{
            backgroundImage:
              "linear-gradient(100deg, var(--muted-foreground) 40%, var(--foreground) 50%, var(--muted-foreground) 60%)",
            backgroundSize: "200% 100%",
          }}
        >
          {label}
        </span>
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center pr-10 text-sm font-semibold text-white"
        initial={false}
        animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.8 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        {confirmedLabel}
      </motion.span>

      <div ref={rail} className="relative h-full">
        <motion.div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={done ? confirmedLabel : `${pct}%`}
          drag={done ? false : "x"}
          dragConstraints={{ left: 0, right: max }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={release}
          onKeyDown={onKey}
          onBlur={() => {
            if (done || x.get() === 0) return;
            to(0, true);
            setPct(0);
          }}
          whileTap={done ? undefined : { scale: 0.92 }}
          style={{ x, scaleX, scaleY }}
          className="relative z-10 grid size-12 cursor-grab touch-none place-items-center rounded-full bg-foreground text-background shadow-[0_2px_4px_rgb(0_0_0/.25),0_8px_20px_-6px_rgb(0_0_0/.45)] outline-none ring-offset-2 ring-offset-muted focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <motion.span
            key={done ? "done" : "idle"}
            initial={{ scale: 0.3, rotate: done ? -60 : 0 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 16 }}
            style={{ color: done ? color : undefined }}
          >
            {done ? <Check className="size-5" strokeWidth={3} aria-hidden /> : <ChevronsRight className="size-5" aria-hidden />}
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
