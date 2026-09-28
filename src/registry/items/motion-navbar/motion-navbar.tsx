"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";

export interface MotionNavbarItem {
  label: string;
  /** Plain link when there is no dropdown. */
  href?: string;
  /** Dropdown panel. */
  content?: ReactNode;
}

export interface MotionNavbarProps {
  items: MotionNavbarItem[];
  /** Left slot (brand). */
  logo?: ReactNode;
  /** Right slot (buttons). */
  actions?: ReactNode;
  /** Spring bounce of the highlight and dropdown morph, 0 to 0.5. */
  bounce?: number;
  /** Seconds for the highlight glide and dropdown morph. */
  duration?: number;
  /** Ms of grace before the dropdown closes after the pointer leaves. */
  closeDelay?: number;
  className?: string;
}

/**
 * Navbar with a hover pill that glides between items and one shared dropdown that morphs
 * its width, height and position as you move between menus, sliding content the way you went.
 */
export function MotionNavbar({ items, logo, actions, bounce = 0.15, duration = 0.4, closeDelay = 150, className }: MotionNavbarProps) {
  const [hl, setHl] = useState<{ left: number; width: number } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const [anchor, setAnchor] = useState({ center: 0, width: 0 });
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const reduce = useReducedMotion();
  const nav = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cancelClose = () => clearTimeout(timer.current);
  const scheduleClose = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), closeDelay);
  };

  const show = (i: number) => {
    cancelClose();
    const el = triggers.current[i];
    const n = nav.current;
    if (el && n) {
      const r = el.getBoundingClientRect();
      const nr = n.getBoundingClientRect();
      setHl({ left: el.offsetLeft, width: el.offsetWidth });
      if (items[i].content) setAnchor({ center: r.left + r.width / 2 - nr.left, width: nr.width });
    }
    if (!items[i].content) {
      setOpen(null);
      return;
    }
    if (open !== null && open !== i) setDir(i > open ? 1 : -1);
    else if (open === null) setDir(0);
    setOpen(i);
  };

  const focusPanel = () =>
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("a, button, input, [tabindex]:not([tabindex='-1'])")?.focus());

  const onTriggerKey = (e: KeyboardEvent, i: number) => {
    if (!items[i].content) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      show(i);
      focusPanel();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && open !== null) {
      triggers.current[open]?.focus();
      setOpen(null);
    }
  };

  const onBlur = (e: FocusEvent) => {
    if (!nav.current?.contains(e.relatedTarget as Node)) {
      setOpen(null);
      setHl(null);
    }
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce, duration };
  const current = open !== null ? items[open] : null;
  // Center the panel under its trigger, but keep it inside the bar when it fits.
  const half = bounds.width / 2;
  const left = half && bounds.width <= anchor.width ? Math.min(Math.max(anchor.center, half), anchor.width - half) : anchor.center;

  return (
    <nav
      ref={nav}
      aria-label="Main"
      onPointerEnter={cancelClose}
      onPointerLeave={() => {
        scheduleClose();
        setHl(null);
      }}
      onKeyDown={onKey}
      onBlur={onBlur}
      className={`relative w-full ${className ?? ""}`}
    >
      <div className="flex h-14 items-center gap-4 rounded-2xl border border-border bg-card/80 px-3 shadow-[0_20px_50px_-30px_rgba(0,0,0,.8)] backdrop-blur-xl">
        {logo && <div className="shrink-0 pl-1">{logo}</div>}
        <ul className="relative mx-auto flex items-center">
          <AnimatePresence>
            {hl && (
              <motion.li
                aria-hidden
                initial={{ opacity: 0, left: hl.left, width: hl.width }}
                animate={{ opacity: 1, left: hl.left, width: hl.width }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="pointer-events-none absolute inset-y-0 rounded-lg bg-muted"
              />
            )}
          </AnimatePresence>
          {items.map((item, i) => {
            const cls = `relative flex h-9 items-center gap-1 rounded-lg px-3.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              open === i ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`;
            const common = {
              ref: (el: HTMLElement | null) => {
                triggers.current[i] = el;
              },
              onPointerEnter: () => show(i),
              onFocus: () => setHl({ left: triggers.current[i]?.offsetLeft ?? 0, width: triggers.current[i]?.offsetWidth ?? 0 }),
              className: cls,
            };
            return (
              <li key={item.label}>
                {item.content ? (
                  <button
                    type="button"
                    aria-expanded={open === i}
                    aria-haspopup="true"
                    onClick={() => (open === i ? setOpen(null) : show(i))}
                    onKeyDown={(e) => onTriggerKey(e, i)}
                    {...common}
                  >
                    {item.label}
                    <motion.svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-3.5 opacity-60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      animate={{ rotate: open === i ? 180 : 0 }}
                      transition={spring}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </motion.svg>
                  </button>
                ) : (
                  <a href={item.href ?? "#"} {...common}>
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      <AnimatePresence>
        {current?.content && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={reduce ? { duration: 0 } : { duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute left-0 top-full z-50 pt-2"
            style={{ transformOrigin: "top center" }}
          >
            <motion.div
              ref={panel}
              initial={false}
              animate={{ left, width: bounds.width || "auto", height: bounds.height || "auto" }}
              transition={spring}
              style={{ translate: "-50% 0" }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_30px_70px_-25px_rgba(0,0,0,.8)] backdrop-blur-xl"
            >
              <div ref={ref} className="w-max">
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.div
                    key={open}
                    custom={dir}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 60 }),
                      center: { opacity: 1, x: 0 },
                      exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -60 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={reduce ? { duration: 0 } : { duration: duration * 0.75, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    {current.content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
