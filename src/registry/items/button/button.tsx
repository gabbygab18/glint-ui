"use client";

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-background text-foreground shadow-xs hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  destructive: "bg-destructive text-white shadow-sm shadow-destructive/20 hover:bg-destructive/90 focus-visible:ring-destructive/50",
  link: "text-primary underline-offset-4 hover:underline active:scale-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs [--btn-gap:0.375rem] [&_svg]:size-3.5",
  md: "h-10 rounded-lg px-4 text-sm [--btn-gap:0.5rem] [&_svg]:size-4",
  lg: "h-12 rounded-xl px-6 text-base [--btn-gap:0.625rem] [&_svg]:size-5",
  icon: "size-10 rounded-lg [--btn-gap:0px] [&_svg]:size-4",
};

/** Class string for styling other elements (e.g. a router Link) exactly like a Button. */
export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "relative inline-flex shrink-0 gap-(--btn-gap) select-none items-center justify-center whitespace-nowrap font-medium outline-none",
    "transition-[background-color,box-shadow,color,scale,opacity] duration-150 active:scale-[0.96] motion-reduce:transition-none",
    "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-busy:disabled:opacity-80",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
  /** Icon before the label. Replaced by the spinner while loading. */
  startIcon?: ReactNode;
  /** Icon after the label. */
  endIcon?: ReactNode;
  /**
   * Render a different element (e.g. a link) with the button's classes and content:
   * `render={(p) => <Link href="/pricing" {...p} />}`.
   */
  render?: (props: { className: string; children: ReactNode }) => ReactElement;
}

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  startIcon,
  endIcon,
  render,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const content = (
    <>
      {/* Leading slot animates its width open when the spinner appears, so the label slides instead of jumping. */}
      <span
        aria-hidden
        className={cn(
          "grid transition-[grid-template-columns,margin,opacity] duration-200 ease-out motion-reduce:transition-none",
          startIcon || loading ? "grid-cols-[1fr] opacity-100" : "-me-(--btn-gap) grid-cols-[0fr] opacity-0",
        )}
      >
        <span className="grid min-w-0 place-items-center overflow-hidden">
          {loading ? <Loader2 className="animate-spin" /> : startIcon}
        </span>
      </span>
      {/* Icon buttons swap their icon for the spinner instead of growing. */}
      {size === "icon" && loading ? null : children}
      {endIcon && (
        <span aria-hidden className="grid place-items-center">
          {endIcon}
        </span>
      )}
    </>
  );

  const cls = buttonVariants({ variant, size, className });
  if (render) return render({ className: cls, children: content });

  return (
    <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cls}>
      {content}
    </button>
  );
}
