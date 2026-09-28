"use client";

import { useEffect, useState, type LabelHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Show a required marker. Also set `required` on the control so assistive tech announces it. */
  required?: boolean;
  /** Show an "Optional" tag on the right instead. */
  optional?: boolean;
  /** Helper text under the label. Gets id `${htmlFor}-hint` for the control's aria-describedby. */
  hint?: ReactNode;
  disabled?: boolean;
}

export function Label({ required = false, optional = false, hint, disabled = false, htmlFor, className, children, ...props }: LabelProps) {
  const [focused, setFocused] = useState(false);

  // Light up while the labelled control has focus.
  useEffect(() => {
    const el = htmlFor ? document.getElementById(htmlFor) : null;
    if (!el) return;
    const on = () => setFocused(true);
    const off = () => setFocused(false);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
    return () => {
      el.removeEventListener("focus", on);
      el.removeEventListener("blur", off);
    };
  }, [htmlFor]);

  return (
    <div data-focused={focused || undefined} data-disabled={disabled || undefined} className="group/label grid gap-1 data-disabled:opacity-50">
      <div className="flex items-baseline justify-between gap-3">
        <label
          {...props}
          htmlFor={htmlFor}
          className={cn(
            "inline-flex items-baseline gap-1 text-sm font-medium leading-none text-foreground/85 transition-colors duration-200 select-none",
            "group-data-focused/label:text-foreground group-data-disabled/label:cursor-not-allowed",
            className,
          )}
        >
          {children}
          {required && (
            <span
              aria-hidden
              className="inline-block text-destructive transition-[scale,rotate] duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] group-data-focused/label:scale-125 group-data-focused/label:rotate-[72deg] motion-reduce:transition-none"
            >
              *
            </span>
          )}
        </label>
        {optional && !required && <span className="text-xs text-muted-foreground">Optional</span>}
      </div>
      {hint && (
        <p
          id={htmlFor ? `${htmlFor}-hint` : undefined}
          className="text-xs leading-snug text-muted-foreground transition-colors duration-200 group-data-focused/label:text-foreground/70"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
