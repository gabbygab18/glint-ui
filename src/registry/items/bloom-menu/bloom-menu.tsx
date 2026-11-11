"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface BloomMenuItem {
  label: string;
  icon?: ReactNode;
  /** Short hint shown on the right, e.g. a keyboard shortcut. */
  hint?: string;
  /** Red styling for destructive actions. */
  destructive?: boolean;
  onSelect?: () => void;
}

export interface BloomMenuProps {
  /** Trigger button text. */
  label: string;
  /** Optional icon before the label. */
  icon?: ReactNode;
  items: BloomMenuItem[];
  /** Which edge the menu grows from. */
  align?: "left" | "right";
  /** Spring bounce of the morph, 0 to 0.5. */
  bounce?: number;
  /** Morph length in seconds. */
  duration?: number;
  className?: string;
}

const TRIGGER = "inline-flex h-10 items-center gap-2 whitespace-nowrap px-4 text-sm font-medium";

/**
 * A button that blooms into its own menu: the pill stretches into a panel in
 * place, its label fades into the list of actions, and it folds back into the
 * button when an item is picked or the menu is dismissed.
 */
export function BloomMenu({
  label,
  icon,
  items,
  align = "left",
  bounce = 0.2,
  duration = 0.42,
  className,
}: BloomMenuProps) {
  const [open, setOpen] = useState(false);
  const [measure, { width, height }] = useMeasure();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const refocus = useRef(false);

  const close = (returnFocus: boolean) => {
    refocus.current = returnFocus;
    setOpen(false);
  };

  // Focus the first item on open; give focus back to the button on keyboard close.
  useEffect(() => {
    if (open) menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    else if (refocus.current) {
      refocus.current = false;
      trigger.current?.focus();
    }
  }, [open]);

  // Click outside closes without stealing focus.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);

  const onMenuKey = (e: KeyboardEvent) => {
    const els = [...(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const i = els.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => els[(n + els.length) % els.length]?.focus();
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(els.length - 1);
    else if (e.key === "Escape") close(true);
    else if (e.key === "Tab") close(false);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  };

  const spring = { type: "spring" as const, bounce, duration };
  const fade = { duration: duration * 0.45, ease: "easeOut" as const };

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root} className={cn("relative inline-block align-top", className)}>
        {/* Reserves the button's footprint so the open menu floats over the page. */}
        <span aria-hidden className={cn(TRIGGER, "invisible")}>
          {icon}
          {label}
        </span>
        <motion.div
          className={cn(
            "absolute top-0 z-50 overflow-hidden border border-border bg-card text-card-foreground",
            align === "right" ? "right-0" : "left-0",
            open ? "shadow-2xl" : "shadow-sm",
          )}
          initial={false}
          animate={{ width: width || "auto", height: height || "auto", borderRadius: open ? 16 : 20 }}
          transition={spring}
        >
          <div ref={measure} className="relative w-max">
            <AnimatePresence initial={false} mode="popLayout">
              {open ? (
                <motion.div
                  key="menu"
                  ref={menu}
                  role="menu"
                  aria-label={label}
                  onKeyDown={onMenuKey}
                  className="w-56 p-1.5"
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transition: { ...fade, delay: duration * 0.15 } }}
                  exit={{ opacity: 0, filter: "blur(4px)", transition: fade }}
                >
                  {items.map((item, i) => (
                    <motion.button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => {
                        item.onSelect?.();
                        close(true);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors",
                        item.destructive
                          ? "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10"
                          : "text-foreground hover:bg-muted focus-visible:bg-muted",
                      )}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...fade, delay: duration * 0.2 + i * 0.03 }}
                    >
                      {item.icon && <span className="grid size-4 place-items-center [&>svg]:size-4">{item.icon}</span>}
                      <span className="flex-1">{item.label}</span>
                      {item.hint && <span className="text-xs text-muted-foreground">{item.hint}</span>}
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.button
                  key="trigger"
                  ref={trigger}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={false}
                  onClick={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                  className={cn(TRIGGER, "rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring")}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transition: { ...fade, delay: duration * 0.2 } }}
                  exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.1 } }}
                >
                  {icon}
                  {label}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
