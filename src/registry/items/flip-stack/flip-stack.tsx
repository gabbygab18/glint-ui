"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface FlipStackProps {
  /** Card faces, top of the pile first. */
  cards: ReactNode[];
  /** Shared back face shown while a card is upside down. */
  back?: ReactNode;
  /** Card width in px. */
  width?: number;
  /** Card height in px. */
  height?: number;
  /** Px each card behind peeks out above the one in front. */
  offset?: number;
  /** Scale lost per card of depth. */
  scaleStep?: number;
  /** How many cards stay visible in the pile. */
  visible?: number;
  /** How high the card is tossed, as a fraction of its height. */
  lift?: number;
  /** Seconds for one full flip. */
  duration?: number;
  /** Accessible name for the stack. */
  label?: string;
  onChange?: (topIndex: number) => void;
  className?: string;
}

const DefaultBack = () => (
  <div
    className="grid size-full place-items-center bg-muted"
    style={{
      backgroundImage:
        "repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 7%, transparent) 0 2px, transparent 2px 12px), radial-gradient(circle at 50% 50%, color-mix(in srgb, currentColor 10%, transparent), transparent 60%)",
    }}
  >
    <span className="grid size-14 place-items-center rounded-full border border-border bg-card text-lg font-semibold text-muted-foreground">✦</span>
  </div>
);

/**
 * A pile of cards. Clicking (or Enter/Space/→) tosses the top card up, flips it over
 * end-to-end and drops it behind the pile while the rest step forward.
 */
export function FlipStack({
  cards,
  back,
  width = 240,
  height = 300,
  offset = 16,
  scaleStep = 0.06,
  visible = 3,
  lift = 0.4,
  duration = 0.9,
  label = "Card stack",
  onChange,
  className,
}: FlipStackProps) {
  const n = cards.length;
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  // Whole turns each card has made, so rotation keeps increasing instead of unwinding.
  const [turns, setTurns] = useState<number[]>(() => cards.map(() => 0));
  const [tossing, setTossing] = useState<number | null>(null);
  const reduce = useReducedMotion();

  // Keep state valid if the number of cards changes.
  const pile = order.length === n ? order : cards.map((_, i) => i);

  const land = (card: number) => {
    const next = [...pile.slice(1), card];
    setOrder(next);
    setTurns((t) => cards.map((_, i) => (t[i] ?? 0) + (i === card ? 1 : 0)));
    setTossing(null);
    onChange?.(next[0]);
  };

  const flip = () => {
    if (n < 2 || tossing !== null) return;
    if (reduce) land(pile[0]);
    else setTossing(pile[0]);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      flip();
    }
  };

  const face = "absolute inset-0 overflow-hidden rounded-[inherit] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label}: card ${pile[0] + 1} of ${n}. Press to flip to the next card.`}
      onClick={flip}
      onKeyDown={onKey}
      className={`relative cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background ${className ?? ""}`}
      style={{ width, height, perspective: 1400 }}
    >
      {cards.map((card, i) => {
        const pos = pile.indexOf(i);
        const up = tossing === i;
        const depth = Math.min(pos, visible);
        const tilt = pos === 0 ? 0 : (i % 2 ? 1.6 : -1.6) * Math.min(pos, 2);
        const rest = (turns[i] ?? 0) * 360;
        return (
          <motion.div
            key={i}
            aria-hidden={pos !== 0}
            initial={false}
            animate={
              up
                ? { y: -height * lift, rotateX: rest + 180, rotate: -4, scale: 1.04, opacity: 1 }
                : { y: -depth * offset, rotateX: rest, rotate: tilt, scale: 1 - depth * scaleStep, opacity: pos < visible ? 1 : 0 }
            }
            transition={
              up
                ? { duration: duration * 0.45, ease: [0.3, 0.6, 0.35, 1] }
                : { type: "spring", duration: duration * 0.7, bounce: 0.25, opacity: { duration: 0.2 } }
            }
            onAnimationComplete={() => {
              if (up) land(i);
            }}
            className="absolute inset-0 rounded-2xl shadow-[0_20px_40px_-18px_rgba(0,0,0,.75)]"
            style={{ zIndex: up ? n + 1 : n - pos, transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
          >
            <div className={face}>{card}</div>
            <div className={face} style={{ transform: "rotateX(180deg)" }}>
              {back ?? <DefaultBack />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
