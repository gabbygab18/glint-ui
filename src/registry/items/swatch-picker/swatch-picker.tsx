"use client";

import { Check } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface Swatch {
  name: string;
  value: string;
}

export interface SwatchPickerProps {
  colors?: Swatch[];
  /** Controlled selection (a swatch value). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Group label, read by screen readers and shown above. */
  label?: string;
  /** Swatch diameter in px. */
  size?: number;
  className?: string;
}

const DEFAULT_COLORS: Swatch[] = [
  { name: "Lime", value: "#b5e61d" },
  { name: "Sky", value: "#38bdf8" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Slate", value: "#64748b" },
];

// Dark or light check depending on how bright the swatch is.
function inkFor(hex: string) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return "#fff";
  const [r, g, b] = m.map((x) => parseInt(x, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#111" : "#fff";
}

/**
 * A row of color swatches where the selection ring glides from one swatch to
 * the next and a check pops in on the chosen color. Arrow keys move the choice.
 */
export function SwatchPicker({
  colors = DEFAULT_COLORS,
  value,
  defaultValue,
  onChange,
  label = "Color",
  size = 32,
  className,
}: SwatchPickerProps) {
  const ringId = useId();
  const [inner, setInner] = useState(defaultValue ?? colors[0]?.value);
  const current = value ?? inner;
  const group = useRef<HTMLDivElement>(null);
  const picked = colors.find((c) => c.value === current);

  const choose = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  const onKey = (e: KeyboardEvent) => {
    const i = colors.findIndex((c) => c.value === current);
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + colors.length) % colors.length;
    choose(colors[next].value);
    group.current?.querySelectorAll<HTMLElement>("[role=radio]")[next]?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("grid gap-2.5", className)}>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{picked?.name}</span>
        </div>
        <div ref={group} role="radiogroup" aria-label={label} onKeyDown={onKey} className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const on = c.value === current;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={c.name}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(c.value)}
                className="group relative grid place-items-center rounded-full outline-none"
                style={{ width: size + 8, height: size + 8 }}
              >
                {on && (
                  <motion.span
                    layoutId={ringId}
                    className="absolute inset-0 rounded-full border-2 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background"
                    style={{ borderColor: c.value }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}
                  />
                )}
                <motion.span
                  className="grid place-items-center rounded-full shadow-sm transition-transform group-hover:scale-110 group-active:scale-90"
                  style={{ width: size, height: size, background: c.value, color: inkFor(c.value) }}
                  animate={{ scale: on ? 0.86 : 1 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.35 }}
                >
                  <motion.span initial={false} animate={{ scale: on ? 1 : 0, rotate: on ? 0 : -60 }} transition={{ type: "spring", bounce: 0.5, duration: 0.35 }}>
                    <Check className="size-4" strokeWidth={3} />
                  </motion.span>
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </MotionConfig>
  );
}
