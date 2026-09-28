"use client";

import { createContext, useContext, useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Native radios (same `name`) give arrow-key navigation, roving tab stop and form
// submission for free; we only restyle them and animate the selection.
const css = `
@keyframes ui-radio-ripple{from{opacity:.55;scale:1}to{opacity:0;scale:2.4}}
.ui-radio:checked~.ui-radio-ripple{animation:ui-radio-ripple .5s ease-out}
@media (prefers-reduced-motion:reduce){.ui-radio:checked~.ui-radio-ripple{animation:none}}
`;

type Ctx = {
  name: string;
  value: string | undefined;
  select: (v: string) => void;
  variant: "default" | "card";
  disabled: boolean;
  required: boolean;
  indicatorId: string;
};
const RadioContext = createContext<Ctx | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name. Auto-generated if omitted. */
  name?: string;
  /** `card` renders each option as a selectable card with a sliding outline. */
  variant?: "default" | "card";
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  required?: boolean;
}

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  variant = "default",
  orientation = "vertical",
  disabled = false,
  required = false,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [inner, setInner] = useState(defaultValue);
  const id = useId();
  const current = value ?? inner;
  const select = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  return (
    <RadioContext value={{ name: name ?? id, value: current, select, variant, disabled, required, indicatorId: `${id}-indicator` }}>
      <style href="ui-radio-group" precedence="default">
        {css}
      </style>
      <div
        {...props}
        role="radiogroup"
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        className={cn(
          "grid",
          variant === "card" ? "gap-3" : "gap-3.5",
          orientation === "horizontal" && (variant === "card" ? "auto-cols-fr grid-flow-col" : "grid-flow-col justify-start gap-6"),
          className,
        )}
      >
        {children}
      </div>
    </RadioContext>
  );
}

export interface RadioGroupItemProps {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  /** Card variant: leading icon. */
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export function RadioGroupItem({ value, label, description, icon, disabled: itemDisabled, className, children }: RadioGroupItemProps) {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("<RadioGroupItem> must be rendered inside <RadioGroup>.");
  const reduce = useReducedMotion();
  const id = useId();
  const checked = ctx.value === value;
  const disabled = ctx.disabled || !!itemDisabled;
  const card = ctx.variant === "card";

  const radio = (
    <span className="relative grid size-5 shrink-0 place-items-center">
      <input
        type="radio"
        id={id}
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={ctx.required}
        aria-describedby={description ? `${id}-d` : undefined}
        onChange={() => ctx.select(value)}
        className={cn(
          "ui-radio peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-full border border-input bg-background shadow-xs outline-none",
          "transition-[border-color,box-shadow] duration-200 hover:border-primary/60 checked:border-primary",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed",
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none size-2.5 scale-0 rounded-full bg-primary transition-[scale] duration-300 ease-[cubic-bezier(.3,1.8,.5,1)] peer-checked:scale-100 motion-reduce:transition-none"
      />
      <span aria-hidden className="ui-radio-ripple pointer-events-none absolute inset-0 rounded-full bg-primary/40 opacity-0" />
    </span>
  );

  const text = (label || description || children) && (
    <span className="grid gap-0.5 text-sm leading-5">
      {label && <span className="font-medium text-foreground">{label}</span>}
      {description && (
        <span id={`${id}-d`} className="text-muted-foreground">
          {description}
        </span>
      )}
      {children}
    </span>
  );

  if (!card) {
    return (
      <label
        htmlFor={id}
        className={cn("flex cursor-pointer items-start gap-3 select-none", disabled && "cursor-not-allowed opacity-50", className)}
      >
        {radio}
        {text}
      </label>
    );
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 select-none",
        "transition-[border-color,background-color,scale] duration-200 hover:bg-muted/50 active:scale-[0.99]",
        "has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {checked && (
        <motion.span
          aria-hidden
          layoutId={ctx.indicatorId}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
          className="pointer-events-none absolute -inset-px rounded-[inherit] border-2 border-primary bg-primary/6"
        />
      )}
      {icon && (
        <span
          aria-hidden
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors duration-200 [&_svg]:size-4.5",
            checked && "bg-primary/15 text-primary",
          )}
        >
          {icon}
        </span>
      )}
      <span className="relative flex-1">{text}</span>
      <span className="relative">{radio}</span>
    </label>
  );
}
