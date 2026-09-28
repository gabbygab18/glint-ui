"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface PillNavItem {
  label: string;
  href: string;
}

export interface PillNavProps {
  items: PillNavItem[];
  /** Brand mark shown at the left. */
  logo?: ReactNode;
  /** Index of the active item (controlled). */
  activeIndex?: number;
  /** Initially active item when uncontrolled. */
  defaultActiveIndex?: number;
  onItemClick?: (item: PillNavItem, index: number) => void;
  /** Color of the circle that floods a pill on hover. */
  fillColor?: string;
  /** Label color on top of the fill. */
  fillTextColor?: string;
  /** Fill duration in seconds. */
  duration?: number;
  className?: string;
}

const ease = "cubic-bezier(.22,.9,.24,1)";

export function PillNav({
  items,
  logo,
  activeIndex,
  defaultActiveIndex = 0,
  onItemClick,
  fillColor = "#c6ff3d",
  fillTextColor = "#0a0a0a",
  duration = 0.5,
  className,
}: PillNavProps) {
  const [inner, setInner] = useState(defaultActiveIndex);
  const [open, setOpen] = useState(false);
  const active = activeIndex ?? inner;
  const reduce = useReducedMotion();
  const menuId = useId();
  const dotId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const select = (i: number) => {
    if (activeIndex === undefined) setInner(i);
    onItemClick?.(items[i], i);
    setOpen(false);
  };

  const vars = {
    "--pill-fill": fillColor,
    "--pill-fill-text": fillTextColor,
    "--pill-t": `${reduce ? 0 : duration}s`,
  } as CSSProperties;

  return (
    <div ref={root} className={cn("@container relative w-full max-w-3xl", className)} style={vars}>
      <nav
        aria-label="Main"
        className="flex items-center justify-between gap-2 rounded-full border border-border bg-card/80 p-1.5 shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)] backdrop-blur-md"
      >
        <a
          href={items[0]?.href ?? "#"}
          aria-label="Home"
          className="grid h-11 shrink-0 place-items-center rounded-full bg-foreground px-4 text-background outline-none transition-transform duration-300 hover:rotate-[-4deg] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {logo ?? <span className="size-3 rounded-full bg-[var(--pill-fill)]" />}
        </a>

        <ul className="hidden items-center gap-1 @xl:flex">
          {items.map((item, i) => (
            <li key={item.href + item.label}>
              <a
                href={item.href}
                aria-current={i === active ? "page" : undefined}
                onClick={() => select(i)}
                className="group relative isolate block h-11 overflow-hidden rounded-full px-5 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {/* The flood: a circle anchored under the pill that grows up through it. */}
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 -z-10 aspect-square rounded-full bg-[var(--pill-fill)] [transform:translate(-50%,50%)_scale(0)] group-hover:[transform:translate(-50%,50%)_scale(1)] group-focus-visible:[transform:translate(-50%,50%)_scale(1)]"
                  style={{ width: "max(190%, 8rem)", transition: `transform var(--pill-t) ${ease}` }}
                />
                <span className="relative block h-full overflow-hidden">
                  <span
                    className="flex h-11 items-center group-hover:-translate-y-full group-focus-visible:-translate-y-full"
                    style={{ transition: `transform var(--pill-t) ${ease}` }}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-full flex h-11 items-center text-[var(--pill-fill-text)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
                    style={{ transition: `transform var(--pill-t) ${ease}` }}
                  >
                    {item.label}
                  </span>
                </span>
                {i === active && (
                  <motion.span
                    layoutId={dotId}
                    aria-hidden
                    className="absolute bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[var(--pill-fill)] group-hover:bg-[var(--pill-fill-text)] group-focus-visible:bg-[var(--pill-fill-text)]"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="relative grid size-11 shrink-0 place-items-center rounded-full bg-muted text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring @xl:hidden"
        >
          {[-1, 1].map((s) => (
            <motion.span
              key={s}
              aria-hidden
              className="absolute h-[2px] w-4 rounded-full bg-current"
              animate={open ? { y: 0, rotate: s * 45 } : { y: s * 3.5, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
            />
          ))}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={menuId}
            className="absolute inset-x-0 top-full z-20 mt-2 origin-top rounded-[1.75rem] border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-md @xl:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            {items.map((item, i) => (
              <motion.li
                key={item.href + item.label}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.04 + i * 0.04 }}
              >
                <a
                  href={item.href}
                  aria-current={i === active ? "page" : undefined}
                  onClick={() => select(i)}
                  className="group relative isolate flex h-12 items-center justify-between overflow-hidden rounded-full px-5 text-base font-medium text-foreground outline-none hover:text-[var(--pill-fill-text)] focus-visible:text-[var(--pill-fill-text)]"
                  style={{ transition: `color var(--pill-t) ${ease}` }}
                >
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-1/2 -z-10 aspect-square w-[120%] rounded-full bg-[var(--pill-fill)] [transform:translate(-50%,50%)_scale(0)] group-hover:[transform:translate(-50%,50%)_scale(1)] group-focus-visible:[transform:translate(-50%,50%)_scale(1)]"
                    style={{ transition: `transform var(--pill-t) ${ease}` }}
                  />
                  {item.label}
                  {i === active && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
