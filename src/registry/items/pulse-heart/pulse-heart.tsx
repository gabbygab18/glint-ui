"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Heart } from "lucide-react";

export interface PulseHeartProps {
  /** Controlled liked state. */
  liked?: boolean;
  /** Initial liked state when uncontrolled. */
  defaultLiked?: boolean;
  /** Likes from everyone else. Your own like adds one on top. */
  count?: number;
  /** Called with the new liked state and the displayed count. */
  onChange?: (liked: boolean, count: number) => void;
  /** Heart and burst color. */
  color?: string;
  /** Particles per burst. */
  particles?: number;
  /** Accessible label. */
  label?: string;
  className?: string;
}

const fmt = new Intl.NumberFormat("en-US");

function Burst({ color, n }: { color: string; n: number }) {
  const tints = [color, "#fbbf24", "#a78bfa", "#fb7185"];
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      <motion.span
        className="absolute -left-5 -top-5 size-10 rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 1.9, opacity: 0, borderWidth: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const far = i % 2 ? 30 : 38;
        const size = i % 2 ? 5 : 7;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, left: -size / 2, top: -size / 2, background: tints[i % tints.length] }}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{ x: Math.cos(a) * far, y: Math.sin(a) * far, scale: [0, 1.2, 0] }}
            transition={{ duration: 0.65, ease: [0.2, 0.8, 0.3, 1], delay: 0.08 }}
          />
        );
      })}
    </span>
  );
}

export function PulseHeart({
  liked,
  defaultLiked = false,
  count = 128,
  onChange,
  color = "#f43f5e",
  particles = 10,
  label = "Like",
  className,
}: PulseHeartProps) {
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultLiked);
  const [bursts, setBursts] = useState(0);
  const on = liked ?? inner;
  const total = count + (on ? 1 : 0);
  const dir = on ? 1 : -1;
  const chars = fmt.format(total).split("").reverse(); // keyed from the right so new digits don't reshuffle

  const toggle = () => {
    const next = !on;
    if (liked === undefined) setInner(next);
    if (next) setBursts((b) => b + 1);
    onChange?.(next, count + (next ? 1 : 0));
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        aria-pressed={on}
        aria-label={`${label}, ${fmt.format(total)} likes`}
        onClick={toggle}
        whileTap={{ scale: 0.92 }}
        className={`group inline-flex h-12 select-none items-center gap-2.5 rounded-full border border-border bg-card pl-3 pr-5 text-foreground shadow-lg outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/60 ${className ?? ""}`}
      >
        <span className="relative grid size-7 place-items-center">
          {on && bursts > 0 && !reduce && <Burst key={bursts} color={color} n={particles} />}
          <motion.span
            className="relative grid place-items-center group-active:scale-75 transition-[scale] duration-150"
            initial={false}
            animate={{ scale: on ? [0.6, 1.35, 0.9, 1.05, 1] : [0.85, 1], rotate: on ? [0, -14, 8, 0] : 0 }}
            transition={{ duration: on ? 0.6 : 0.25, ease: "easeOut" }}
          >
            <Heart
              aria-hidden
              className="size-6 transition-[fill,color] duration-200"
              strokeWidth={2}
              style={{ color: on ? color : "var(--muted-foreground)", fill: on ? color : "transparent" }}
            />
          </motion.span>
        </span>
        <span aria-hidden className="flex flex-row-reverse text-sm font-semibold tabular-nums">
          {chars.map((c, i) => (
            <span key={i} className="relative inline-block h-5 overflow-hidden leading-5">
              <span className="invisible">{c}</span>
              <AnimatePresence initial={false} custom={dir}>
                <motion.span
                  key={c}
                  custom={dir}
                  className="absolute inset-0 text-center"
                  variants={{
                    enter: (d: number) => ({ y: d * 20, opacity: 0 }),
                    center: { y: 0, opacity: 1 },
                    exit: (d: number) => ({ y: d * -20, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 420, damping: 24, delay: i * 0.04 }}
                >
                  {c}
                </motion.span>
              </AnimatePresence>
            </span>
          ))}
        </span>
      </motion.button>
    </MotionConfig>
  );
}
