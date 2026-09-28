"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes ui-input-shake{0%,100%{translate:0}20%{translate:-5px}40%{translate:4px}60%{translate:-3px}80%{translate:2px}}
.ui-input[data-invalid]{animation:ui-input-shake .38s cubic-bezier(.36,.07,.19,.97)}
@media (prefers-reduced-motion:reduce){.ui-input[data-invalid]{animation:none}}
`;

export type InputSize = "sm" | "md" | "lg";

const sizes: Record<InputSize, string> = {
  sm: "h-8 rounded-md text-xs [--px:0.625rem] [&_svg]:size-3.5",
  md: "h-10 rounded-lg text-sm [--px:0.75rem] [&_svg]:size-4",
  lg: "h-12 rounded-xl text-base [--px:1rem] [&_svg]:size-5",
};

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  /** Icon or text before the value (decorative). */
  startIcon?: ReactNode;
  /** Icon, text or a small button after the value. */
  endIcon?: ReactNode;
  /** Error message shown under the field. `true` marks the field invalid without a message. */
  error?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ size = "md", startIcon, endIcon, error, className, id, disabled, ref, ...props }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const invalid = !!error || props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const message = error && error !== true ? error : null;
  // Keep the last message around so it can collapse out instead of vanishing.
  const [shown, setShown] = useState<ReactNode>(message);
  if (message && message !== shown) setShown(message);
  const describedBy = [props["aria-describedby"], message ? `${inputId}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid w-full", className)}>
      <style href="ui-input" precedence="default">
        {css}
      </style>
      <div
        data-invalid={invalid || undefined}
        className={cn(
          "ui-input group/input relative flex items-center gap-2 border border-input bg-background px-(--px) text-foreground shadow-xs",
          "transition-[border-color,box-shadow,background-color] duration-200 hover:border-foreground/25",
          "focus-within:border-ring focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--ring)_25%,transparent)]",
          "data-invalid:border-destructive/70 data-invalid:focus-within:border-destructive data-invalid:focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_22%,transparent)]",
          disabled && "pointer-events-none opacity-50",
          sizes[size],
        )}
      >
        {startIcon && (
          <span
            aria-hidden
            className="flex shrink-0 items-center text-muted-foreground transition-[color,scale] duration-200 group-focus-within/input:scale-110 group-focus-within/input:text-foreground group-data-invalid/input:text-destructive motion-reduce:transition-none"
          >
            {startIcon}
          </span>
        )}
        <input
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground placeholder:transition-opacity focus:placeholder:opacity-60 disabled:cursor-not-allowed"
        />
        {endIcon && <span className="flex shrink-0 items-center text-muted-foreground">{endIcon}</span>}
        {/* Focus sweep: a bright line grows out from the center of the bottom edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-(--px) -bottom-px h-0.5 origin-center scale-x-0 rounded-full bg-ring transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-focus-within/input:scale-x-100 group-data-invalid/input:bg-destructive motion-reduce:transition-none"
        />
      </div>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: message ? "1fr" : "0fr", opacity: message ? 1 : 0 }}
      >
        <p id={`${inputId}-error`} role={message ? "alert" : undefined} className="overflow-hidden text-xs text-destructive">
          <span className="block pt-1.5">{shown}</span>
        </p>
      </div>
    </div>
  );
}
