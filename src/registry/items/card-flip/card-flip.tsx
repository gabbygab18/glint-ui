"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

export interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  /** Flip on hover (and focus) or on click. Enter/Space always toggle. */
  trigger?: "hover" | "click";
  /** Axis to flip around. */
  direction?: "horizontal" | "vertical";
  /** Flip duration in ms. */
  duration?: number;
  /** Card width in px. */
  width?: number;
  /** Card height in px. */
  height?: number;
  /** Accessible name for the toggle. Defaults to the visible face text. */
  label?: string;
  className?: string;
}

export function CardFlip({
  front,
  back,
  trigger = "hover",
  direction = "horizontal",
  duration = 700,
  width = 280,
  height = 380,
  label,
  className,
}: CardFlipProps) {
  const [flipped, setFlipped] = useState(false);
  const [hover, setHover] = useState(false);
  const on = trigger === "hover" ? hover !== flipped : flipped;
  const axis = direction === "horizontal" ? "rotateY" : "rotateX";

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  };

  const face = "absolute inset-0 overflow-hidden rounded-[inherit] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={on}
      aria-label={label}
      onClick={trigger === "click" ? () => setFlipped((f) => !f) : undefined}
      onKeyDown={onKey}
      onPointerEnter={trigger === "hover" ? () => setHover(true) : undefined}
      onPointerLeave={trigger === "hover" ? () => setHover(false) : undefined}
      className={`group relative cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background ${className ?? ""}`}
      style={{ width, height, perspective: 1200 }}
    >
      <div
        className="relative size-full rounded-[inherit] motion-reduce:!transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: `${axis}(${on ? 180 : 0}deg)`,
          transition: `transform ${duration}ms cubic-bezier(.3,1.35,.45,1)`,
        }}
      >
        <div className={face} aria-hidden={on}>
          {front}
        </div>
        <div className={face} aria-hidden={!on} style={{ transform: `${axis}(180deg)` }}>
          {back}
        </div>
      </div>
    </div>
  );
}
