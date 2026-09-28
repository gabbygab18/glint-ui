"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "size"> {
  /** Floating label. Sits inside the field and lifts on focus or when filled. */
  label: string;
  value?: string;
  defaultValue?: string;
  /** Fires with the new value on typing and on clear. */
  onValueChange?: (value: string) => void;
  /** Helper text under the field. Replaced by `error` when set. */
  hint?: ReactNode;
  /** Error message. Setting (or changing) it shakes the field. */
  error?: string;
  /** Show the x button when the field has a value. */
  clearable?: boolean;
  /** Show "used / maxLength" with a progress ring. Needs `maxLength`. */
  showCounter?: boolean;
  /** Icon at the start of the field. */
  icon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function InteractiveInput({
  label,
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  onFocus,
  onBlur,
  hint,
  error,
  clearable = true,
  showCounter = true,
  maxLength,
  icon,
  disabled,
  className,
  id,
  ref,
  ...props
}: InteractiveInputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current!, []);
  const reduce = useReducedMotion();
  const shake = useAnimationControls();
  const [own, setOwn] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const val = value ?? own;
  const floated = focused || val.length > 0;

  useEffect(() => {
    if (error && !reduce) shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.38 } });
  }, [error, reduce, shake]);

  const update = (v: string) => {
    if (value === undefined) setOwn(v);
    onValueChange?.(v);
  };

  const counter = showCounter && maxLength ? val.length / maxLength : null;
  const counterColor = counter === null ? "" : counter >= 1 ? "#ef4444" : counter >= 0.85 ? "#f59e0b" : "currentColor";
  const describedBy = [error ? `${inputId}-err` : hint ? `${inputId}-hint` : "", counter !== null ? `${inputId}-count` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        animate={shake}
        className={cn(
          "group relative flex h-14 items-center rounded-xl border bg-background/60 shadow-xs transition-[border-color,background-color] duration-200",
          error ? "border-destructive" : "border-input hover:border-foreground/25 focus-within:border-ring",
          focused && "bg-background",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {/* focus ring: grows out of the border and fades in */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 ring-4 transition-[opacity,scale] duration-300 ease-out motion-reduce:transition-none",
            "scale-[0.97] group-focus-within:scale-100 group-focus-within:opacity-100",
            error ? "ring-destructive/20" : "ring-ring/25",
          )}
        />
        {/* underline sweep from the centre */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-4 -bottom-px h-0.5 origin-center scale-x-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-focus-within:scale-x-100 motion-reduce:transition-none",
            error ? "bg-destructive" : "bg-ring",
          )}
        />

        {icon && (
          <span
            aria-hidden
            className={cn(
              "ml-3.5 grid size-5 shrink-0 place-items-center transition-colors [&_svg]:size-4.5",
              error ? "text-destructive" : focused ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {icon}
          </span>
        )}

        <div className="relative h-full min-w-0 flex-1">
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-3.5 origin-left truncate transition-[top,translate,scale,color] duration-200 ease-out motion-reduce:transition-none",
              floated ? "top-2 translate-y-0 scale-[0.78] font-medium" : "top-1/2 -translate-y-1/2 scale-100",
              error ? "text-destructive" : focused ? "text-foreground" : "text-muted-foreground",
              "right-2 text-sm",
            )}
          >
            {label}
          </label>
          <input
            {...props}
            ref={inner}
            id={inputId}
            value={val}
            maxLength={maxLength}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy || undefined}
            onChange={(e) => {
              update(e.target.value);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "size-full bg-transparent px-3.5 pt-5 pb-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60",
              "placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:transition-opacity",
            )}
          />
        </div>

        <AnimatePresence initial={false}>
          {clearable && val && !disabled && (
            <motion.button
              type="button"
              aria-label={`Clear ${label}`}
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => {
                update("");
                inner.current?.focus();
              }}
              className="mr-1.5 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <X className="size-3.5" strokeWidth={2.5} aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>

        {counter !== null && (
          <span className="mr-3 flex shrink-0 items-center gap-1.5 text-muted-foreground" style={{ color: counter >= 0.85 ? counterColor : undefined }}>
            <svg viewBox="0 0 20 20" className="size-4.5 -rotate-90" aria-hidden>
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth="2.5" />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke={counterColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${Math.min(1, counter) * 100} 100`}
                className="transition-[stroke-dasharray,stroke] duration-300"
              />
            </svg>
            <span id={`${inputId}-count`} className="text-xs tabular-nums">
              <span className="sr-only">Characters used: </span>
              {val.length}/{maxLength}
            </span>
          </span>
        )}
      </motion.div>

      <AnimatePresence initial={false} mode="popLayout">
        {error ? (
          <motion.p
            key="e"
            id={`${inputId}-err`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-destructive"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="h"
            id={`${inputId}-hint`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 px-1 text-xs text-muted-foreground"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
