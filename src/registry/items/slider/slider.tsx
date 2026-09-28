"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  /** One value for a single thumb, two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Called once when a drag or key press finishes. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Tick marks: true = one per step (if not too many), or explicit values with optional labels. */
  marks?: boolean | (number | { value: number; label: ReactNode })[];
  /** Value bubble above the thumb: while hovered/dragged/focused, always, or never. */
  tooltip?: "auto" | "always" | "never";
  formatValue?: (value: number) => string;
  /** Submits one hidden input per thumb under this name. */
  name?: string;
  disabled?: boolean;
  /** Accessible names for the thumbs, e.g. ["Minimum price", "Maximum price"]. */
  thumbLabels?: string[];
  className?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Slider({
  value: valueProp,
  defaultValue = [50],
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  marks = false,
  tooltip = "auto",
  formatValue = String,
  name,
  disabled = false,
  thumbLabels,
  className,
}: SliderProps) {
  const [inner, setInner] = useState(defaultValue);
  const values = valueProp ?? inner;
  const [drag, setDrag] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLSpanElement | null)[]>([]);
  const latest = useRef(values);
  useLayoutEffect(() => {
    latest.current = values; // pointer moves can outrun re-renders; update() also writes it
  });

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const snap = (v: number) => {
    const s = Math.round((v - min) / step) * step + min;
    return clamp(Number(s.toFixed(10)), min, max);
  };

  // Thumbs can meet but never cross their neighbors.
  const update = (i: number, raw: number) => {
    const next = [...latest.current];
    next[i] = clamp(snap(raw), next[i - 1] ?? min, next[i + 1] ?? max);
    if (next[i] === latest.current[i]) return;
    latest.current = next;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const fromPointer = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    return min + clamp((x - r.left) / r.width, 0, 1) * (max - min);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const v = fromPointer(e.clientX);
    // Grab the closest thumb; on a tie (stacked range thumbs) pick by direction.
    let i = 0;
    values.forEach((t, k) => {
      const d = Math.abs(t - v);
      const best = Math.abs(values[i] - v);
      if (d < best || (d === best && v > t)) i = k;
    });
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(i);
    update(i, v);
    thumbs.current[i]?.focus({ preventScroll: true });
  };

  const endDrag = () => {
    if (drag === null) return;
    setDrag(null);
    onValueCommit?.(latest.current);
  };

  const onKey = (i: number) => (e: KeyboardEvent<HTMLSpanElement>) => {
    const big = Math.max(step, (max - min) / 10);
    const v = values[i];
    const next = {
      ArrowRight: v + step,
      ArrowUp: v + step,
      ArrowLeft: v - step,
      ArrowDown: v - step,
      PageUp: v + big,
      PageDown: v - big,
      Home: min,
      End: max,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    update(i, next);
    onValueCommit?.(latest.current);
  };

  const markList = (
    marks === true
      ? (max - min) / step <= 20
        ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, k) => min + k * step)
        : []
      : marks || []
  ).map((m) => (typeof m === "number" ? { value: m, label: undefined } : m));
  const hasLabels = markList.some((m) => m.label !== undefined);
  const lo = values.length > 1 ? values[0] : min;
  const hi = values[values.length - 1];

  return (
    <div
      data-disabled={disabled || undefined}
      className={cn("relative w-full touch-none select-none", disabled && "opacity-50", hasLabels && "pb-6", className)}
    >
      <div
        ref={track}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => drag !== null && update(drag, fromPointer(e.clientX))}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn("group/slider relative flex h-6 items-center", disabled ? "cursor-not-allowed" : "cursor-pointer")}
      >
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "absolute inset-y-0 rounded-full bg-primary",
              drag === null && "transition-[left,right] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
            )}
            style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
          />
        </div>
        {markList.map((m) => {
          const on = m.value >= lo && m.value <= hi;
          return (
            <span
              key={m.value}
              aria-hidden
              className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pct(m.value)}%` }}
            >
              <span
                className={cn(
                  "block size-1 rounded-full transition-colors duration-300",
                  on ? "bg-primary-foreground/70" : "bg-muted-foreground/50",
                )}
              />
              {m.label !== undefined && (
                <span
                  className={cn(
                    "absolute top-4 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap transition-colors duration-300",
                    on ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {m.label}
                </span>
              )}
            </span>
          );
        })}
        {values.map((v, i) => {
          const active = drag === i;
          const text = formatValue(v);
          return (
            <span
              key={i}
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={values[i - 1] ?? min}
              aria-valuemax={values[i + 1] ?? max}
              aria-valuenow={v}
              aria-valuetext={text}
              aria-label={thumbLabels?.[i] ?? (values.length > 1 ? (i === 0 ? "Minimum" : "Maximum") : undefined)}
              aria-orientation="horizontal"
              aria-disabled={disabled || undefined}
              data-active={active || undefined}
              onKeyDown={disabled ? undefined : onKey(i)}
              className={cn(
                "group/thumb absolute top-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-md outline-none",
                "focus-visible:ring-4 focus-visible:ring-ring/40 motion-reduce:transition-none!",
                active ? "scale-125 shadow-lg" : "hover:scale-110",
                disabled && "pointer-events-none",
              )}
              style={{
                left: `${pct(v)}%`,
                // Glide to click targets and key presses, but follow the pointer 1:1 while dragging.
                transition: `scale .2s cubic-bezier(.3,1.5,.5,1), box-shadow .2s${drag === null ? ", left .3s cubic-bezier(.2,.8,.2,1)" : ""}`,
              }}
            >
              {tooltip !== "never" && (
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background tabular-nums shadow-md",
                    "origin-bottom transition-[opacity,scale,translate] duration-200 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none",
                    "after:absolute after:top-full after:left-1/2 after:-mt-1 after:size-2 after:-translate-x-1/2 after:rotate-45 after:bg-inherit",
                    tooltip === "always" || active
                      ? "translate-y-0 scale-100 opacity-100"
                      : "translate-y-1 scale-75 opacity-0 group-hover/thumb:translate-y-0 group-hover/thumb:scale-100 group-hover/thumb:opacity-100 group-focus-visible/thumb:translate-y-0 group-focus-visible/thumb:scale-100 group-focus-visible/thumb:opacity-100",
                  )}
                >
                  {text}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {name && values.map((v, i) => <input key={i} type="hidden" name={name} value={v} />)}
    </div>
  );
}
