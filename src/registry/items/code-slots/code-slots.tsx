"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, MotionConfig, motion, useAnimate } from "motion/react";

export interface CodeSlotsProps {
  /** Number of digits. */
  length?: number;
  /** Called with the full code. Return (or resolve) true for success, false to shake and clear. */
  onComplete?: (code: string) => boolean | void | Promise<boolean | void>;
  /** Called on every change with the digits typed so far. */
  onChange?: (code: string) => void;
  /** Glow color on success. */
  successColor?: string;
  /** Border color on a wrong code. */
  errorColor?: string;
  /** Accessible label of the input. */
  label?: string;
  autoFocus?: boolean;
  className?: string;
}

type Status = "idle" | "checking" | "error" | "success";

const H = 64; // slot height == reel cell height (px)
const REEL = Array.from({ length: 20 }, (_, i) => i % 10);
const css = `
@keyframes code-slots-caret{0%,45%{opacity:1}55%,100%{opacity:0}}
@keyframes code-slots-pulse{0%,100%{opacity:.55}50%{opacity:1}}`;

export function CodeSlots({
  length = 6,
  onComplete,
  onChange,
  successColor = "#22c55e",
  errorColor = "#ef4444",
  label = "Verification code",
  autoFocus,
  className,
}: CodeSlotsProps) {
  // `from` = how many digits existed before the last change, so pasted digits roll in staggered.
  const [{ value, from }, setState] = useState({ value: "", from: 0 });
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  const check = async (code: string) => {
    if (!onComplete) return;
    setStatus("checking");
    const ok = await onComplete(code);
    if (ok === true) {
      setStatus("success");
      return;
    }
    if (ok === false) {
      setStatus("error");
      await animate(scope.current, { x: [0, -14, 12, -9, 7, -4, 2, 0] }, { duration: 0.5, ease: "easeOut", delay: 0.35 });
      setState((s) => ({ value: "", from: s.value.length }));
      setStatus("idle");
      input.current?.focus();
      return;
    }
    setStatus("idle");
  };

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    if (status === "checking" || status === "success") return;
    const next = e.target.value.replace(/\D/g, "").slice(0, length);
    setState({ value: next, from: value.length });
    if (status === "error") setStatus("idle");
    onChange?.(next);
    if (next.length === length && next !== value) void check(next);
  };

  const tone = status === "success" ? successColor : status === "error" ? errorColor : undefined;
  const half = length >= 6 && length % 2 === 0 ? length / 2 : -1;

  return (
    <MotionConfig reducedMotion="user">
      <style href="code-slots" precedence="default">
        {css}
      </style>
      <div className={`relative inline-flex ${className ?? ""}`}>
        <div ref={scope} className="flex items-center gap-2" aria-hidden>
          {Array.from({ length }, (_, i) => {
            const ch = value[i];
            const active = focused && status === "idle" && i === Math.min(value.length, length - 1) && !(value.length === length);
            return (
              <div key={i} className="contents">
                {i === half && <span className="mx-1 h-0.5 w-3 rounded-full bg-border" />}
                <motion.div
                  className="relative w-12 overflow-hidden rounded-xl border bg-card text-foreground transition-[border-color,box-shadow] duration-300"
                  style={{
                    height: H,
                    borderColor: tone ?? (active ? "var(--ring)" : "var(--border)"),
                    boxShadow: tone
                      ? `0 0 0 1px ${tone}, 0 0 26px -6px ${tone}`
                      : active
                        ? "0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)"
                        : "inset 0 1px 2px rgb(0 0 0/.12)",
                    maskImage: "linear-gradient(transparent, #000 22%, #000 78%, transparent)",
                    animation: status === "checking" ? `code-slots-pulse 1s ${i * 0.08}s ease-in-out infinite` : undefined,
                  }}
                  animate={status === "success" ? { y: [0, -10, 0], scale: [1, 1.06, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: status === "success" ? i * 0.06 : 0, ease: "easeOut" }}
                >
                  <AnimatePresence initial={false}>
                    {ch !== undefined && (
                      <motion.div
                        key={`${i}-${ch}`}
                        className="absolute inset-x-0 top-0"
                        initial={{ y: 0, filter: "blur(3px)" }}
                        animate={{ y: -(10 + Number(ch)) * H, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)", transition: { duration: 0.18 } }}
                        transition={{
                          y: { type: "spring", stiffness: 70, damping: 11, mass: 0.9, delay: Math.max(0, i - from) * 0.07 },
                          filter: { duration: 0.6, delay: Math.max(0, i - from) * 0.07 },
                        }}
                      >
                        {REEL.map((d, k) => (
                          <span
                            key={k}
                            className="grid place-items-center text-3xl font-semibold tabular-nums"
                            style={{ height: H, color: k === 10 + Number(ch) && tone ? tone : undefined }}
                          >
                            {d}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {active && ch === undefined && (
                    <span
                      className="absolute left-1/2 top-1/2 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                      style={{ animation: "code-slots-caret 1s step-end infinite" }}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
        <input
          ref={input}
          id={id}
          value={value}
          onChange={handle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSelect={(e) => {
            const el = e.currentTarget;
            el.setSelectionRange(el.value.length, el.value.length);
          }}
          readOnly={status === "success"}
          autoFocus={autoFocus}
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="\d*"
          maxLength={length}
          aria-label={`${label}, ${length} digits`}
          aria-invalid={status === "error"}
          spellCheck={false}
          className="absolute inset-0 cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent"
        />
        <span className="sr-only" aria-live="polite">
          {status === "checking" ? "Checking code" : status === "error" ? "Wrong code, try again" : status === "success" ? "Code verified" : ""}
        </span>
      </div>
    </MotionConfig>
  );
}
