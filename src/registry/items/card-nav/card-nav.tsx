"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export interface CardNavLink {
  label: string;
  href: string;
}

export interface CardNavItem {
  label: string;
  links: CardNavLink[];
  /** Card background. */
  bgColor?: string;
  /** Card text color. */
  textColor?: string;
}

export interface CardNavProps {
  items: CardNavItem[];
  logo?: ReactNode;
  /** Label of the call-to-action button. Empty hides it. */
  ctaLabel?: string;
  ctaHref?: string;
  /** Height of the closed bar in px. */
  barHeight?: number;
  /** Seconds between cards sliding in. */
  stagger?: number;
  /** Expanded height of the card row in px. */
  cardHeight?: number;
  /** Start expanded. */
  defaultOpen?: boolean;
  className?: string;
}

export function CardNav({
  items,
  logo = "logo",
  ctaLabel = "Get started",
  ctaHref = "#",
  barHeight = 60,
  stagger = 0.08,
  cardHeight = 200,
  defaultOpen = false,
  className,
}: CardNavProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const id = useId();
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <motion.nav
      aria-label="Main"
      className={`w-full overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl ${className ?? ""}`}
      initial={false}
      animate={{ height: open ? "auto" : barHeight }}
      transition={spring}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <div className="relative flex items-center justify-between px-2" style={{ height: barHeight }}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="group relative grid size-11 place-items-center rounded-xl text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {[-1, 1].map((s) => (
            <motion.span
              key={s}
              aria-hidden
              className="absolute h-[2px] w-5 rounded-full bg-current"
              initial={false}
              animate={open ? { y: 0, rotate: s * 45 } : { y: s * 3.5, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            />
          ))}
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold tracking-tight text-foreground">{logo}</div>
        {ctaLabel ? (
          <a
            href={ctaHref}
            className="hidden h-11 items-center rounded-xl bg-foreground px-4 text-sm font-medium text-background outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:flex"
          >
            {ctaLabel}
          </a>
        ) : (
          <span className="size-11" />
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul id={id} className="grid gap-2 p-2 pt-0 sm:auto-cols-fr sm:grid-flow-col" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            {items.map((item, i) => (
              <motion.li
                key={item.label}
                className="flex flex-col justify-between gap-6 rounded-xl p-4"
                style={{ background: item.bgColor ?? "var(--muted)", color: item.textColor ?? "var(--foreground)", minHeight: cardHeight }}
                initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.05 + i * stagger }}
              >
                <p className="text-2xl font-medium tracking-tight">{item.label}</p>
                <ul className="flex flex-col gap-1">
                  {item.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1 rounded text-[15px] opacity-85 outline-none transition-opacity hover:opacity-100 focus-visible:underline focus-visible:opacity-100"
                      >
                        <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
