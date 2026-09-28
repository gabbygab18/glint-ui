"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

export interface AnimatedTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export interface AnimatedTabsProps {
  tabs: AnimatedTab[];
  /** Id of the tab selected at first render. Defaults to the first tab. */
  defaultTab?: string;
  /** Indicator style. */
  variant?: "pill" | "underline";
  /** How panels enter: slide in from the side of travel, or just crossfade. */
  transition?: "slide" | "fade";
  /** Spring bounce of the indicator, 0 (none) to 0.5. */
  bounce?: number;
  onChange?: (id: string) => void;
  className?: string;
}

export function AnimatedTabs({
  tabs,
  defaultTab,
  variant = "pill",
  transition = "slide",
  bounce = 0.2,
  onChange,
  className,
}: AnimatedTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  // Direction of travel (+1 right, -1 left) so the panel slides the way the indicator moves.
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const uid = useId();
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  const index = Math.max(0, tabs.findIndex((t) => t.id === active));
  const current = tabs[index];

  const select = (i: number) => {
    const t = tabs[i];
    if (!t || t.id === active) return;
    setDir(i > index ? 1 : -1);
    setActive(t.id);
    onChange?.(t.id);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = tabs.length;
    const map: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: n - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const i = (map[e.key] + n) % n;
    select(i);
    btns.current[i]?.focus();
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce, duration: 0.5 };
  const shift = transition === "slide" && !reduce ? 28 : 0;

  return (
    <div className={`flex w-full flex-col gap-4 ${className ?? ""}`}>
      <LayoutGroup id={uid}>
        <div
          role="tablist"
          aria-orientation="horizontal"
          onKeyDown={onKey}
          className={`relative flex w-fit max-w-full self-center overflow-x-auto ${
            variant === "pill" ? "gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur" : "gap-2 border-b border-border"
          }`}
        >
          {tabs.map((t, i) => {
            const on = t.id === current?.id;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  btns.current[i] = el;
                }}
                id={`${uid}-tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  variant === "pill" ? "rounded-full" : "rounded-md"
                } ${on ? (variant === "pill" ? "text-primary-foreground" : "text-foreground") : "text-muted-foreground hover:text-foreground"}`}
              >
                {on && (
                  <motion.span
                    layoutId="indicator"
                    aria-hidden
                    transition={spring}
                    className={
                      variant === "pill"
                        ? "absolute inset-0 rounded-full bg-primary shadow-[0_4px_18px_-6px_rgba(0,0,0,.5)]"
                        : "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground"
                    }
                  />
                )}
                {t.icon && <span className="relative z-10 grid size-4 place-items-center [&>svg]:size-full">{t.icon}</span>}
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="relative grid overflow-hidden">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={current?.id}
            id={`${uid}-panel`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${current?.id}`}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * shift, filter: reduce ? "none" : "blur(6px)" }),
              center: { opacity: 1, x: 0, filter: "blur(0px)" },
              exit: (d: number) => ({ opacity: 0, x: -d * shift, filter: reduce ? "none" : "blur(6px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ gridArea: "1 / 1" }}
          >
            {current?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
