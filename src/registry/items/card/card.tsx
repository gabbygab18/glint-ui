"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Rotating conic border: @property makes the angle animatable; the mask keeps only a 1px ring.
const css = `
@property --ui-card-angle{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes ui-card-spin{to{--ui-card-angle:360deg}}
.ui-card-border{padding:1px;background:conic-gradient(from var(--ui-card-angle),transparent 0%,color-mix(in oklab,var(--primary) 90%,transparent) 12%,transparent 30%,transparent 50%,color-mix(in oklab,var(--primary) 50%,transparent) 62%,transparent 80%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:ui-card-spin 6s linear infinite;animation-play-state:paused}
.group\\/card:hover .ui-card-border,.group\\/card:focus-within .ui-card-border{animation-play-state:running}
@media (prefers-reduced-motion:reduce){.ui-card-border{animation:none}}
`;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift and deepen the shadow on hover or keyboard focus inside. */
  interactive?: boolean;
  /** Primary-tinted conic border that rotates while hovered. */
  gradientBorder?: boolean;
}

export function Card({ interactive = false, gradientBorder = false, className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "group/card relative flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        interactive &&
          "transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 focus-within:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        gradientBorder && "border-transparent",
        className,
      )}
    >
      {gradientBorder && (
        <>
          <style href="ui-card" precedence="default">
            {css}
          </style>
          <span aria-hidden className="ui-card-border pointer-events-none absolute -inset-px rounded-[inherit]" />
          <span aria-hidden className="pointer-events-none absolute -inset-px rounded-[inherit] border border-border" />
        </>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} className={cn("text-lg font-semibold leading-tight tracking-tight", className)} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("p-6", className)} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("mt-auto flex items-center gap-3 border-t border-border p-6 py-4", className)} />;
}
