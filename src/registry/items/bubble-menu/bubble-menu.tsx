"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface BubbleMenuItem {
  label: string;
  href: string;
  /** Bubble color on hover/focus. */
  color?: string;
}

export interface BubbleMenuProps {
  items: BubbleMenuItem[];
  /** Content of the left pill, usually your logo. */
  logo?: ReactNode;
  /** `fixed` pins to the viewport, `absolute` keeps it inside the nearest positioned parent. */
  position?: "fixed" | "absolute";
  /** Seconds between bubbles popping in. */
  stagger?: number;
  /** Max resting tilt of a bubble in degrees. */
  tilt?: number;
  /** Size of the bubble labels in px. */
  fontSize?: number;
  /** Start with the menu open. */
  defaultOpen?: boolean;
  className?: string;
}

// Deterministic per-index wobble so SSR and client agree.
const wobble = [-1, 0.7, -0.4, 0.9, -0.8, 0.5, -0.6, 1];

export function BubbleMenu({
  items,
  logo = "bubble",
  position = "fixed",
  stagger = 0.07,
  tilt = 6,
  fontSize = 34,
  defaultOpen = false,
  className,
}: BubbleMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pos = position === "fixed" ? "fixed" : "absolute";
  const pill = "rounded-full border border-border bg-card text-foreground shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]";

  return (
    <div className={`contents ${className ?? ""}`}>
      <nav className={`${pos} inset-x-0 top-0 z-50 flex items-center justify-between p-5`} aria-label="Main">
        <motion.div className={`${pill} flex h-14 items-center px-6 text-lg font-semibold tracking-tight`} animate={{ scale: open ? 0.96 : 1 }}>
          {logo}
        </motion.div>
        <motion.button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.9 }}
          className={`${pill} relative grid size-14 place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {[-1, 1].map((s) => (
            <motion.span
              key={s}
              aria-hidden
              className="absolute h-[2px] w-5 rounded-full bg-current"
              animate={open ? { y: 0, rotate: s * 45 } : { y: s * 4, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            />
          ))}
        </motion.button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            className={`${pos} inset-0 z-40 flex items-center justify-center bg-background/40 px-6 pt-20 pb-6 backdrop-blur-md`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: reduce ? 0 : items.length * 0.03 } }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <ul className="flex max-w-3xl flex-wrap items-center justify-center gap-4">
              {items.map((item, i) => {
                const r = wobble[i % wobble.length] * tilt;
                return (
                  <motion.li
                    key={item.label}
                    initial={reduce ? { opacity: 0 } : { scale: 0, rotate: r * 3, opacity: 0 }}
                    animate={{ scale: 1, rotate: r, opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { scale: 0, opacity: 0, transition: { duration: 0.18, delay: (items.length - 1 - i) * 0.03 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 16, delay: reduce ? 0 : i * stagger }}
                  >
                    <motion.a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      whileHover={{ scale: 1.06, rotate: -r }}
                      whileFocus={{ scale: 1.06, rotate: -r }}
                      whileTap={{ scale: 0.95 }}
                      className={`block rounded-full bg-foreground px-9 py-4 text-background shadow-[0_14px_40px_-12px_rgba(0,0,0,.6)] font-semibold tracking-tight outline-none transition-colors duration-200 hover:bg-[var(--bubble)] hover:text-white focus-visible:bg-[var(--bubble)] focus-visible:text-white`}
                      style={{ fontSize, ["--bubble" as string]: item.color ?? "var(--primary)" }}
                    >
                      {item.label}
                    </motion.a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
