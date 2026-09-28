"use client";

import { Fragment, useRef, useState, type InputHTMLAttributes, type Ref } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes ui-otp-pop{0%{opacity:0;scale:.4;translate:0 6px;filter:blur(4px)}60%{opacity:1;scale:1.15;filter:blur(0)}100%{scale:1;translate:0 0}}
@keyframes ui-otp-blink{0%,45%{opacity:1}55%,100%{opacity:0}}
@keyframes ui-otp-wave{0%,100%{translate:0 0}40%{translate:0 -6px}}
@keyframes ui-otp-shake{0%,100%{translate:0}20%{translate:-6px}40%{translate:5px}60%{translate:-3px}80%{translate:2px}}
.ui-otp-char{animation:ui-otp-pop .32s cubic-bezier(.2,.9,.3,1.2) both}
.ui-otp-caret{animation:ui-otp-blink 1s steps(1) infinite}
.ui-otp[data-complete] .ui-otp-slot{animation:ui-otp-wave .45s cubic-bezier(.3,1.4,.5,1) calc(var(--i)*45ms) both}
.ui-otp[data-invalid]{animation:ui-otp-shake .4s cubic-bezier(.36,.07,.19,.97)}
@media (prefers-reduced-motion:reduce){.ui-otp-char,.ui-otp[data-complete] .ui-otp-slot,.ui-otp[data-invalid]{animation:none}}
`;

const ALLOW = { numeric: /[^0-9]/g, alphanumeric: /[^a-zA-Z0-9]/g };

export interface InputOTPProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "maxLength" | "size" | "pattern"> {
  /** Number of slots. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called once every slot is filled. */
  onComplete?: (value: string) => void;
  /** Characters accepted; everything else is dropped (also from pasted text). */
  allow?: "numeric" | "alphanumeric";
  /** Draw a separator after every N slots (0 = none). */
  groupSize?: number;
  /** Error look + shake. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function InputOTP({
  length = 6,
  value: valueProp,
  defaultValue = "",
  onChange,
  onComplete,
  allow = "numeric",
  groupSize = 3,
  invalid = false,
  disabled,
  className,
  onFocus,
  onBlur,
  ref,
  ...props
}: InputOTPProps) {
  const [inner, setInner] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const value = (valueProp ?? inner).slice(0, length);
  const complete = value.length === length;
  const active = focused ? Math.min(value.length, length - 1) : -1;

  const setRefs = (el: HTMLInputElement | null) => {
    input.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  const change = (raw: string) => {
    const next = raw.replace(ALLOW[allow], "").slice(0, length);
    if (next === value) return;
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  };

  // One real <input> sits on top of the slots: native typing, paste, autofill
  // (autocomplete="one-time-code") and backspace for free. The caret is pinned
  // to the end so slots always fill left to right.
  const pinCaret = () => {
    const el = input.current;
    if (el && document.activeElement === el) el.setSelectionRange(el.value.length, el.value.length);
  };

  const slots = Array.from({ length }, (_, i) => i);

  return (
    <div
      data-complete={complete || undefined}
      data-invalid={invalid || undefined}
      className={cn("ui-otp relative inline-flex items-center gap-2", disabled && "opacity-50", className)}
    >
      <style href="ui-input-otp" precedence="default">
        {css}
      </style>
      {slots.map((i) => {
        const char = value[i];
        const isActive = i === active;
        return (
          <Fragment key={i}>
            {groupSize > 0 && i > 0 && i % groupSize === 0 && (
              <span aria-hidden className="h-0.5 w-3 rounded-full bg-muted-foreground/40" />
            )}
            <div
              aria-hidden
              style={{ ["--i" as string]: i }}
              className={cn(
                "ui-otp-slot relative grid h-12 w-10 place-items-center rounded-lg border border-input bg-background text-lg font-semibold text-foreground shadow-xs sm:h-14 sm:w-12 sm:text-xl",
                "transition-[border-color,box-shadow,scale] duration-200 ease-[cubic-bezier(.3,1.5,.5,1)] motion-reduce:transition-none",
                char && "border-foreground/25",
                isActive && "z-1 scale-105 border-ring shadow-[0_0_0_3px_color-mix(in_oklab,var(--ring)_28%,transparent)]",
                complete && !invalid && "border-primary/70",
                invalid && "border-destructive/80 text-destructive",
              )}
            >
              {char ? (
                <span key={char} className="ui-otp-char">
                  {char}
                </span>
              ) : (
                isActive && <span className="ui-otp-caret h-6 w-0.5 rounded-full bg-foreground" />
              )}
            </div>
          </Fragment>
        );
      })}
      <input
        aria-label="One-time code"
        {...props}
        ref={setRefs}
        value={value}
        disabled={disabled}
        maxLength={length}
        inputMode={allow === "numeric" ? "numeric" : "text"}
        autoComplete="one-time-code"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        onChange={(e) => change(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
          requestAnimationFrame(pinCaret);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onSelect={pinCaret}
        className="absolute inset-0 z-10 w-full cursor-text bg-transparent text-base text-transparent caret-transparent outline-none! selection:bg-transparent disabled:cursor-not-allowed"
      />
    </div>
  );
}
