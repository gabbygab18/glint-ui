"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface StaggeredMenuLink {
  label: string;
  href: string;
}

export interface StaggeredMenuProps {
  items: StaggeredMenuLink[];
  /** Small links at the bottom of the panel. */
  socials?: StaggeredMenuLink[];
  /** Brand shown at the top left. */
  logo?: ReactNode;
  /** Colors of the layers that sweep in before the panel. */
  layerColors?: string[];
  /** Numbers, hover color and toggle icon color. */
  accentColor?: string;
  /** Edge the panel slides in from. */
  side?: "left" | "right";
  /** `fixed` covers the viewport, `absolute` stays inside the nearest positioned parent. */
  position?: "fixed" | "absolute";
  /** Show 01, 02… next to each link. */
  numbered?: boolean;
  /** Seconds between each layer and each link. */
  stagger?: number;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const ease = [0.76, 0, 0.24, 1] as const;

export function StaggeredMenu({
  items,
  socials = [],
  logo,
  layerColors = ["#c6ff3d", "#5b3df5"],
  accentColor = "#5b3df5",
  side = "right",
  position = "fixed",
  numbered = true,
  stagger = 0.08,
  defaultOpen = false,
  onOpenChange,
  className,
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const toggle = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const panelId = useId();
  const pos = position === "fixed" ? "fixed" : "absolute";
  const off = side === "right" ? "100%" : "-100%";
  const s = reduce ? 0 : stagger;
  const panelDelay = layerColors.length * s;

  const set = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstLink.current?.focus({ preventScroll: true }), (panelDelay + 0.3) * 1000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      onOpenChange?.(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, panelDelay, onOpenChange]);

  return (
    <div className={cn("contents", className)}>
      <header className={`${pos} inset-x-0 top-0 z-50 flex items-center justify-between p-5 sm:p-7`}>
        <div className="text-lg font-semibold tracking-tight text-foreground">{logo}</div>
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => set(!open)}
          className="group flex items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Rolling label: Menu slides up, Close rolls in. */}
          <span className="relative block h-5 overflow-hidden">
            <motion.span
              className="flex flex-col"
              animate={{ y: open ? "-50%" : "0%" }}
              transition={{ duration: reduce ? 0 : 0.5, ease }}
            >
              <span className="h-5 leading-5">Menu</span>
              <span className="h-5 leading-5">Close</span>
            </motion.span>
          </span>
          <motion.span
            aria-hidden
            className="relative grid size-5 place-items-center"
            style={{ color: open ? accentColor : undefined }}
            animate={{ rotate: open ? 225 : 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease }}
          >
            <span className="absolute h-[2px] w-4 rounded-full bg-current" />
            <span className="absolute h-4 w-[2px] rounded-full bg-current" />
          </motion.span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <div key="menu" className={`${pos} inset-0 z-40 overflow-hidden`}>
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label="Close menu"
              className="absolute inset-0 cursor-default bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.2 } }}
              onClick={() => set(false)}
            />
            {layerColors.map((c, i) => (
              <motion.div
                key={c + i}
                aria-hidden
                className={`absolute inset-y-0 ${side === "right" ? "right-0" : "left-0"} w-full sm:w-[min(30rem,100%)]`}
                style={{ background: c }}
                initial={{ x: off }}
                animate={{ x: "0%", transition: { duration: reduce ? 0 : 0.6, ease, delay: i * s } }}
                exit={{ x: off, transition: { duration: reduce ? 0 : 0.5, ease, delay: (layerColors.length - i) * s * 0.5 } }}
              />
            ))}
            <motion.nav
              id={panelId}
              aria-label="Menu"
              className={`absolute inset-y-0 ${side === "right" ? "right-0" : "left-0"} flex w-full flex-col justify-between bg-card px-8 pb-8 pt-24 text-card-foreground sm:w-[min(30rem,100%)] sm:px-10`}
              initial={{ x: off }}
              animate={{ x: "0%", transition: { duration: reduce ? 0 : 0.65, ease, delay: panelDelay } }}
              exit={{ x: off, transition: { duration: reduce ? 0 : 0.5, ease } }}
            >
              <ul>
                {items.map((item, i) => (
                  <li key={item.href + item.label} className="-m-1 overflow-hidden p-1">
                    <motion.a
                      ref={i === 0 ? firstLink : undefined}
                      href={item.href}
                      onClick={() => set(false)}
                      className="group flex items-start gap-3 rounded-lg text-5xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground outline-none transition-colors duration-300 hover:text-[var(--sm-accent)] focus-visible:text-[var(--sm-accent)] sm:text-6xl"
                      style={{ ["--sm-accent" as string]: accentColor }}
                      initial={reduce ? { opacity: 0 } : { y: "110%", rotate: 6 }}
                      animate={
                        reduce
                          ? { opacity: 1 }
                          : { y: "0%", rotate: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: panelDelay + 0.15 + i * s } }
                      }
                    >
                      <span className="transition-transform duration-300 group-hover:translate-x-2 group-focus-visible:translate-x-2">{item.label}</span>
                      {numbered && (
                        <span className="mt-1 text-sm font-medium tracking-normal" style={{ color: accentColor }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </motion.a>
                  </li>
                ))}
              </ul>

              {socials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : panelDelay + 0.3 + items.length * s, duration: 0.5 } }}
                >
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em]" style={{ color: accentColor }}>
                    Socials
                  </p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {socials.map((l) => (
                      <li key={l.href + l.label}>
                        <a
                          href={l.href}
                          className="text-base font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
