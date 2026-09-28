"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface CardSwapProps {
  cards: ReactNode[];
  /** Card width in px. */
  width?: number;
  /** Card height in px. */
  height?: number;
  /** Horizontal px between stacked cards. */
  distanceX?: number;
  /** Vertical px between stacked cards. */
  distanceY?: number;
  /** Skew of the stack in degrees. */
  skew?: number;
  /** Ms between swaps. */
  delay?: number;
  pauseOnHover?: boolean;
  /** `elastic` overshoots, `smooth` glides. */
  easing?: "elastic" | "smooth";
  className?: string;
}

export function CardSwap({
  cards,
  width = 340,
  height = 240,
  distanceX = 56,
  distanceY = 56,
  skew = 6,
  delay = 3500,
  pauseOnHover = true,
  easing = "elastic",
  className,
}: CardSwapProps) {
  const n = cards.length;
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [dropping, setDropping] = useState(false);
  const paused = useRef(false);
  const busy = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();
  const safeOrder = order.length === n ? order : cards.map((_, i) => i);
  const dropMs = easing === "elastic" ? 650 : 500;

  const swap = useCallback(() => {
    if (busy.current || n < 2) return;
    busy.current = true;
    setDropping(true);
    timer.current = window.setTimeout(() => {
      setOrder((o) => (o.length === n ? [...o.slice(1), o[0]] : o));
      setDropping(false);
      busy.current = false;
    }, dropMs);
  }, [n, dropMs]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => !paused.current && swap(), delay);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timer.current);
      busy.current = false;
    };
  }, [delay, swap, reduce]);

  const spring =
    easing === "elastic"
      ? { type: "spring" as const, stiffness: 170, damping: 13, mass: 1 }
      : { type: "spring" as const, stiffness: 120, damping: 22 };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Card stack. Press Enter or Right arrow for the next card."
      tabIndex={0}
      onPointerEnter={() => (paused.current = pauseOnHover)}
      onPointerLeave={() => (paused.current = false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          swap();
        }
      }}
      className={`relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
      style={{ width: width + distanceX * (n - 1), height: height + distanceY * (n - 1), perspective: 1100 }}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {safeOrder.map((card, slot) => {
          const falling = dropping && slot === 0;
          return (
            <motion.div
              key={card}
              aria-hidden={slot !== 0 || undefined}
              className="absolute bottom-0 left-0 overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)]"
              style={{ width, height, zIndex: n - slot, transformOrigin: "50% 50%" }}
              initial={false}
              animate={{
                x: slot * distanceX,
                y: falling ? height * 2.2 : -slot * distanceY,
                z: -slot * distanceX * 1.4,
                skewY: skew,
                rotateZ: falling ? 4 : 0,
              }}
              transition={
                falling
                  ? { duration: dropMs / 1000, ease: [0.55, 0, 0.8, 0.3] }
                  : { ...spring, delay: dropping ? 0 : slot === n - 1 ? 0.25 : slot * 0.08 }
              }
            >
              {cards[card]}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
