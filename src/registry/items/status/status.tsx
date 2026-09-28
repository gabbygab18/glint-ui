"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Two soft rings ripple out of the dot, offset by half a cycle. The label re-enters
// (keyed on status) so a status change reads as a small crossfade instead of a jump.
const css = `
@keyframes ui-status-ring{0%{scale:1;opacity:.55}100%{scale:3.2;opacity:0}}
@keyframes ui-status-in{from{opacity:0;translate:0 4px;filter:blur(2px)}}
.ui-status-ring{animation:ui-status-ring 2s cubic-bezier(.2,.6,.3,1) infinite}
.ui-status-ring+.ui-status-ring{animation-delay:1s}
.ui-status-label{animation:ui-status-in .3s ease-out}
@media (prefers-reduced-motion:reduce){.ui-status-ring{display:none}.ui-status-label{animation:none}}
`;

export type StatusKind = "online" | "away" | "busy" | "offline";

const tone: Record<StatusKind, { dot: string; pill: string; label: string }> = {
  online: { dot: "bg-emerald-500", pill: "border-emerald-500/30 bg-emerald-500/10", label: "Online" },
  away: { dot: "bg-amber-500", pill: "border-amber-500/30 bg-amber-500/10", label: "Away" },
  busy: { dot: "bg-red-500", pill: "border-red-500/30 bg-red-500/10", label: "Busy" },
  offline: { dot: "bg-zinc-400 dark:bg-zinc-500", pill: "border-border bg-muted/50", label: "Offline" },
};

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusKind;
  /** Visible text. Defaults to the status name ("Online", "Away", ...). */
  label?: ReactNode;
  /** `pill` wraps dot and label in a tinted capsule, `plain` is dot + text only. */
  variant?: "pill" | "plain";
  size?: "sm" | "md";
  /** Ripple rings around the dot. Defaults to on for online and busy. */
  pulse?: boolean;
  /** Show only the dot; the label stays available to screen readers. */
  hideLabel?: boolean;
}

export function Status({
  status = "online",
  label,
  variant = "pill",
  size = "md",
  pulse,
  hideLabel = false,
  className,
  ...props
}: StatusProps) {
  const t = tone[status];
  const text = label ?? t.label;
  const rings = pulse ?? (status === "online" || status === "busy");
  const dot = size === "sm" ? "size-1.5" : "size-2";

  return (
    <span
      role="status"
      {...props}
      data-status={status}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-2 font-medium whitespace-nowrap text-foreground",
        size === "sm" ? "text-xs" : "text-sm",
        variant === "pill" && !hideLabel && "rounded-full border transition-[background-color,border-color] duration-300",
        variant === "pill" && !hideLabel && (size === "sm" ? "h-6 px-2.5" : "h-7 px-3"),
        variant === "pill" && !hideLabel && t.pill,
        className,
      )}
    >
      <style href="ui-status" precedence="default">
        {css}
      </style>
      <span aria-hidden className={cn("relative grid shrink-0 place-items-center", dot)}>
        {rings && (
          <>
            <span className={cn("ui-status-ring absolute inset-0 rounded-full", t.dot)} />
            <span className={cn("ui-status-ring absolute inset-0 rounded-full", t.dot)} />
          </>
        )}
        <span
          className={cn(
            "relative rounded-full transition-[background-color,scale] duration-300",
            dot,
            t.dot,
            status === "offline" && "scale-90",
          )}
        />
      </span>
      <span key={status} className={cn("ui-status-label", hideLabel && "sr-only")}>
        {text}
      </span>
    </span>
  );
}
