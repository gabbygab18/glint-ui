"use client";

import { useState } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";

export interface ToggleVaultProps {
  /** Controlled state. */
  locked?: boolean;
  defaultLocked?: boolean;
  onChange?: (locked: boolean) => void;
  /** Diameter in px. */
  size?: number;
  /** LED color when unlocked. */
  openColor?: string;
  /** LED color when locked. */
  lockedColor?: string;
  label?: string;
  className?: string;
}

const BOLTS = 6;

export function ToggleVault({
  locked,
  defaultLocked = true,
  onChange,
  size = 160,
  openColor = "#22c55e",
  lockedColor = "#ef4444",
  label = "Vault",
  className,
}: ToggleVaultProps) {
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultLocked);
  const isLocked = locked ?? inner;
  const [door, animateDoor] = useAnimate();

  const r = size * 0.38; // door radius
  const boltLen = size * 0.13;
  const boltW = size * 0.055;
  const led = isLocked ? lockedColor : openColor;

  const toggle = () => {
    const next = !isLocked;
    setInner(next);
    onChange?.(next);
    if (reduce) return;
    // The "clunk": bolts slam home (lock) or the door breathes loose (unlock).
    animateDoor(
      door.current,
      next ? { scale: [1, 0.96, 1.01, 1] } : { scale: [1, 1, 1.04, 1], rotate: [0, 0, -4, 0] },
      { duration: next ? 0.35 : 0.5, delay: next ? 0.75 : 0.85 },
    );
  };

  return (
    <div className={`inline-flex flex-col items-center gap-4 ${className ?? ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isLocked}
        aria-label={`${label} lock`}
        onClick={toggle}
        className="group relative grid place-items-center rounded-full bg-muted shadow-[inset_0_6px_16px_rgb(0_0_0/.45),0_1px_0_rgb(255_255_255/.06)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        style={{ width: size, height: size }}
      >
        {/* Bolts sit under the door; locked, they poke out into the frame. */}
        {Array.from({ length: BOLTS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-1/2 left-1/2 size-0"
            style={{ rotate: `${(i * 360) / BOLTS + 30}deg` }}
          >
            <motion.span
              className="absolute rounded-sm bg-[linear-gradient(90deg,#a1a1aa,#e4e4e7,#a1a1aa)] shadow"
              style={{ width: boltLen, height: boltW, top: -boltW / 2, left: r - boltLen * 0.55 }}
              initial={false}
              animate={{ x: isLocked ? 0 : -boltLen * 0.75 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : isLocked
                    ? { type: "spring", stiffness: 700, damping: 18, delay: 0.6 + i * 0.03 }
                    : { type: "spring", stiffness: 300, damping: 26, delay: 0.55 + i * 0.05 }
              }
            />
          </span>
        ))}

        <span
          ref={door}
          aria-hidden
          className="relative grid place-items-center rounded-full border border-border bg-card shadow-[0_8px_20px_-6px_rgb(0_0_0/.6),inset_0_2px_0_rgb(255_255_255/.08)]"
          style={{ width: r * 2, height: r * 2 }}
        >
          {/* Rivets around the rim. */}
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="absolute size-1 rounded-full bg-muted-foreground/40"
              style={{ transform: `rotate(${i * 30}deg) translateY(${-r * 0.86}px)` }}
            />
          ))}
          <span
            className="absolute size-2 rounded-full transition-[background-color,box-shadow] duration-300"
            style={{ top: r * 0.3, right: r * 0.36, background: led, boxShadow: `0 0 8px 1px ${led}` }}
          />
          {/* Index mark the dial numbers line up against. */}
          <span
            className="absolute border-x-[5px] border-t-[7px] border-x-transparent"
            style={{ top: r * 0.22, borderTopColor: led }}
          />
          <motion.span
            className="relative grid place-items-center rounded-full border border-border bg-[repeating-conic-gradient(from_-1deg,var(--muted-foreground)_0_2deg,transparent_2deg_15deg)] shadow-[0_4px_10px_-2px_rgb(0_0_0/.5)] group-active:scale-95"
            style={{ width: r * 1.2, height: r * 1.2 }}
            initial={false}
            animate={{ rotate: isLocked ? [270, 300, 0] : [0, -30, 270] }}
            transition={reduce ? { duration: 0 } : { duration: 0.95, times: [0, 0.2, 1], ease: ["easeOut", [0.2, 0.9, 0.3, 1.15]] }}
          >
            <span className="absolute inset-[16%] rounded-full bg-card" />
            {/* Three-spoke handle with grips, reaching past the dial. */}
            {[60, 180, 300].map((a) => (
              <span
                key={a}
                className="absolute w-1.5 origin-bottom rounded-full bg-foreground/75"
                style={{ height: r * 0.72, bottom: "50%", rotate: `${a}deg` }}
              >
                <span
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground/90 shadow"
                  style={{ width: r * 0.16, height: r * 0.16 }}
                />
              </span>
            ))}
            <span className="relative size-[22%] rounded-full bg-foreground/80 shadow-inner" />
          </motion.span>
        </span>
      </button>
      <span aria-live="polite" className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="size-2 rounded-full transition-colors duration-300" style={{ background: led }} />
        {isLocked ? "Locked" : "Unlocked"}
      </span>
    </div>
  );
}
