"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export interface StrengthRule {
  label: string;
  test: (value: string) => boolean;
}

export interface StrengthFieldProps {
  label?: string;
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Rules that each add one step to the meter. */
  rules?: StrengthRule[];
  /** List the rules under the meter with a check per rule met. */
  showRules?: boolean;
  name?: string;
  className?: string;
}

export const defaultRules: StrengthRule[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Upper and lower case", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const LEVELS = [
  { word: "Too weak", color: "#ef4444" },
  { word: "Weak", color: "#f97316" },
  { word: "Okay", color: "#eab308" },
  { word: "Strong", color: "#22c55e" },
  { word: "Great", color: "#10b981" },
];

/**
 * A password field with a segmented strength meter: each rule met fills one
 * more segment, the color warms toward green, and the verdict word rolls over.
 */
export function StrengthField({
  label = "Password",
  value,
  defaultValue = "",
  onChange,
  placeholder = "Create a password",
  rules = defaultRules,
  showRules = true,
  name,
  className,
}: StrengthFieldProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const [visible, setVisible] = useState(false);
  const text = value ?? inner;
  const passed = rules.map((r) => r.test(text));
  const score = passed.filter(Boolean).length;
  const level = LEVELS[Math.round((score / Math.max(1, rules.length)) * (LEVELS.length - 1))];

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setInner(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("grid gap-2", className)}>
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={name}
            type={visible ? "text" : "password"}
            value={text}
            onChange={change}
            placeholder={placeholder}
            autoComplete="new-password"
            aria-describedby={`${id}-meter`}
            className="h-10 w-full rounded-lg border border-border bg-background pl-3 pr-10 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-1 top-1 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={visible ? "hide" : "show"}
                initial={{ opacity: 0, scale: 0.5, rotate: -30, filter: "blur(3px)" }}
                animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.5, rotate: 30, filter: "blur(3px)" }}
                transition={{ duration: 0.2 }}
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div id={`${id}-meter`} className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden>
            {rules.map((_, i) => (
              <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className="block h-full origin-left rounded-full"
                  initial={false}
                  animate={{ scaleX: i < score ? 1 : 0, backgroundColor: level.color }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4, delay: i < score ? i * 0.04 : 0 }}
                />
              </span>
            ))}
          </div>
          <span className="relative w-16 overflow-hidden text-right text-xs font-medium" aria-live="polite">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={text ? level.word : "empty"}
                className="block"
                style={{ color: text ? level.color : undefined }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {text ? level.word : " "}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {showRules && (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {rules.map((r, i) => (
              <li key={r.label} className={cn("flex items-center gap-1.5 text-xs transition-colors", passed[i] ? "text-foreground" : "text-muted-foreground")}>
                <span
                  className={cn(
                    "grid size-3.5 shrink-0 place-items-center rounded-full border transition-colors",
                    passed[i] ? "border-transparent bg-emerald-500 text-white" : "border-border",
                  )}
                >
                  <motion.span initial={false} animate={{ scale: passed[i] ? 1 : 0 }} transition={{ type: "spring", bounce: 0.5, duration: 0.35 }}>
                    <Check className="size-2.5" strokeWidth={3.5} />
                  </motion.span>
                </span>
                {r.label}
                <span className="sr-only">{passed[i] ? "(met)" : "(not met)"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MotionConfig>
  );
}
