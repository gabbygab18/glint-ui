"use client";

// Adapted from Calamansi UI by fujiDevv (MIT License).
// https://github.com/fujiDevv/calamansi-ui

import { forwardRef, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getSvgPath } from "figma-squircle";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export type DynamicIslandState = "idle" | "compact" | "expanded" | "alert";
export type DynamicIslandVariant = "white" | "calamansi" | "slate" | "citrus";

const LIFT = "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.24))";
/** The alert state glows instead of just lifting. */
const ALERT_GLOW = "drop-shadow(0 0 22px rgba(255, 65, 54, 0.75))";
/** Corner as a share of the height, so the short pill keeps a squircle corner instead of a stadium. */
const SHARE = 0.44;
const RADIUS = 28;

/**
 * The morph animates the real box with a CSS transition (not a layout transform),
 * so the squircle clip path is re-measured every frame and never squashes.
 */
const MORPH_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)] duration-500";
const BOX_MORPH = `transition-[width,height,max-width] ${MORPH_EASE} motion-reduce:transition-none`;
const PADDING_MORPH = `transition-[padding] ${MORPH_EASE} motion-reduce:transition-none`;

const SWAP_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SWAP_IN = { duration: 0.18, ease: SWAP_EASE };
const SWAP_OUT = { duration: 0.1, ease: SWAP_EASE };

const VARIANTS: Record<DynamicIslandVariant, { paint: string; ink: string }> = {
  white: { paint: "bg-white dark:bg-[#1c1c1f]", ink: "text-foreground" },
  calamansi: {
    paint:
      "bg-gradient-to-br from-[#8fa37d] via-[#5c7a67] to-[#39564a] dark:from-[#1b281f] dark:via-[#16221a] dark:to-[#0e1611]",
    ink: "text-white",
  },
  slate: {
    paint:
      "bg-gradient-to-br from-[#a79cb7] via-[#687396] to-[#4a5a7f] dark:from-[#1e1b4b] dark:via-[#1e293b] dark:to-[#0f172a]",
    ink: "text-white",
  },
  citrus: {
    paint:
      "bg-gradient-to-br from-[#d69f7e] via-[#b87152] to-[#7d4128] dark:from-[#2e170c] dark:via-[#22120b] dark:to-[#140a06]",
    ink: "text-white",
  },
};

const SIZES: Record<DynamicIslandState, string> = {
  idle: "h-10 w-32",
  compact: "h-12 w-full max-w-68",
  alert: "h-12 w-full max-w-80",
  expanded: "h-52 w-full max-w-88 sm:max-w-96",
};

/** A superellipse surface, re-measured as the island resizes. Content is clipped by the same path. */
function Squircle({ className, filter, children }: { className?: string; filter?: string; children?: ReactNode }) {
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const corner = bounds.height > 0 ? Math.min(RADIUS, bounds.height * SHARE) : RADIUS;
  const path = useMemo(
    () =>
      bounds.width > 0 && bounds.height > 0
        ? getSvgPath({ width: bounds.width, height: bounds.height, cornerRadius: corner, cornerSmoothing: 1 })
        : null,
    [bounds.width, bounds.height, corner],
  );
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 block" style={{ filter: filter ?? LIFT }}>
      <span
        ref={ref}
        style={path ? { clipPath: `path('${path}')` } : { borderRadius: `min(${RADIUS}px, ${SHARE * 100}%)` }}
        className={cn("relative block size-full overflow-hidden", className)}
      >
        {children}
      </span>
    </span>
  );
}

export interface DynamicIslandProps {
  /** Controlled state. */
  state?: DynamicIslandState;
  /** Initial state when uncontrolled. */
  defaultState?: DynamicIslandState;
  /** Fires when the island asks to change state (tap toggles compact/expanded). */
  onStateChange?: (state: DynamicIslandState) => void;
  /** Primary icon, drawn in a chip tinted from the surface ink. */
  icon?: ReactNode;
  /** Leading slot in compact/alert state, used when no `icon` is given. */
  leading?: ReactNode;
  /** Trailing slot in compact/alert state (timer, badge, waveform). */
  trailing?: ReactNode;
  /** Label shown in compact/alert state. */
  title?: ReactNode;
  /** Content shown when expanded. */
  expandedContent?: ReactNode;
  /** Tap (or Enter/Space) toggles between compact and expanded. */
  interactive?: boolean;
  /** Ambient pulse dot in compact/idle states. */
  pulse?: boolean;
  /** Surface palette. */
  variant?: DynamicIslandVariant;
  /** Accessible name for the island toggle. */
  label?: string;
  className?: string;
}

/**
 * A squircle pill that eases into a slab when tapped and glows red when it alerts.
 * It renders in normal flow, so place it wherever you like (e.g. `absolute top-3`).
 */
export const DynamicIsland = forwardRef<HTMLDivElement, DynamicIslandProps>(function DynamicIsland(
  {
    state,
    defaultState = "compact",
    onStateChange,
    icon,
    leading,
    trailing,
    title,
    expandedContent,
    interactive = true,
    pulse = false,
    variant = "calamansi",
    label = "Dynamic island",
    className,
  },
  ref,
) {
  const [internalState, setInternalState] = useState<DynamicIslandState>(defaultState);
  const currentState = state ?? internalState;
  const reduceMotion = useReducedMotion();
  const palette = VARIANTS[variant] ?? VARIANTS.calamansi;

  const isExpanded = currentState === "expanded";
  const isAlert = currentState === "alert";
  const showPulse = pulse && (currentState === "compact" || currentState === "idle");

  const iconElement = icon ? (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-current/15 shadow-xs ring-1 ring-current/20">
      {icon}
    </span>
  ) : leading ? (
    <span className="shrink-0">{leading}</span>
  ) : null;

  const toggleExpand = () => {
    if (!interactive) return;
    const next: DynamicIslandState = isExpanded ? "compact" : "expanded";
    if (state === undefined) setInternalState(next);
    onStateChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpand();
    }
  };

  return (
    <div className={cn("flex w-full items-center justify-center p-2 select-none", isAlert && "animate-pulse", className)}>
      <motion.div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? label : undefined}
        aria-expanded={interactive ? isExpanded : undefined}
        onClick={toggleExpand}
        onKeyDown={interactive ? onKeyDown : undefined}
        className={cn(
          "relative flex cursor-pointer items-center justify-between rounded-[18px] p-1 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring sm:p-1.5",
          BOX_MORPH,
          palette.ink,
          SIZES[currentState] ?? SIZES.compact,
          !interactive && "cursor-default",
        )}
      >
        <Squircle className={palette.paint} filter={isAlert ? `${LIFT} ${ALERT_GLOW}` : undefined}>
          <div
            className={cn(
              "pointer-events-auto relative flex size-full",
              PADDING_MORPH,
              isExpanded ? "flex-col justify-between p-4 sm:p-5" : "items-center justify-between px-3.5",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, transition: SWAP_OUT }}
                  transition={reduceMotion ? { duration: 0 } : SWAP_IN}
                  className="relative flex size-full flex-col justify-between gap-3"
                >
                  {expandedContent}
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, transition: SWAP_OUT }}
                  transition={reduceMotion ? { duration: 0 } : SWAP_IN}
                  className="relative flex size-full items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {iconElement}
                    {title && (
                      <div className="truncate text-xs font-semibold tracking-tight">{title}</div>
                    )}
                    {showPulse && (
                      <span aria-hidden="true" className="relative flex size-1.5 shrink-0">
                        {!reduceMotion && (
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                        )}
                        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                      </span>
                    )}
                  </div>
                  {trailing && (
                    <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-current/75">{trailing}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Squircle>

        {isAlert && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -right-1.5 flex size-4.5 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-rose-500 text-[10px] font-bold text-white shadow-xs"
          >
            !
          </div>
        )}
      </motion.div>
    </div>
  );
});

DynamicIsland.displayName = "DynamicIsland";
