"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type Billing = "monthly" | "yearly";

export interface PriceToggleProps {
  /** Price per month when billed monthly. */
  monthly: number;
  /** Price per month when billed yearly. */
  yearly: number;
  currency?: string;
  /** Controlled billing period. */
  value?: Billing;
  defaultValue?: Billing;
  onChange?: (billing: Billing) => void;
  /** Badge on the yearly option. Defaults to the computed saving, e.g. "−20%". */
  badge?: string;
  className?: string;
}

/**
 * A monthly / yearly switch for pricing. The thumb slides between the two
 * periods and every digit of the price rolls to its new value, up when the
 * price rises and down when it drops.
 */
export function PriceToggle({
  monthly,
  yearly,
  currency = "$",
  value,
  defaultValue = "monthly",
  onChange,
  badge,
  className,
}: PriceToggleProps) {
  const thumbId = useId();
  const [inner, setInner] = useState<Billing>(defaultValue);
  const billing = value ?? inner;
  const price = billing === "yearly" ? yearly : monthly;
  // Remember the last price to know which way the digits should roll.
  const [last, setLast] = useState({ price, dir: 1 });
  if (last.price !== price) setLast({ price, dir: price > last.price ? 1 : -1 });
  const dir = last.price !== price ? (price > last.price ? 1 : -1) : last.dir;
  const saving = badge ?? (monthly > 0 ? `−${Math.round((1 - yearly / monthly) * 100)}%` : "");
  const digits = String(price).split("");

  const set = (b: Billing) => {
    if (value === undefined) setInner(b);
    onChange?.(b);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("grid justify-items-center gap-5", className)}>
        <div role="radiogroup" aria-label="Billing period" className="relative flex rounded-full border border-border bg-muted/60 p-1">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => set(b)}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                  e.preventDefault();
                  set(b === "monthly" ? "yearly" : "monthly");
                  (e.currentTarget.parentElement?.querySelector(`[aria-checked="false"]`) as HTMLElement | null)?.focus();
                }
              }}
              tabIndex={billing === b ? 0 : -1}
              className={cn(
                "relative z-10 flex h-8 items-center gap-1.5 rounded-full px-4 text-sm font-medium capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                billing === b ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {billing === b && (
                <motion.span
                  layoutId={thumbId}
                  className="absolute inset-0 -z-10 rounded-full bg-card shadow-sm"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}
              {b}
              {b === "yearly" && saving && (
                <motion.span
                  className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground"
                  animate={billing === "yearly" ? { scale: [1, 1.25, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {saving}
                </motion.span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-start gap-1 text-foreground">
          <span className="mt-2 text-2xl font-semibold text-muted-foreground">{currency}</span>
          <span className="sr-only">
            {currency}
            {price} per month, billed {billing}
          </span>
          <span aria-hidden className="flex overflow-hidden text-6xl font-bold tabular-nums leading-none tracking-tight">
            {digits.map((d, i) => (
              // Keyed by place value from the right, so only changed digits roll.
              <span key={digits.length - i} className="relative inline-block">
                <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                  <motion.span
                    key={d}
                    custom={dir}
                    className="inline-block"
                    variants={{
                      enter: (s: number) => ({ y: `${s * 100}%`, opacity: 0, filter: "blur(4px)" }),
                      center: { y: "0%", opacity: 1, filter: "blur(0px)" },
                      exit: (s: number) => ({ y: `${s * -100}%`, opacity: 0, filter: "blur(4px)" }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.45, delay: i * 0.04 }}
                  >
                    {d}
                  </motion.span>
                </AnimatePresence>
              </span>
            ))}
          </span>
          <span className="mt-auto pb-1.5 text-sm text-muted-foreground">/mo</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={billing}
            className="-mt-2 text-xs text-muted-foreground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {billing === "yearly" ? `${currency}${yearly * 12} billed once a year` : "Billed every month, cancel anytime"}
          </motion.p>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
