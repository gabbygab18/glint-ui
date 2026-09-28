"use client";

import { useId, useState, type HTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Slot = number | "start-ellipsis" | "end-ellipsis";

/**
 * Pages to show: `boundaries` at each end, `siblings` around the current page,
 * ellipses for the gaps. Always returns the same number of slots once the page
 * count exceeds it, so the bar never changes width while paging.
 */
export function paginationRange(page: number, total: number, siblings = 1, boundaries = 1): Slot[] {
  const range = (a: number, z: number) => Array.from({ length: Math.max(0, z - a + 1) }, (_, i) => a + i);
  const w = siblings * 2 + 1;
  if (total <= 2 * boundaries + w + 2) return range(1, total);
  if (page <= boundaries + siblings + 2) return [...range(1, boundaries + w + 1), "end-ellipsis", ...range(total - boundaries + 1, total)];
  if (page >= total - boundaries - siblings - 1) return [...range(1, boundaries), "start-ellipsis", ...range(total - boundaries - w, total)];
  return [...range(1, boundaries), "start-ellipsis", ...range(page - siblings, page + siblings), "end-ellipsis", ...range(total - boundaries + 1, total)];
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Number of pages. */
  total: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. */
  siblings?: number;
  /** Pages always shown at the start and end. */
  boundaries?: number;
  /** Show the Previous / Next buttons. */
  showControls?: boolean;
}

const item =
  "relative inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium tabular-nums outline-none transition-[color,background-color,scale] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

export function Pagination({
  total,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  siblings = 1,
  boundaries = 1,
  showControls = true,
  className,
  ...props
}: PaginationProps) {
  const [inner, setInner] = useState(defaultPage);
  const id = useId();
  const reduce = useReducedMotion();
  const count = Math.max(1, Math.floor(total));
  const page = Math.min(Math.max(1, pageProp ?? inner), count);
  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), count);
    if (next === page) return;
    if (pageProp === undefined) setInner(next);
    onPageChange?.(next);
  };
  const jump = siblings * 2 + 1;

  return (
    <nav aria-label="Pagination" {...props} className={cn("flex justify-center", className)}>
      <ul className="flex items-center gap-1">
        {showControls && (
          <li>
            <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)} className={cn(item, "pr-3 text-foreground hover:bg-muted")}>
              <ChevronLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">Previous</span>
            </button>
          </li>
        )}
        {paginationRange(page, count, siblings, boundaries).map((slot, i) => {
          if (typeof slot === "string") {
            const back = slot === "start-ellipsis";
            const Icon = back ? ChevronsLeft : ChevronsRight;
            return (
              <li key={slot}>
                {/* Dots morph into a chevron on hover/focus; clicking skips a window of pages. */}
                <button
                  type="button"
                  aria-label={back ? `Back ${jump} pages` : `Forward ${jump} pages`}
                  onClick={() => go(page + (back ? -jump : jump))}
                  className={cn(item, "group text-muted-foreground hover:bg-muted hover:text-foreground")}
                >
                  <MoreHorizontal aria-hidden className="size-4 transition-[opacity,scale] duration-200 group-hover:scale-50 group-hover:opacity-0 group-focus-visible:scale-50 group-focus-visible:opacity-0" />
                  <Icon aria-hidden className="absolute size-4 scale-50 opacity-0 transition-[opacity,scale] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
                </button>
              </li>
            );
          }
          const current = slot === page;
          return (
            <li key={`p${i}`}>
              <button
                type="button"
                aria-label={`Page ${slot}`}
                aria-current={current ? "page" : undefined}
                onClick={() => go(slot)}
                className={cn(item, current ? "text-primary-foreground" : "text-foreground hover:bg-muted")}
              >
                {current && (
                  <motion.span
                    aria-hidden
                    layoutId={`${id}-active`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                    className="absolute inset-0 rounded-lg bg-primary shadow-md shadow-primary/25"
                  />
                )}
                <span className="relative">{slot}</span>
              </button>
            </li>
          );
        })}
        {showControls && (
          <li>
            <button type="button" aria-label="Next page" disabled={page >= count} onClick={() => go(page + 1)} className={cn(item, "pl-3 text-foreground hover:bg-muted")}>
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
