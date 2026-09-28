"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { Minus, Plus } from "lucide-react";

export interface CounterProps {
  /** Starting value (non-negative integer). Changing it jumps the counter there. */
  value?: number;
  /** Amount added or removed by the buttons. */
  step?: number;
  min?: number;
  max?: number;
  /** Digit size in px. */
  fontSize?: number;
  /** Show the − / + buttons. */
  showControls?: boolean;
  /** Fade digits out at the top and bottom edges. */
  fade?: boolean;
  /** Called with the new value after a button press. */
  onChange?: (value: number) => void;
  className?: string;
}

export function Counter({
  value = 128,
  step = 1,
  min = 0,
  max = 999999,
  fontSize = 80,
  showControls = true,
  fade = true,
  onChange,
  className,
}: CounterProps) {
  const clamp = (v: number) => Math.round(Math.min(max, Math.max(min, v)));
  const [n, setN] = useState(() => clamp(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setN(clamp(value));
  }

  const bump = (dir: number) => {
    const next = clamp(n + dir * step);
    setN(next);
    onChange?.(next);
  };

  const digits = String(Math.max(0, n)).length;
  const places = Array.from({ length: digits }, (_, i) => digits - 1 - i);
  const h = fontSize * 1.1;
  const mask = fade ? "linear-gradient(transparent, #000 28%, #000 72%, transparent)" : undefined;
  const btn =
    "grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground outline-none transition-[transform,background-color] hover:bg-muted active:scale-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

  return (
    <div className={`inline-flex items-center gap-5 ${className ?? ""}`}>
      {showControls && (
        <button type="button" aria-label={`Decrease by ${step}`} className={btn} disabled={n <= min} onClick={() => bump(-1)}>
          <Minus className="size-5" aria-hidden />
        </button>
      )}
      <div
        className="relative flex overflow-hidden font-semibold leading-none tabular-nums text-foreground"
        style={{ fontSize, height: h * 1.6, paddingBlock: h * 0.3, maskImage: mask, WebkitMaskImage: mask }}
      >
        <span className="sr-only" aria-live="polite">
          {n}
        </span>
        <AnimatePresence initial={false}>
          {places.map((p) => (
            <motion.span
              key={p}
              aria-hidden
              className="relative block"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ height: h, clipPath: "inset(-200% 0 -200% 0)" }}
            >
              <Column place={p} value={n} height={h} />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      {showControls && (
        <button type="button" aria-label={`Increase by ${step}`} className={btn} disabled={n >= max} onClick={() => bump(1)}>
          <Plus className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

function Column({ place, value, height }: { place: number; value: number; height: number }) {
  const reduce = useReducedMotion();
  // Each column springs towards floor(value / 10^place), so 9 → 10 rolls both columns forward.
  const target = Math.floor(value / 10 ** place);
  const pos = useSpring(target, reduce ? { duration: 0 } : { stiffness: 120, damping: 20, mass: 0.8 });
  useEffect(() => {
    pos.set(target);
  }, [pos, target]);

  return (
    <>
      <span className="invisible block" style={{ height, lineHeight: `${height}px` }}>
        0
      </span>
      {Array.from({ length: 10 }, (_, d) => (
        <Digit key={d} digit={d} pos={pos} height={height} />
      ))}
    </>
  );
}

function Digit({ digit, pos, height }: { digit: number; pos: MotionValue<number>; height: number }) {
  const y = useTransform(pos, (v) => {
    let o = (((digit - v) % 10) + 10) % 10;
    if (o > 5) o -= 10;
    return o * height;
  });
  return (
    <motion.span className="absolute inset-x-0 top-0 block text-center" style={{ y, height, lineHeight: `${height}px` }}>
      {digit}
    </motion.span>
  );
}
