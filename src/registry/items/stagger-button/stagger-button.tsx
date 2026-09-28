"use client";

import type { ButtonHTMLAttributes } from "react";

export interface StaggerButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Button label (plain text, split into letters). */
  children?: string;
  /** Ms between each letter starting to roll. */
  stagger?: number;
  /** Ms each letter takes to roll. */
  duration?: number;
}

export function StaggerButton({ children = "", stagger = 25, duration = 450, className, ...props }: StaggerButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-foreground px-7 text-sm font-medium text-background shadow-[inset_0_1px_0_rgb(255_255_255/.15)] transition-[scale,background-color] hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden className="flex">
        {Array.from(children).map((c, i) => {
          const ch = c === " " ? " " : c;
          return (
            <span key={i} className="relative inline-block h-[1.3em] overflow-hidden leading-[1.3em]">
              <span
                className="flex flex-col transition-transform ease-[cubic-bezier(.7,0,.25,1)] group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:transition-none"
                style={{ transitionDuration: `${duration}ms`, transitionDelay: `${i * stagger}ms` }}
              >
                <span>{ch}</span>
                <span>{ch}</span>
              </span>
            </span>
          );
        })}
      </span>
    </button>
  );
}
