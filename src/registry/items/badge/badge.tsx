"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes ui-badge-shine{0%,55%{translate:-120% 0}100%{translate:120% 0}}
.ui-badge-shine::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgb(255 255 255/.45) 50%,transparent 70%);animation:ui-badge-shine 3.2s ease-in-out infinite;pointer-events:none}
@media (prefers-reduced-motion:reduce){.ui-badge-shine::after{animation:none;opacity:0}}
`;

export type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  destructive: "border-destructive/30 bg-destructive/15 text-destructive",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  /** Leading status dot in the badge's text color. */
  dot?: boolean;
  /** Pulse ring around the dot (implies `dot`). */
  pulse?: boolean;
  /** A light sweep that glides across the badge every few seconds. */
  shine?: boolean;
}

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  shine = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "relative inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border font-medium",
        "transition-[background-color,border-color,color,scale] duration-200 [a&]:hover:brightness-110",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-xs",
        variants[variant],
        shine && "ui-badge-shine",
        className,
      )}
    >
      {shine && (
        <style href="ui-badge" precedence="default">
          {css}
        </style>
      )}
      {(dot || pulse) && (
        <span aria-hidden className="relative flex size-1.5">
          {pulse && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-75 motion-reduce:hidden" />}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
