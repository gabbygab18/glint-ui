"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface LogoStep {
  name: string;
  logo: ReactNode;
  /** Shown under the row while this logo is highlighted. */
  caption?: ReactNode;
}

export interface LogoStepperProps {
  logos: LogoStep[];
  /** Ms each logo stays highlighted. */
  interval?: number;
  /** Step automatically. Pauses on hover and focus. */
  autoPlay?: boolean;
  /** Focus ring and progress color. */
  accent?: string;
  /** Dim and desaturate the logos that are not highlighted. */
  dimInactive?: boolean;
  className?: string;
}

const css = `@keyframes logo-stepper-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`;

export function LogoStepper({
  logos,
  interval = 2400,
  autoPlay = true,
  accent = "#a3e635",
  dimInactive = true,
  className,
}: LogoStepperProps) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const reduced = useReducedMotion();
  const n = logos.length;
  const current = n ? Math.min(active, n - 1) : 0;
  const playing = autoPlay && !reduced && n > 1;
  const paused = hovered || focused;

  const select = (i: number, focus = false) => {
    const next = ((i % n) + n) % n;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") select(current + 1, true);
    else if (e.key === "ArrowLeft") select(current - 1, true);
    else if (e.key === "Home") select(0, true);
    else if (e.key === "End") select(n - 1, true);
    else return;
    e.preventDefault();
  };

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 32 };
  const item = logos[current];

  return (
    <div
      className={`flex flex-col items-center ${className ?? ""}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
    >
      <style href="logo-stepper" precedence="default">
        {css}
      </style>
      <div role="tablist" aria-label="Customers" onKeyDown={onKey} className="flex flex-wrap items-center justify-center gap-2">
        {logos.map((l, i) => {
          const on = i === current;
          return (
            <button
              key={l.name}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className="relative flex h-16 items-center rounded-2xl px-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {on && (
                <motion.span
                  layoutId={`${id}-ring`}
                  transition={spring}
                  aria-hidden
                  className="absolute inset-0 overflow-hidden border bg-foreground/[0.04]"
                  style={{
                    borderRadius: 16,
                    borderColor: `color-mix(in oklab, ${accent} 55%, transparent)`,
                    boxShadow: `0 0 0 4px color-mix(in oklab, ${accent} 12%, transparent), 0 0 32px -6px color-mix(in oklab, ${accent} 45%, transparent)`,
                  }}
                >
                  {playing && (
                    <span
                      key={current}
                      className="absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full"
                      style={{
                        background: accent,
                        animation: `logo-stepper-progress ${interval}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      onAnimationEnd={() => select(current + 1)}
                    />
                  )}
                </motion.span>
              )}
              <span
                className="relative flex items-center text-foreground transition-[opacity,filter] duration-500"
                style={{ opacity: on || !dimInactive ? 1 : 0.4, filter: on || !dimInactive ? "none" : "grayscale(1)" }}
              >
                {l.logo}
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${current}`} className="mt-8 min-h-14 w-full max-w-xl text-center">
        <AnimatePresence mode="wait" initial={false}>
          {item?.caption && (
            <motion.div
              key={current}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.28 }}
              className="text-balance text-lg text-muted-foreground"
            >
              {item.caption}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
