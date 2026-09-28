"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { GlintBot } from "@/registry/items/glint-bot/glint-bot";

const SCRIPTS = [
  ["Hi! I'm Glint.", "Every component here is one file you own.", "Boop me, I don't mind."],
  ["Hey again!", "Press Ctrl K to search all of them.", "Or just browse. I'll wait."],
  ["Psst.", "Hover a preview, most of them react.", "Okay, back to hiding."],
];
const LINE_MS = 2600;
const HIDDEN_MS = 4500;

/** Glint pops in, introduces the library in a speech bubble, then vanishes and comes back later. */
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
        ? () => setLine(0) // appear
        : line < script.length
          ? () => setLine(line + 1) // next line, then one beat with no bubble before leaving
          : () => {
              setLine(-1);
              setRound((r) => r + 1);
            };
    const delay = line === -1 ? (round === 0 ? 700 : HIDDEN_MS) : line < script.length ? LINE_MS : 900;
    const t = window.setTimeout(next, delay);
    return () => window.clearTimeout(t);
  }, [line, held, reduced, round, script.length]);

  const visible = reduced || line >= 0;
  const text = reduced ? script[0] : script[line];

  return (
    <div
      className="relative flex h-[16rem] flex-col items-center justify-end"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
    >
      <AnimatePresence mode="wait">
        {visible && text && (
          <motion.div
            key={`${round}-${line}`}
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="absolute top-2 z-10 max-w-[15rem] rounded-2xl border bg-card px-4 py-2.5 text-center text-sm shadow-lg"
          >
            {text}
            {/* Tail pointing down at Glint. */}
            <span
              aria-hidden
              className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b bg-card"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            key={`bot-${round}`}
            initial={{ scale: 0, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 20, opacity: 0, transition: { duration: 0.35, ease: "backIn" } }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
            className="origin-bottom"
          >
            <GlintBot size={180} wave label="Glint, waving hello" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Poof: a ring of sparkles each time Glint appears or vanishes. */}
      {!reduced && (
        <motion.div
          key={`poof-${round}-${visible}`}
          aria-hidden
          className="pointer-events-none absolute bottom-16 left-1/2 size-0"
        >
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute size-2 rounded-full bg-primary"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * 70, y: Math.sin(a) * 50, opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
