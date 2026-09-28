"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Draw-in: each line scales from 0 along its axis. With a label the two halves grow
// outward from the label, which fades up once the lines are underway.
const css = `
@keyframes ui-sep-x{from{scale:0 1}}
@keyframes ui-sep-y{from{scale:1 0}}
@keyframes ui-sep-label{from{opacity:0;filter:blur(4px);translate:0 3px}}
.ui-sep-draw [data-line]{animation:ui-sep-x .9s cubic-bezier(.65,0,.2,1) both}
.ui-sep-draw[data-orientation=vertical] [data-line]{animation-name:ui-sep-y}
.ui-sep-draw [data-label]{animation:ui-sep-label .5s .35s ease-out both}
@media (prefers-reduced-motion:reduce){.ui-sep-draw [data-line],.ui-sep-draw [data-label]{animation:none}}
`;

export type SeparatorVariant = "solid" | "dashed" | "gradient";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Text or node centered on the line, e.g. "OR". */
  label?: ReactNode;
  /** `gradient` fades the line out at its ends in the primary color. */
  variant?: SeparatorVariant;
  /** Draw the line in from the center (or outward from the label) on mount. */
  animated?: boolean;
  /** Purely visual (role="none"). Set false when it separates meaningful sections. */
  decorative?: boolean;
}

export function Separator({
  orientation = "horizontal",
  label,
  variant = "solid",
  animated = false,
  decorative = true,
  className,
  ...props
}: SeparatorProps) {
  const h = orientation === "horizontal";
  const hasLabel = label !== undefined && label !== null && label !== "";

  // side: which half of a labelled separator this is (grows away from the label).
  const line = (side?: "start" | "end") => (
    <span
      data-line=""
      aria-hidden
      className={cn(
        "block flex-1",
        h ? "h-px min-w-4" : "w-px min-h-4",
        variant === "solid" && "bg-border",
        variant === "dashed" &&
          (h ? "h-0 border-t border-dashed border-border" : "w-0 border-l border-dashed border-border"),
        variant === "gradient" &&
          (side === "start"
            ? h ? "bg-linear-to-r from-transparent to-primary/70" : "bg-linear-to-b from-transparent to-primary/70"
            : side === "end"
              ? h ? "bg-linear-to-l from-transparent to-primary/70" : "bg-linear-to-t from-transparent to-primary/70"
              : h ? "bg-linear-to-r from-transparent via-primary/70 to-transparent" : "bg-linear-to-b from-transparent via-primary/70 to-transparent"),
        side === "start" ? (h ? "origin-right" : "origin-bottom") : side === "end" ? (h ? "origin-left" : "origin-top") : "origin-center",
      )}
    />
  );

  return (
    <div
      {...props}
      role={decorative ? "none" : "separator"}
      aria-orientation={!decorative && !h ? "vertical" : undefined}
      data-orientation={orientation}
      className={cn(
        "flex shrink-0 items-center",
        h ? "w-full" : "h-full min-h-4 flex-col self-stretch",
        hasLabel && "gap-3",
        animated && "ui-sep-draw",
        className,
      )}
    >
      {animated && (
        <style href="ui-separator" precedence="default">
          {css}
        </style>
      )}
      {hasLabel ? (
        <>
          {line("start")}
          <span
            data-label=""
            className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {label}
          </span>
          {line("end")}
        </>
      ) : (
        line()
      )}
    </div>
  );
}
