"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// The progress bar is a CSS animation whose `animationend` advances the showcase,
// so pausing is just `animation-play-state` (hover / keyboard focus) and there are
// no timers to keep in sync. Reduced motion disables the bar and with it auto-advance.
const css = `
@keyframes fs-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.fs-bar{transform-origin:left;animation:fs-fill var(--fs-dur) linear forwards}
.fs-root:is(:hover,:focus-within)[data-pause] .fs-bar{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.fs-bar{animation:none;transform:scaleX(1)}.fs-visual{transition:none!important}}
`;

export interface Feature {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  /** Shown on the right while this feature is active. */
  visual: ReactNode;
}

export interface FeatureShowcaseProps {
  features: Feature[];
  /** Time each feature stays active before advancing, in ms. */
  interval?: number;
  /** Advance to the next feature automatically. */
  autoPlay?: boolean;
  /** Pause the timer while the pointer or keyboard focus is inside. */
  pauseOnHover?: boolean;
  /** Put the visual on the left instead. */
  reverse?: boolean;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export function FeatureShowcase({
  features,
  interval = 5000,
  autoPlay = true,
  pauseOnHover = true,
  reverse = false,
  defaultIndex = 0,
  onChange,
  className,
}: FeatureShowcaseProps) {
  const [active, setActive] = useState(defaultIndex);
  const [cycle, setCycle] = useState(0); // restarts the bar when re-selecting
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const n = features.length;

  const select = (i: number, focus = false) => {
    const next = (i + n) % n;
    setActive(next);
    setCycle((c) => c + 1);
    onChange?.(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: n - 1 };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  };

  return (
    <div
      data-pause={pauseOnHover || undefined}
      className={cn("fs-root grid w-full max-w-5xl items-center gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10", className)}
      style={{ "--fs-dur": `${interval}ms` } as CSSProperties}
    >
      <style href="feature-showcase" precedence="default">
        {css}
      </style>

      <div role="tablist" aria-orientation="vertical" aria-label="Features" onKeyDown={onKey} className={cn("grid gap-1.5", reverse && "md:order-2")}>
        {features.map((f, i) => {
          const on = i === active;
          return (
            <button
              key={f.title}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-t${i}`}
              aria-selected={on}
              aria-controls={`${id}-p`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className={cn(
                "group relative overflow-hidden rounded-xl border px-4 py-3.5 text-left outline-none transition-[background-color,border-color] duration-300 focus-visible:ring-2 focus-visible:ring-ring/60",
                on ? "border-border bg-card shadow-sm" : "border-transparent hover:bg-muted/50",
              )}
            >
              <span className="flex items-center gap-3">
                {f.icon && (
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300 [&_svg]:size-4",
                      on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {f.icon}
                  </span>
                )}
                <span className={cn("font-medium transition-colors", on ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{f.title}</span>
              </span>
              {/* grid-rows 0fr -> 1fr animates to the description's natural height */}
              <span
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                  on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <span className={cn("overflow-hidden text-sm leading-relaxed text-muted-foreground", f.icon && "pl-11")}>
                  <span className="block pt-1.5">{f.description}</span>
                </span>
              </span>
              {on && (
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-muted">
                  <span
                    key={cycle}
                    className="fs-bar block h-full bg-primary"
                    style={autoPlay ? undefined : { animation: "none", transform: "scaleX(1)" }}
                    onAnimationEnd={() => autoPlay && select(active + 1)}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-p`}
        aria-labelledby={`${id}-t${active}`}
        className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-2xl", reverse && "md:order-1")}
      >
        {features.map((f, i) => (
          <div
            key={f.title}
            aria-hidden={i !== active}
            inert={i !== active}
            className={cn(
              "fs-visual absolute inset-0 transition-[opacity,scale,filter] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]",
              i === active ? "scale-100 opacity-100 blur-0" : "pointer-events-none scale-[1.04] opacity-0 blur-sm",
            )}
          >
            {f.visual}
          </div>
        ))}
      </div>
    </div>
  );
}
