"use client";

import { useEffect, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

// The native input *is* the box (appearance:none), so forms, labels, :checked and
// :indeterminate all work natively. CSS draws the tick by animating the stroke.
const css = `
.ui-cbx-mark path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .22s cubic-bezier(.6,0,.4,1)}
.ui-cbx:checked:not(:indeterminate)+.ui-cbx-mark .ui-cbx-tick,.ui-cbx:indeterminate+.ui-cbx-mark .ui-cbx-dash{stroke-dashoffset:0;transition-delay:.06s}
@media (prefers-reduced-motion:reduce){.ui-cbx-mark path{transition:none}}
`;

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Mixed state (e.g. "select all" with some children checked). Shows a dash. */
  indeterminate?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ label, description, indeterminate = false, className, id, ref, ...props }: CheckboxProps) {
  const inner = useRef<HTMLInputElement>(null);
  const auto = useId();
  const inputId = id ?? auto;
  useImperativeHandle(ref, () => inner.current!, []);

  // `indeterminate` has no HTML attribute; set the property. Re-applied every render
  // because a click natively clears it.
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  });

  const box = (
    <span className="relative grid size-5 shrink-0 place-items-center transition-[scale] duration-150 has-[input:active:enabled]:scale-90 motion-reduce:transition-none">
      <style href="ui-checkbox" precedence="default">
        {css}
      </style>
      <input
        {...props}
        ref={inner}
        id={inputId}
        type="checkbox"
        aria-describedby={description ? `${inputId}-d` : undefined}
        className={cn(
          "ui-cbx peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-[6px] border border-input bg-background shadow-xs outline-none",
          "transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/60",
          "checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
          className,
        )}
      />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ui-cbx-mark pointer-events-none relative size-3.5 text-primary-foreground peer-disabled:opacity-50"
      >
        <path className="ui-cbx-tick" pathLength={1} d="M4.5 12.5l5 5L19.5 7" />
        <path className="ui-cbx-dash" pathLength={1} d="M6 12h12" />
      </svg>
    </span>
  );

  if (!label && !description) return box;

  return (
    <div className="flex items-start gap-3">
      {box}
      <div className="grid gap-0.5 text-sm leading-5">
        <label
          htmlFor={inputId}
          className={cn("cursor-pointer font-medium text-foreground select-none", props.disabled && "cursor-not-allowed opacity-50")}
        >
          {label}
        </label>
        {description && (
          <p id={`${inputId}-d`} className={cn("text-muted-foreground", props.disabled && "opacity-50")}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
