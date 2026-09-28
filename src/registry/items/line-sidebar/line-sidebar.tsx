"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LineSidebarItem {
  label: string;
  icon?: ReactNode;
  /** Small count or tag shown on the right. */
  badge?: string;
}

export interface LineSidebarProps {
  items: LineSidebarItem[];
  /** Index selected at first render. */
  defaultActive?: number;
  /** Indicator color. */
  color?: string;
  /** Spring stiffness of the leading edge; the trailing edge follows at a third. */
  stiffness?: number;
  /** Show the faint rail behind the indicator. */
  showTrack?: boolean;
  onSelect?: (index: number) => void;
  className?: string;
}

/** Top and bottom px of the indicator for an item, inset a little. */
const edges = (el: HTMLElement | null | undefined) => (el ? [el.offsetTop + 8, el.offsetTop + el.offsetHeight - 8] : [0, 0]);

export function LineSidebar({
  items,
  defaultActive = 0,
  color = "#c6f24e",
  stiffness = 420,
  showTrack = true,
  onSelect,
  className,
}: LineSidebarProps) {
  const [active, setActive] = useState(defaultActive);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prev = useRef(defaultActive);
  const top = useMotionValue(0);
  const bottom = useMotionValue(0);
  const height = useTransform(() => Math.max(0, bottom.get() - top.get()));

  // Snap into place on mount and whenever the list resizes.
  useLayoutEffect(() => {
    const snap = () => {
      const [t, b] = edges(itemRefs.current[prev.current]);
      top.jump(t);
      bottom.jump(b);
    };
    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(listRef.current!);
    return () => ro.disconnect();
  }, [top, bottom]);

  // The edge moving toward the target leads; the other trails, so the line stretches then catches up.
  useEffect(() => {
    if (active === prev.current) return;
    const down = active > prev.current;
    prev.current = active;
    const [t, b] = edges(itemRefs.current[active]);
    const lead = { type: "spring", stiffness, damping: 30 } as const;
    const trail = { type: "spring", stiffness: stiffness / 3, damping: 24 } as const;
    const a1 = animate(top, t, down ? trail : lead);
    const a2 = animate(bottom, b, down ? lead : trail);
    return () => {
      a1.stop();
      a2.stop();
    };
  }, [active, stiffness, top, bottom]);

  const select = (i: number) => {
    setActive(i);
    onSelect?.(i);
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const i = itemRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    itemRefs.current[(next + items.length) % items.length]?.focus();
  };

  return (
    <nav className={cn("w-full", className)}>
      <ul ref={listRef} onKeyDown={onKey} className="relative flex flex-col gap-1 pl-4">
        {showTrack && <li aria-hidden className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-border" />}
        <motion.li
          aria-hidden
          className="absolute left-0 top-0 w-0.5 rounded-full"
          style={{ y: top, height, background: color, boxShadow: `0 0 12px ${color}, 0 0 2px ${color}` }}
        />
        {items.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.label}>
              <button
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => select(i)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                  on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {it.icon && (
                  <span
                    className="grid size-4 shrink-0 place-items-center transition-colors duration-300 [&>svg]:size-full"
                    style={{ color: on ? color : undefined }}
                  >
                    {it.icon}
                  </span>
                )}
                <span className="flex-1 truncate transition-transform duration-300 ease-out" style={{ transform: on ? "translateX(3px)" : "none" }}>
                  {it.label}
                </span>
                {it.badge && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">{it.badge}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
