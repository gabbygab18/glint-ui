"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface Reaction {
  emoji: string;
  label: string;
}

export interface ReactionBarProps {
  reactions?: Reaction[];
  /** Controlled selection (the reaction's label), or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (label: string | null) => void;
  /** Button text while nothing is picked. */
  label?: string;
  /** Open the tray on hover as well as on click. */
  hover?: boolean;
  className?: string;
}

const DEFAULTS: Reaction[] = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🎉", label: "Party" },
];

/**
 * A reaction button with a tray of emoji that springs open above it. The emoji
 * under the pointer lifts and grows, and the one you pick pops onto the button.
 */
export function ReactionBar({
  reactions = DEFAULTS,
  value,
  defaultValue = null,
  onChange,
  label = "React",
  hover = true,
  className,
}: ReactionBarProps) {
  const [inner, setInner] = useState<string | null>(defaultValue);
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const tray = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  // Only a click or key press moves focus into the tray; hovering just shows it.
  const focusTray = useRef(false);
  const current = value === undefined ? inner : value;
  const picked = reactions.find((r) => r.label === current);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (open && focusTray.current) tray.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    focusTray.current = false;
  }, [open]);

  const choose = (next: string | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
    setOpen(false);
    setHot(null);
  };
  const later = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  const onTrayKey = (e: KeyboardEvent) => {
    const els = [...(tray.current?.querySelectorAll<HTMLElement>("button") ?? [])];
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowRight") els[(i + 1) % els.length]?.focus();
    else if (e.key === "ArrowLeft") els[(i - 1 + els.length) % els.length]?.focus();
    else if (e.key === "Escape") {
      setOpen(false);
      trigger.current?.focus();
    } else return;
    e.preventDefault();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("relative inline-block", className)}
        onPointerEnter={(e) => hover && e.pointerType === "mouse" && later(() => setOpen(true), 350)}
        onPointerLeave={(e) => hover && e.pointerType === "mouse" && later(() => setOpen(false), 300)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              ref={tray}
              role="toolbar"
              aria-label="Reactions"
              onKeyDown={onTrayKey}
              className="absolute bottom-full left-0 z-50 mb-2 flex items-end gap-0.5 rounded-full border border-border bg-card px-1.5 py-1 shadow-2xl"
              style={{ transformOrigin: "20px 100%" }}
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 6, transition: { duration: 0.15 } }}
              transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
            >
              {reactions.map((r, i) => (
                <motion.button
                  key={r.label}
                  type="button"
                  aria-label={r.label}
                  aria-pressed={current === r.label}
                  onClick={() => choose(current === r.label ? null : r.label)}
                  onPointerEnter={() => setHot(i)}
                  onPointerLeave={() => setHot(null)}
                  onFocus={() => setHot(i)}
                  className="relative grid size-10 place-items-center rounded-full text-2xl leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  initial={{ opacity: 0, y: 12, scale: 0.4 }}
                  animate={{ opacity: 1, y: hot === i ? -6 : 0, scale: hot === i ? 1.35 : 1 }}
                  transition={{ type: "spring", bounce: 0.45, duration: 0.35, delay: hot === null ? i * 0.035 : 0 }}
                >
                  <span aria-hidden>{r.emoji}</span>
                  <AnimatePresence>
                    {hot === i && (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute -top-7 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background"
                        initial={{ opacity: 0, y: 4, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 0.75 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {r.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={trigger}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => {
            window.clearTimeout(timer.current);
            focusTray.current = !open;
            setOpen((o) => !o);
          }}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            picked ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={picked?.label ?? "none"}
              aria-hidden
              className="text-base leading-none"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.55, duration: 0.45 }}
            >
              {picked?.emoji ?? "☺"}
            </motion.span>
          </AnimatePresence>
          {picked?.label ?? label}
        </button>
      </div>
    </MotionConfig>
  );
}
