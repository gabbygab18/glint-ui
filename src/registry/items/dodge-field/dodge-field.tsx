"use client";

import { useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";

export interface DodgeFieldProps {
  /** The question above the buttons. */
  question?: string;
  yesLabel?: string;
  noLabel?: string;
  /** Px around the No button in which the pointer makes it flee. */
  radius?: number;
  /** Dodges before No gives up and lets itself be clicked. 0 = never gives up. */
  maxDodges?: number;
  /** Yes button and celebration color. */
  color?: string;
  onYes?: () => void;
  onNo?: () => void;
  className?: string;
}

const hop = { type: "spring", stiffness: 380, damping: 17, mass: 0.8 } as const;

export function DodgeField({
  question = "Deploy on a Friday afternoon?",
  yesLabel = "Yes",
  noLabel = "No",
  radius = 80,
  maxDodges = 8,
  color = "#f472b6",
  onYes,
  onNo,
  className,
}: DodgeFieldProps) {
  const root = useRef<HTMLDivElement>(null);
  const no = useRef<HTMLButtonElement>(null);
  const fledAt = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  // Lean into the direction of travel and stretch with speed: cartoon follow-through.
  const rotate = useTransform(vx, [-1600, 1600], [-16, 16]);
  const scaleX = useTransform(() => 1 + Math.min(Math.hypot(vx.get(), vy.get()), 2400) / 6000);
  const scaleY = useTransform(scaleX, (s) => 2 - s);

  const gaveUp = maxDodges > 0 && dodges >= maxDodges;

  const flee = (px: number, py: number) => {
    const btn = no.current;
    const box = root.current;
    if (!btn || !box || gaveUp || answer) return false;
    const b = btn.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    if (Math.hypot(cx - px, cy - py) > radius) return false;

    // Untransformed centre, so targets can be converted back into x/y offsets.
    const bx = cx - x.get();
    const by = cy - y.get();
    const angle = Math.atan2(cy - py, cx - px) + (Math.random() - 0.5) * 1.3;
    const jump = radius + 30 + Math.random() * 50;
    let tx = cx + Math.cos(angle) * jump;
    let ty = cy + Math.sin(angle) * jump;
    const hw = b.width / 2 + 10;
    const hh = b.height / 2 + 10;
    // Cornered against a wall: bolt to the far side of the field instead.
    if (tx < r.left + hw || tx > r.right - hw)
      tx = px < r.left + r.width / 2 ? r.right - hw - Math.random() * 40 : r.left + hw + Math.random() * 40;
    if (ty < r.top + hh || ty > r.bottom - hh)
      ty = py < r.top + r.height / 2 ? r.bottom - hh - Math.random() * 24 : r.top + hh + Math.random() * 24;

    if (reduce) {
      x.set(tx - bx);
      y.set(ty - by);
    } else {
      animate(x, tx - bx, hop);
      animate(y, ty - by, hop);
    }
    fledAt.current = performance.now();
    setDodges((n) => n + 1);
    return true;
  };

  const reset = () => {
    setAnswer(null);
    setDodges(0);
    animate(x, 0, hop);
    animate(y, 0, hop);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") flee(e.clientX, e.clientY);
  };

  const yesScale = 1 + Math.min(dodges, 8) * 0.06;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={root}
        onPointerMove={onMove}
        className={`relative h-64 w-[26rem] max-w-full select-none overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl ${className ?? ""}`}
      >
        <p className="absolute inset-x-6 top-8 text-center text-lg font-semibold tracking-tight">{question}</p>
        <p className="absolute inset-x-6 top-16 h-5 text-center text-xs text-muted-foreground" aria-live="polite">
          {answer ? "" : gaveUp ? "Okay, okay. It stopped running." : dodges > 2 ? `Dodged ${dodges} times` : ""}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {answer ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="absolute inset-x-0 top-[42%] grid justify-items-center gap-3"
              role="status"
            >
              <span className="relative text-2xl font-bold" style={{ color: answer === "yes" ? color : undefined }}>
                {answer === "yes" ? "Brave. Let's ship it." : "Wise choice."}
                {answer === "yes" &&
                  Array.from({ length: 14 }, (_, i) => {
                    const a = (i / 14) * Math.PI * 2;
                    return (
                      <motion.span
                        key={i}
                        aria-hidden
                        className="absolute left-1/2 top-1/2 size-2 rounded-full"
                        style={{ background: i % 2 ? color : "var(--foreground)" }}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: Math.cos(a) * (90 + (i % 3) * 25), y: Math.sin(a) * (50 + (i % 3) * 18), scale: 0, opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }}
                      />
                    );
                  })}
              </span>
              <button
                type="button"
                onClick={reset}
                className="rounded-full px-3 py-1 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
              >
                Ask again
              </button>
            </motion.div>
          ) : (
            <motion.div key="buttons" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <motion.button
                type="button"
                onClick={() => {
                  setAnswer("yes");
                  onYes?.();
                }}
                animate={{ scale: yesScale }}
                whileTap={{ scale: yesScale * 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute left-[30%] top-[62%] -ml-12 -mt-6 h-12 w-24 rounded-full font-semibold text-white outline-none focus-visible:ring-[3px] focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                style={{ background: color, boxShadow: `inset 0 1px 0 rgb(255 255 255/.35), 0 10px 26px -10px ${color}` }}
              >
                {yesLabel}
              </motion.button>
              <motion.button
                ref={no}
                type="button"
                onPointerDown={(e) => {
                  // Touch has no hover, so it flees from the tap itself.
                  if (e.pointerType !== "mouse") flee(e.clientX, e.clientY);
                }}
                onClick={() => {
                  if (performance.now() - fledAt.current < 400) return;
                  setAnswer("no");
                  onNo?.();
                }}
                style={{ x, y, rotate: gaveUp ? 8 : rotate, scaleX, scaleY }}
                className="absolute left-[70%] top-[62%] -ml-12 -mt-6 h-12 w-24 rounded-full border border-border bg-muted font-semibold text-foreground outline-none transition-[opacity] focus-visible:ring-[3px] focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {gaveUp ? `${noLabel}…` : noLabel}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
