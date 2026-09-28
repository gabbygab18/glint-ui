"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shine: a skewed highlight crosses the pill, then rests for most of the cycle.
// Arrow: the chevron slides right while its stem draws in (stroke-dashoffset).
const css = `
@keyframes ui-ann-shine{0%,60%{translate:-100% 0}100%{translate:250% 0}}
.ui-ann-shine::after{content:"";position:absolute;inset:0;width:40%;pointer-events:none;background:linear-gradient(100deg,transparent,color-mix(in oklab,var(--foreground) 14%,transparent) 50%,transparent);animation:ui-ann-shine 4s ease-in-out infinite}
.ui-ann-arrow path{transition:translate .25s cubic-bezier(.3,1.4,.5,1),stroke-dashoffset .25s ease}
.ui-ann-arrow .stem{stroke-dasharray:1;stroke-dashoffset:1}
.group\\/ann:hover .ui-ann-arrow .stem,.group\\/ann:focus-visible .ui-ann-arrow .stem{stroke-dashoffset:0}
.group\\/ann:hover .ui-ann-arrow .head,.group\\/ann:focus-visible .ui-ann-arrow .head{translate:3px 0}
@media (prefers-reduced-motion:reduce){.ui-ann-shine::after{animation:none;opacity:0}.ui-ann-arrow path{transition:none}}
`;

export interface AnnouncementProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Short highlighted chip before the text, e.g. "New". Omit for none. */
  tag?: ReactNode;
  /** Periodic light sweep across the pill. */
  shine?: boolean;
  /** Trailing arrow that extends on hover. */
  arrow?: boolean;
}

export function Announcement({
  tag = "New",
  shine = true,
  arrow = true,
  className,
  children,
  ...props
}: AnnouncementProps) {
  return (
    <a
      {...props}
      className={cn(
        "group/ann relative inline-flex w-fit max-w-full items-center gap-2.5 overflow-hidden rounded-full border border-border bg-card/80 py-1 pr-3.5 pl-1 text-sm text-foreground shadow-sm backdrop-blur outline-none",
        "transition-[border-color,box-shadow,scale] duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]",
        !tag && "pl-3.5",
        shine && "ui-ann-shine",
        className,
      )}
    >
      <style href="ui-announcement" precedence="default">
        {css}
      </style>
      {tag && (
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{tag}</span>
      )}
      <span className="truncate">{children}</span>
      {arrow && (
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ui-ann-arrow -ml-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover/ann:text-foreground"
        >
          <path className="stem" pathLength={1} d="M3 8h9.5" />
          <path className="head" d="M6.5 4.5 10 8l-3.5 3.5" />
        </svg>
      )}
    </a>
  );
}
