"use client";

import { useState, type KeyboardEvent } from "react";
import { MotionConfig, motion } from "motion/react";

export interface PeekRatingProps {
  /** Controlled rating, 0 to `max`. */
  value?: number;
  /** Initial rating when uncontrolled. */
  defaultValue?: number;
  /** Number of stars. */
  max?: number;
  /** Called with the new rating. */
  onChange?: (value: number) => void;
  /** One word per star, shown under the row. */
  labels?: string[];
  /** Star fill color. */
  color?: string;
  /** Color of the peeking character. */
  characterColor?: string;
  /** Accessible name of the rating. */
  label?: string;
  className?: string;
}

const STAR = "M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2L2.9 9.4l6.3-.9z";
const pop = { type: "spring", stiffness: 520, damping: 14 } as const;
const peek = { type: "spring", stiffness: 260, damping: 13 } as const;

export function PeekRating({
  value,
  defaultValue = 0,
  max = 5,
  onChange,
  labels = ["Awful", "Meh", "Okay", "Good", "Love it!"],
  color = "#facc15",
  characterColor = "#fb923c",
  label = "Rating",
  className,
}: PeekRatingProps) {
  const [inner, setInner] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const current = value ?? inner;
  const shown = hover ?? current;
  const mood = shown / max; // 0 sad .. 1 delighted

  const set = (v: number) => {
    const next = Math.max(0, Math.min(max, v));
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      Home: 0,
      End: max,
    };
    const next = e.key in map ? map[e.key] : /^\d$/.test(e.key) ? Number(e.key) : null;
    if (next === null) return;
    e.preventDefault();
    set(next);
  };

  const word = shown === 0 ? "Rate it" : (labels[Math.round(mood * labels.length) - 1] ?? `${shown}/${max}`);
  // Mouth: frown -> grin. Brows: worried -> raised. Eyes squint shut when delighted.
  const curve = -9 + mood * 22;
  const brow = shown === 0 ? 0 : 18 * (1 - mood); // inner ends lift when sad
  const happy = mood >= 0.8;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative inline-flex flex-col items-center pt-[4.5rem] ${className ?? ""}`}>
        {/* The character lives in a clipped strip above the card and peeks over its edge. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[5.25rem] overflow-hidden">
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute bottom-0 left-1/2 size-20 -translate-x-1/2"
            initial={false}
            animate={{ y: 28 - mood * 28 + (shown === 0 ? 5 : 0), rotate: (mood - 0.5) * 8 }}
            transition={peek}
          >
            <circle cx="22" cy="20" r="9" fill={characterColor} />
            <circle cx="78" cy="20" r="9" fill={characterColor} />
            <rect x="8" y="12" width="84" height="110" rx="42" fill={characterColor} />
            <motion.g initial={false} animate={{ x: (mood - 0.5) * 6 }} transition={peek}>
              <motion.line
                x1="29" y1="31" x2="43" y2="31" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round"
                initial={false} animate={{ rotate: -brow, y: happy ? -3 : 0 }} transition={peek}
              />
              <motion.line
                x1="57" y1="31" x2="71" y2="31" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round"
                initial={false} animate={{ rotate: brow, y: happy ? -3 : 0 }} transition={peek}
              />
              <motion.ellipse cx="36" cy="44" rx="5" fill="#1c1917" initial={false} animate={{ ry: happy ? 1.8 : 6 }} transition={pop} />
              <motion.ellipse cx="64" cy="44" rx="5" fill="#1c1917" initial={false} animate={{ ry: happy ? 1.8 : 6 }} transition={pop} />
            </motion.g>
            <motion.circle cx="24" cy="58" r="7" fill="#f43f5e" initial={false} animate={{ opacity: mood > 0.55 ? 0.45 : 0 }} />
            <motion.circle cx="76" cy="58" r="7" fill="#f43f5e" initial={false} animate={{ opacity: mood > 0.55 ? 0.45 : 0 }} />
            <motion.path
              stroke="#1c1917"
              strokeWidth="4"
              strokeLinecap="round"
              fill={happy ? "#7f1d1d" : "none"}
              initial={false}
              animate={{ d: `M38 62 Q50 ${62 + curve} 62 62` }}
              transition={peek}
            />
          </motion.svg>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={current === 0 ? "No rating" : `${current} of ${max} stars`}
          onKeyDown={onKey}
          onPointerLeave={() => setHover(null)}
          className="relative z-10 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-5 pb-3 pt-4 shadow-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          <div className="flex gap-1">
            {Array.from({ length: max }, (_, i) => {
              const lit = i < shown;
              return (
                <motion.svg
                  key={i}
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-9 cursor-pointer"
                  onPointerEnter={() => setHover(i + 1)}
                  onClick={() => set(current === i + 1 ? 0 : i + 1)}
                  initial={false}
                  animate={{ scale: lit ? 1.12 : 1, rotate: lit ? (i % 2 ? 8 : -8) : 0, y: lit && hover !== null ? -2 : 0 }}
                  whileTap={{ scale: 0.8 }}
                  transition={{ ...pop, delay: lit ? i * 0.03 : 0 }}
                >
                  <path
                    d={STAR}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    style={{
                      fill: lit ? color : "transparent",
                      stroke: lit ? color : "var(--muted-foreground)",
                      transition: "fill .15s, stroke .15s",
                    }}
                  />
                </motion.svg>
              );
            })}
          </div>
          <span aria-hidden className="h-4 text-xs font-medium text-muted-foreground">
            {word}
          </span>
        </div>
      </div>
    </MotionConfig>
  );
}
