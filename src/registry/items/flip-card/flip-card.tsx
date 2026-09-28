"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { MotionConfig, motion, useAnimate } from "motion/react";

export interface FlipCardProps {
  /** Front face content (the prompt). */
  front?: ReactNode;
  /** Back face content (the answer). */
  back?: ReactNode;
  /** Small caption on the front. */
  frontLabel?: string;
  /** Small caption on the back. */
  backLabel?: string;
  /** Controlled flipped state. */
  flipped?: boolean;
  /** Initial state when uncontrolled. */
  defaultFlipped?: boolean;
  /** Called with the new state on every flip. */
  onFlip?: (flipped: boolean) => void;
  /** Accent color of the back face. */
  color?: string;
  className?: string;
}

const turn = { type: "spring", stiffness: 170, damping: 15, mass: 1 } as const;

export function FlipCard({
  front = "What does the “C” in CSS stand for?",
  back = "Cascading. Later rules win when specificity ties.",
  frontLabel = "Question",
  backLabel = "Answer",
  flipped,
  defaultFlipped = false,
  onFlip,
  color = "#818cf8",
  className,
}: FlipCardProps) {
  // Accumulated angle, so the card keeps turning the way it was pushed instead of unwinding.
  const [angle, setAngle] = useState(defaultFlipped ? 180 : 0);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const showing = Math.abs(Math.round(angle / 180)) % 2 === 1;

  // Controlled: follow the prop (adjust-state-during-render pattern).
  if (flipped !== undefined && flipped !== showing) setAngle((a) => a + 180);

  const flip = (dir: 1 | -1) => {
    setAngle((a) => a + dir * 180);
    onFlip?.(!showing);
    // Lift off the table mid-turn and land with a little squash; the shadow shrinks as it rises.
    animate("[data-lift]", { y: [0, -18, 0], scale: [1, 1.05, 0.98, 1] }, { duration: 0.6, times: [0, 0.4, 0.8, 1], ease: "easeOut" });
    animate("[data-shadow]", { scaleX: [1, 0.7, 1.04, 1], opacity: [0.55, 0.2, 0.6, 0.55] }, { duration: 0.6, times: [0, 0.4, 0.8, 1] });
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Flip toward the side that was pushed; keyboard (detail 0) always turns right.
    const r = e.currentTarget.getBoundingClientRect();
    flip(e.detail > 0 && e.clientX < r.left + r.width / 2 ? -1 : 1);
  };

  const face =
    "absolute inset-0 flex flex-col rounded-2xl border p-5 text-left [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <MotionConfig reducedMotion="user">
      <div ref={scope} className={`relative h-44 w-72 [perspective:900px] ${className ?? ""}`}>
        <span
          data-shadow
          aria-hidden
          className="absolute inset-x-6 -bottom-4 h-6 rounded-[50%] bg-black blur-xl"
          style={{ opacity: 0.55 }}
        />
        <div data-lift className="relative size-full [transform-style:preserve-3d]">
          <motion.button
            type="button"
            aria-pressed={showing}
            onClick={onClick}
            initial={false}
            animate={{ rotateY: angle }}
            transition={turn}
            whileTap={{ scale: 0.97 }}
            className="group relative size-full rounded-2xl outline-none [transform-style:preserve-3d] focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <span aria-hidden={showing} className={`${face} border-border bg-card text-foreground`}>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{frontLabel}</span>
              <span className="my-auto text-lg font-semibold leading-snug">{front}</span>
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">Tap to flip</span>
            </span>
            <span
              aria-hidden={!showing}
              className={`${face} text-foreground`}
              style={{
                transform: "rotateY(180deg)",
                borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
                background: `linear-gradient(145deg, color-mix(in oklab, ${color} 22%, var(--card)), var(--card))`,
              }}
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color }}>
                {backLabel}
              </span>
              <span className="my-auto text-lg font-semibold leading-snug">{back}</span>
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">Tap to flip back</span>
            </span>
          </motion.button>
        </div>
      </div>
    </MotionConfig>
  );
}
