"use client";

import { X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useAnimate } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface ChipInputProps {
  label?: string;
  /** Controlled chips. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (chips: string[]) => void;
  placeholder?: string;
  /** Maximum number of chips. */
  max?: number;
  className?: string;
}

/**
 * A tag field: Enter or a comma turns the text into a chip that pops in, the
 * other chips slide aside when one leaves, a duplicate shakes the chip that
 * already exists, and Backspace on an empty field marks then removes the last one.
 */
export function ChipInput({
  label = "Tags",
  value,
  defaultValue = [],
  onChange,
  placeholder = "Add a tag…",
  max = 12,
  className,
}: ChipInputProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const [text, setText] = useState("");
  const [armed, setArmed] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const input = useRef<HTMLInputElement>(null);
  const chips = value ?? inner;
  const full = chips.length >= max;

  const commit = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const add = () => {
    const t = text.trim().replace(/,+$/, "");
    if (!t || full) return;
    const dupe = chips.findIndex((c) => c.toLowerCase() === t.toLowerCase());
    if (dupe >= 0) {
      const el = scope.current?.querySelector(`[data-chip="${dupe}"]`);
      if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        animate(el, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.35 });
      return;
    }
    commit([...chips, t]);
    setText("");
  };

  const remove = (i: number) => {
    commit(chips.filter((_, j) => j !== i));
    setArmed(false);
    input.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !text && chips.length) {
      e.preventDefault();
      if (armed) remove(chips.length - 1);
      else setArmed(true);
    } else if (armed) setArmed(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("grid gap-1.5", className)}>
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div
          ref={scope}
          onClick={() => input.current?.focus()}
          className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background p-1.5 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {chips.map((c, i) => (
              <motion.span
                layout
                key={c}
                data-chip={i}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md pl-2.5 pr-1 text-xs font-medium transition-colors",
                  armed && i === chips.length - 1 ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground",
                )}
                initial={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, filter: "blur(3px)", transition: { duration: 0.15 } }}
                transition={{ type: "spring", bounce: 0.35, duration: 0.35 }}
              >
                {c}
                <button
                  type="button"
                  aria-label={`Remove ${c}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  className="grid size-5 place-items-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.input
            layout
            id={id}
            ref={input}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setArmed(false);
            }}
            onKeyDown={onKey}
            onBlur={add}
            disabled={full}
            placeholder={full ? `Up to ${max}` : placeholder}
            className="h-7 min-w-24 flex-1 bg-transparent px-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-muted-foreground">Enter or comma to add · Backspace twice to remove the last</p>
      </div>
    </MotionConfig>
  );
}
