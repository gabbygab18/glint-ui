"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";

export interface ExpandableDockItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** Panel the dock morphs into when this item is picked. Items without one just call onClick. */
  panel?: ReactNode;
  onClick?: () => void;
}

export interface ExpandableDockProps {
  items: ExpandableDockItem[];
  /** Id of the item whose panel is open at first render. */
  defaultOpen?: string;
  /** Spring bounce of the morph, 0 (none) to 0.5. */
  bounce?: number;
  /** Morph duration in seconds. */
  duration?: number;
  /** Corner radius of the expanded panel in px (the closed dock is always a pill). */
  radius?: number;
  onOpenChange?: (id: string | null) => void;
  className?: string;
}

/**
 * A compact pill of actions that morphs into a panel. The box animates to the measured
 * size of whatever is inside, so any panel content works. Renders in normal flow: anchor it
 * with `absolute bottom-6` (or fixed) and it grows away from that edge.
 */
export function ExpandableDock({
  items,
  defaultOpen,
  bounce = 0.2,
  duration = 0.5,
  radius = 24,
  onOpenChange,
  className,
}: ExpandableDockProps) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const body = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const uid = useId();
  const current = items.find((i) => i.id === open && i.panel);

  const set = (id: string | null) => {
    setOpen(id);
    onOpenChange?.(id);
  };

  const close = () => {
    const last = open;
    set(null);
    // Return focus to the button that opened the panel once it is back in the DOM.
    if (last) requestAnimationFrame(() => triggers.current[last]?.focus());
  };

  // Close on outside press / Escape while expanded.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setOpen(null);
        onOpenChange?.(null);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onOpenChange]);

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce, duration };
  const fade = reduce ? { duration: 0 } : { duration: duration * 0.5, ease: [0.2, 0.7, 0.2, 1] as const };
  const measured = bounds.width > 0;

  return (
    <motion.div
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
      initial={false}
      animate={{
        width: measured ? bounds.width : "auto",
        height: measured ? bounds.height : "auto",
        borderRadius: current ? radius : 999,
      }}
      transition={spring}
      className={`relative overflow-hidden border border-border bg-card/85 text-foreground shadow-[0_24px_60px_-20px_rgba(0,0,0,.65),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl ${className ?? ""}`}
    >
      <div ref={ref} className="w-max">
        <AnimatePresence mode="popLayout" initial={false}>
          {current ? (
            <motion.div
              key={current.id}
              id={`${uid}-panel`}
              role="dialog"
              aria-label={current.label}
              initial={{ opacity: 0, scale: 0.94, filter: reduce ? "none" : "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.94, filter: reduce ? "none" : "blur(6px)" }}
              transition={fade}
              className="origin-bottom p-2"
            >
              <div className="flex items-center gap-2 px-2 pb-2 pt-1">
                <span className="grid size-6 place-items-center text-muted-foreground [&>svg]:size-4">{current.icon}</span>
                <span className="flex-1 text-sm font-medium">{current.label}</span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="grid size-7 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div ref={body}>{current.panel}</div>
            </motion.div>
          ) : (
            <motion.div
              key="dock"
              role="toolbar"
              aria-label="Dock"
              initial={{ opacity: 0, scale: 0.9, filter: reduce ? "none" : "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: reduce ? "none" : "blur(4px)" }}
              transition={fade}
              className="flex items-center gap-1 p-1.5"
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  ref={(el) => {
                    triggers.current[item.id] = el;
                  }}
                  type="button"
                  aria-label={item.label}
                  aria-haspopup={item.panel ? "dialog" : undefined}
                  aria-expanded={item.panel ? false : undefined}
                  onClick={() => {
                    item.onClick?.();
                    if (!item.panel) return;
                    set(item.id);
                    // Move focus into the panel (first control, else the close button).
                    requestAnimationFrame(() => {
                      const panel = body.current?.parentElement;
                      const first =
                        body.current?.querySelector<HTMLElement>("input, button, [href], [tabindex]:not([tabindex='-1'])") ??
                        panel?.querySelector<HTMLElement>("button");
                      first?.focus();
                    });
                  }}
                  className="group relative grid size-11 place-items-center rounded-full text-muted-foreground outline-none transition-[color,background-color,transform] duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90 [&>svg]:size-5"
                >
                  {item.icon}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
