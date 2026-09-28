"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Volume, Volume2 } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ElasticSliderProps {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Max px the track stretches when dragged past an end. */
  stretch?: number;
  /** Show the current value under the track. */
  showValue?: boolean;
  /** Icon at the low end. */
  leftIcon?: ReactNode;
  /** Icon at the high end. */
  rightIcon?: ReactNode;
  /** Accessible name. */
  label?: string;
  onValueChange?: (value: number) => void;
  className?: string;
}

const release = { type: "spring", stiffness: 520, damping: 14, mass: 0.8 } as const;

export function ElasticSlider({
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  stretch = 28,
  showValue = true,
  leftIcon = <Volume />,
  rightIcon = <Volume2 />,
  label = "Volume",
  onValueChange,
  className,
}: ElasticSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Signed overflow in px: < 0 stretches the left end, > 0 the right end.
  const over = useMotionValue(0);
  const left = useTransform(over, (o) => Math.min(o, 0));
  const right = useTransform(over, (o) => -Math.max(o, 0));
  const thin = useTransform(over, (o) => 1 - Math.min(Math.abs(o) / (stretch * 5 || 1), 0.35));
  const rightX = useTransform(over, (o) => Math.max(o, 0));
  const leftScale = useTransform(over, (o) => 1 + Math.max(-o, 0) / (stretch * 3 || 1));
  const rightScale = useTransform(over, (o) => 1 + Math.max(o, 0) / (stretch * 3 || 1));

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const commit = (v: number) => {
    const next = clamp(min + Math.round((v - min) / step) * step);
    const fixed = Number(next.toFixed(6));
    if (fixed !== value) {
      setValue(fixed);
      onValueChange?.(fixed);
    }
  };

  const track = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    const x = clientX - r.left;
    const o = x < 0 ? x : x > r.width ? x - r.width : 0;
    // Exponential falloff: easy to start stretching, impossible to exceed `stretch`.
    over.set(Math.sign(o) * stretch * (1 - Math.exp(-Math.abs(o) / (stretch * 2.5 || 1))));
    commit(min + (Math.min(Math.max(x, 0), r.width) / r.width) * (max - min));
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    dragging.current = true;
    setActive(true);
    over.stop();
    track(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => dragging.current && track(e.clientX);
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    animate(over, 0, release);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, (max - min) / 10);
    const delta: Record<string, number> = {
      ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step,
      PageUp: big, PageDown: -big, Home: min - max, End: max - min,
    };
    const d = delta[e.key];
    if (d === undefined) return;
    e.preventDefault();
    // Pushing past an end gives a little elastic bump instead of nothing.
    if ((d > 0 && value >= max) || (d < 0 && value <= min)) {
      animate(over, Math.sign(d) * stretch * 0.6, { duration: 0.09, ease: "easeOut" }).then(() => animate(over, 0, release));
    }
    commit(value + d);
  };

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const lifted = active || hover;

  return (
    <div className={cn("flex w-full max-w-sm flex-col items-center gap-3 select-none", className)}>
      <div className="flex w-full items-center gap-4">
        <motion.span
          aria-hidden
          className={cn("grid size-5 shrink-0 place-items-center transition-colors [&>svg]:size-full", lifted ? "text-foreground" : "text-muted-foreground")}
          style={{ x: left, scale: leftScale }}
        >
          {leftIcon}
        </motion.span>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onKeyDown={onKey}
          className="group relative h-8 flex-1 cursor-grab touch-none rounded-full outline-none active:cursor-grabbing"
        >
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-muted ring-offset-2 ring-offset-background group-focus-visible:ring-2 group-focus-visible:ring-ring"
            style={{ left, right, scaleY: thin }}
            animate={{ height: lifted ? 12 : 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
          </motion.div>
        </div>
        <motion.span
          aria-hidden
          className={cn("grid size-5 shrink-0 place-items-center transition-colors [&>svg]:size-full", lifted ? "text-foreground" : "text-muted-foreground")}
          style={{ x: rightX, scale: rightScale }}
        >
          {rightIcon}
        </motion.span>
      </div>
      {showValue && (
        <span aria-hidden className="font-mono text-sm tabular-nums text-muted-foreground">
          {Math.round(value * 100) / 100}
        </span>
      )}
    </div>
  );
}
