"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon that slides in on hover. Defaults to an arrow. */
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-9 px-5 text-sm", md: "h-11 px-7 text-sm", lg: "h-13 px-9 text-base" };
const ease = "duration-500 ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:transition-none";
const slideIn = "group-hover:translate-x-0 group-focus-visible:translate-x-0";

export function AnimatedButton({ icon, size = "md", className, children, ...props }: AnimatedButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full border border-border bg-card font-medium text-foreground shadow-sm transition-[color,border-color,scale] ${ease} hover:border-primary hover:text-primary-foreground focus-visible:border-primary focus-visible:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${className ?? ""}`}
    >
      {/* Fill sweeps in from the left with a slanted leading edge. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 -left-1/4 -z-10 w-[150%] -translate-x-full -skew-x-12 bg-primary transition-[translate] ${ease} ${slideIn}`}
      />
      <span
        className={`inline-flex items-center gap-2 whitespace-nowrap transition-[translate,opacity] ${ease} group-hover:translate-x-[120%] group-hover:opacity-0 group-focus-visible:translate-x-[120%] group-focus-visible:opacity-0`}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 grid -translate-x-[120%] place-items-center opacity-0 transition-[translate,opacity] ${ease} ${slideIn} group-hover:opacity-100 group-focus-visible:opacity-100 [&_svg]:size-5`}
      >
        {icon ?? <ArrowRight strokeWidth={2.25} />}
      </span>
    </button>
  );
}
