"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface FlexNavbarItem {
  label: string;
  icon: ReactNode;
  /** Accent for the expanded pill (any CSS color). Falls back to `accent`. */
  color?: string;
  onClick?: () => void;
}

export interface FlexNavbarProps {
  items: FlexNavbarItem[];
  /** Index of the active item at first render. */
  defaultActive?: number;
  /** Default accent color for items without their own. */
  accent?: string;
  /** Keep the active item's label open when nothing is hovered. */
  showActiveLabel?: boolean;
  /** Spring bounce, 0 (none) to 0.6. */
  bounce?: number;
  /** Icon size in px. */
  iconSize?: number;
  onChange?: (index: number) => void;
  className?: string;
}

/**
 * Icon-only navbar whose items flex open to reveal their label. The hovered (or focused)
 * item expands and its neighbours make room with a spring; the active item stays open at rest.
 */
export function FlexNavbar({
  items,
  defaultActive = 0,
  accent = "#a78bfa",
  showActiveLabel = true,
  bounce = 0.35,
  iconSize = 20,
  onChange,
  className,
}: FlexNavbarProps) {
  const [active, setActive] = useState(defaultActive);
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const open = hover ?? (showActiveLabel ? active : -1);
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce, duration: 0.55 };

  return (
    <nav
      aria-label="Main"
      onPointerLeave={() => setHover(null)}
      className={`flex items-center gap-1 rounded-full border border-border bg-card/80 p-1.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,.7)] backdrop-blur-xl ${className ?? ""}`}
    >
      {items.map((item, i) => {
        const on = i === open;
        const tint = item.color ?? accent;
        return (
          <motion.button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-current={i === active ? "page" : undefined}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => {
              setActive(i);
              onChange?.(i);
              item.onClick?.();
            }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={spring}
            className={`relative flex h-11 items-center rounded-full px-3 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring ${
              on ? "" : "text-muted-foreground hover:text-foreground"
            }`}
            style={on ? { color: tint } : undefined}
          >
            <motion.span
              aria-hidden
              initial={false}
              animate={{ opacity: on ? 0.16 : 0, scale: on ? 1 : 0.8 }}
              transition={spring}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: tint }}
            />
            <span className="relative grid shrink-0 place-items-center [&>svg]:size-full" style={{ width: iconSize, height: iconSize }}>
              {item.icon}
            </span>
            <motion.span
              aria-hidden
              initial={false}
              animate={{ width: on ? "auto" : 0, opacity: on ? 1 : 0, marginLeft: on ? 8 : 0, filter: on || reduce ? "blur(0px)" : "blur(4px)" }}
              transition={spring}
              className="relative overflow-hidden whitespace-nowrap text-sm font-medium"
            >
              {item.label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
  );
}
