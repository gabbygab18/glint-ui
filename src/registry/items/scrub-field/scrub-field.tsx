"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";

export interface ScrubFieldProps {
  label?: string;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Suffix shown after the number. */
  unit?: string;
  /** Pointer px per step while scrubbing. */
  pixelsPerStep?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;
// Soft limit: the further you pull past the end, the less it gives.
const rubber = (px: number) => Math.sign(px) * 28 * (1 - Math.exp(-Math.abs(px) / 90));

export function ScrubField({
  label = "Opacity",
  value,
  defaultValue = 64,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  pixelsPerStep = 4,
  onChange,
  className,
}: ScrubFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const scrub = useRef<{ lastX: number; raw: number; moved: boolean } | null>(null);
  const [inner, setInner] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const [mode, setMode] = useState<"fine" | "coarse" | null>(null);
  const [active, setActive] = useState(false);
  const current = value ?? inner;
  const dec = decimals(step);

  const over = useMotionValue(0);
  const scaleX = useTransform(over, (o) => 1 + Math.abs(o) / 260);
  const originX = useTransform(over, (o) => (o > 0 ? 0 : 1));
  const x = useTransform(over, (o) => o * 0.25);

  const commit = (v: number, precision = dec) => {
    const next = Number(Math.min(max, Math.max(min, v)).toFixed(precision));
    if (next === current) return;
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const mult = (e: { shiftKey: boolean; altKey: boolean }) => (e.shiftKey ? 10 : e.altKey ? 0.1 : 1);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target === input.current && document.activeElement === input.current)) return;
    e.preventDefault(); // don't focus the input yet: this might be a scrub
    e.currentTarget.setPointerCapture(e.pointerId);
    scrub.current = { lastX: e.clientX, raw: current, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = scrub.current;
    if (!s) return;
    const dx = e.clientX - s.lastX;
    if (!s.moved && Math.abs(dx) < 3) return;
    if (!s.moved) {
      s.moved = true;
      setActive(true);
    }
    s.lastX = e.clientX;
    const m = mult(e);
    const m2 = m === 10 ? "coarse" : m === 1 ? null : "fine";
    if (m2 !== mode) setMode(m2);
    const give = (60 / pixelsPerStep) * step; // how far past the ends the pull can stretch
    s.raw = Math.min(max + give, Math.max(min - give, s.raw + (dx / pixelsPerStep) * step * m));
    const snapped = Math.round(s.raw / (step * Math.min(m, 1))) * step * Math.min(m, 1);
    commit(snapped, m < 1 ? dec + 1 : dec);
    const past = s.raw > max ? s.raw - max : s.raw < min ? s.raw - min : 0;
    over.set(rubber((past / step) * pixelsPerStep));
  };
  const onUp = () => {
    const s = scrub.current;
    scrub.current = null;
    setActive(false);
    setMode(null);
    animate(over, 0, { type: "spring", stiffness: 600, damping: 14 });
    if (s && !s.moved) {
      input.current?.focus();
      input.current?.select();
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const m = mult(e);
      commit(current + (e.key === "ArrowUp" ? 1 : -1) * step * m, m < 1 ? dec + 1 : dec);
      setDraft(null);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      commit(e.key === "Home" ? min : max);
      setDraft(null);
    } else if (e.key === "Enter") {
      finishDraft();
      input.current?.select();
    } else if (e.key === "Escape") {
      setDraft(null);
      input.current?.blur();
    }
  };
  const finishDraft = () => {
    if (draft !== null) {
      const n = parseFloat(draft);
      if (Number.isFinite(n)) commit(n, dec + 1);
    }
    setDraft(null);
  };

  const shown = String(Number(current.toFixed(dec + 1)));
  const pct = ((current - min) / (max - min || 1)) * 100;

  return (
    <div className={`w-64 ${className ?? ""}`}>
      <motion.div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onLostPointerCapture={() => scrub.current && onUp()}
        style={{ scaleX, originX, x }}
        className={`group relative flex h-11 cursor-ew-resize touch-none select-none items-center overflow-hidden rounded-xl border bg-card shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40 ${
          active ? "border-ring" : "border-border hover:border-muted-foreground/50"
        }`}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 bg-primary/12 transition-[width] duration-75" style={{ width: `${pct}%` }} />
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-2 text-muted-foreground transition-opacity duration-200 ${active ? "opacity-70" : "opacity-25 group-hover:opacity-45"}`}
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 8px)",
            backgroundPositionX: -((current - min) / step) * pixelsPerStep,
            maskImage: "linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)",
          }}
        />
        <label htmlFor={id} className="relative cursor-ew-resize pl-3.5 text-sm text-muted-foreground">
          {label}
        </label>
        <input
          ref={input}
          id={id}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-valuenow={current}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={`${shown}${unit}`}
          value={draft ?? shown}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={finishDraft}
          style={{ outline: "none" }} // the field shows the focus ring
          className="relative min-w-0 flex-1 cursor-ew-resize bg-transparent text-right text-sm font-semibold tabular-nums text-foreground outline-none focus:cursor-text"
        />
        <span aria-hidden className="relative pr-3.5 pl-0.5 text-sm text-muted-foreground">
          {unit}
        </span>
      </motion.div>
      <div aria-hidden className="relative mt-2 flex h-5 justify-center">
        <AnimatePresence>
          {mode && (
            <motion.span
              key={mode}
              initial={{ opacity: 0, y: -6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 600, damping: 22 }}
              className="absolute rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
            >
              {mode === "fine" ? "Fine ×0.1" : "Coarse ×10"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
