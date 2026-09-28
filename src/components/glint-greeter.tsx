"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { GlintBot } from "@/registry/items/glint-bot/glint-bot";

const SCRIPTS = [
  ["Hi! I'm Glint.", "Every component here is one file you own.", "Boop me, I don't mind."],
  ["Hey again!", "Press Ctrl K to search all of them.", "Or just browse. I'll wait."],
  ["Psst.", "Hover a preview, most of them react.", "Okay, back to hiding."],
];
const LINE_MS = 2800;
const HIDDEN_MS = 9000;
const SIZE = 230;

/**
 * Glint peeks in from the right edge of the screen, leaning in and partly cut off,
 * says a few lines, then ducks back out and returns later with different ones.
 */
export function GlintGreeter({ count }: { count: number }) {
  const reduced = useReducedMotion();
  const [round, setRound] = useState(0);
  const [line, setLine] = useState(-1); // -1 = hidden
  const [held, setHeld] = useState(false);
  const script = SCRIPTS[round % SCRIPTS.length].map((l) => l.replace("all of them", `all ${count}`));

  useEffect(() => {
    if (reduced || held) return;
    const next =
      line === -1
        ? () => setLine(0) // peek in
        : line < script.length
          ? () => setLine(line + 1) // next line, then one beat with no bubble before leaving
          : () => {
              setLine(-1);
              setRound((r) => r + 1);
            };
    const delay = line === -1 ? (round === 0 ? 1500 : HIDDEN_MS) : line < script.length ? LINE_MS : 700;
    const t = window.setTimeout(next, delay);
    return () => window.clearTimeout(t);
  }, [line, held, reduced, round, script.length]);

  // Reduced motion: no surprise pop-ins at all.
  if (reduced) return null;

  const visible = line >= 0;
  const text = script[line];

  return (
    // Fixed to the viewport. Glint sits partly past the right edge, so the screen edge itself
    // cuts it off (fixed boxes never add page scroll). Nothing else clips it.
    <div className="pointer-events-none fixed right-0 bottom-14 z-40 hidden md:block" style={{ width: SIZE, height: SIZE }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            key={`glint-${round}`}
            className="pointer-events-auto absolute bottom-0"
            style={{ right: -SIZE * 0.32, width: SIZE, height: SIZE, transformOrigin: "100% 100%" }}
            initial={{ x: SIZE, rotate: -6 }}
            animate={{ x: 0, rotate: -16 }}
            exit={{ x: SIZE * 1.1, rotate: -4, transition: { duration: 0.45, ease: "backIn" } }}
            transition={{ type: "spring", stiffness: 170, damping: 15 }}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            {/* Surprise lines, like it just popped in. */}
            <svg viewBox="0 0 60 60" aria-hidden className="absolute top-2 left-6 size-16 overflow-visible">
              {["M18 30 L4 22", "M24 18 L16 4", "M16 42 L2 45"].map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  stroke="var(--primary)"
                  strokeWidth={5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: [1, 1, 0] }}
                  transition={{ duration: 1.6, delay: 0.25 + i * 0.06, times: [0, 0.65, 1] }}
                />
              ))}
            </svg>
            <GlintBot size={SIZE} wave label="Glint, waving hello" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {visible && text && (
          <motion.div
            key={`${round}-${line}`}
            role="status"
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            // Anchored to where the tilted head lands, so the tail touches Glint.
            style={{ right: SIZE * 0.64, bottom: SIZE * 0.66 }}
            className="pointer-events-auto absolute w-44 origin-right rounded-2xl border bg-card px-3.5 py-2.5 text-sm leading-snug text-card-foreground shadow-xl"
          >
            {text}
            {/* Tail pointing right, toward Glint. */}
            <span aria-hidden className="absolute bottom-3 -right-[7px] size-3 rotate-45 border-t border-r bg-card" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
