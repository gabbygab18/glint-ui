"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileText, RotateCcw, Trash2 } from "lucide-react";

export interface ShredderProps {
  /** Document name on the card. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Custom card body (defaults to a skeleton page). */
  children?: ReactNode;
  /** Number of strips the card is cut into. */
  strips?: number;
  /** Ms the undo button stays available. 0 keeps it forever. */
  undoTimeout?: number;
  /** Called when the card is shredded. */
  onDelete?: () => void;
  /** Called when undo brings it back. */
  onUndo?: () => void;
  /** Called when the undo window closes. */
  onExpire?: () => void;
  className?: string;
}

type Phase = "idle" | "shredding" | "gone" | "expired";
const CARD_H = 176;
const SHRED_MS = 1500;

// Deterministic jitter so SSR and client agree.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function Shredder({
  title = "Q3-forecast.pdf",
  subtitle = "2.4 MB · edited 3h ago",
  children,
  strips = 12,
  undoTimeout = 5000,
  onDelete,
  onUndo,
  onExpire,
  className,
}: ShredderProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const timers = useRef<number[]>([]);
  const undoBtn = useRef<HTMLButtonElement>(null);
  const deleteBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const shred = () => {
    if (phase !== "idle") return;
    setPhase("shredding");
    onDelete?.();
    later(reduce ? 200 : SHRED_MS, () => {
      setPhase("gone");
      requestAnimationFrame(() => undoBtn.current?.focus());
      if (undoTimeout > 0)
        later(undoTimeout, () => {
          setPhase("expired");
          onExpire?.();
        });
    });
  };
  const undo = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRound((r) => r + 1);
    setPhase("idle");
    onUndo?.();
    requestAnimationFrame(() => deleteBtn.current?.focus());
  };

  const body = children ?? (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
          <FileText className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-1.5 pt-1">
        {[100, 92, 97, 64, 88, 40].map((w, i) => (
          <span key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`relative w-72 ${className ?? ""}`} style={{ height: CARD_H + 230 }}>
      {/* Card: whole while idle, a stack of adjacent strips while shredding. */}
      <div className="absolute inset-x-3 top-0" style={{ height: CARD_H }}>
        <AnimatePresence initial={false}>
          {phase === "idle" && (
            <motion.div
              key={`card-${round}`}
              className="absolute inset-0 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
              initial={round ? { y: -40, scale: 0.85, opacity: 0 } : false}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
            >
              {body}
              <motion.button
                ref={deleteBtn}
                type="button"
                onClick={shred}
                aria-label={`Shred ${title}`}
                whileHover={{ scale: 1.08, rotate: -6 }}
                whileTap={{ scale: 0.85 }}
                className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 className="size-4" aria-hidden />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "shredding" &&
          !reduce &&
          Array.from({ length: strips }, (_, i) => {
            const a = (i / strips) * 100;
            const b = 100 - ((i + 1) / strips) * 100;
            const drift = (rand(i, round) - 0.5) * 70;
            return (
              <motion.div
                key={i}
                aria-hidden
                className="absolute inset-0 overflow-hidden rounded-xl border border-border bg-card"
                style={{ clipPath: `inset(0 ${b}% 0 ${a}%)` }}
                initial={{ y: 0 }}
                animate={{
                  y: [0, CARD_H + 56, CARD_H + 56 + 150 + rand(i, 7) * 60],
                  x: [0, 0, drift],
                  rotate: [0, 0, drift / 3],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1.3, times: [0, 0.55, 1], ease: ["easeIn", "easeIn"], delay: rand(i, 3) * 0.12 }}
              >
                {body}
              </motion.div>
            );
          })}
      </div>

      {/* The machine sits in front of the strips so they vanish into its mouth. */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 z-10 h-14 rounded-2xl border border-border bg-muted shadow-[inset_0_1px_0_rgb(255_255_255/.08),0_10px_30px_-10px_rgb(0_0_0/.5)]"
        style={{ top: CARD_H - 4 }}
        animate={phase === "shredding" && !reduce ? { x: [0, -1.5, 1.5, -1, 1, 0], y: [0, 1, 0, 1, 0] } : { x: 0, y: 0 }}
        transition={phase === "shredding" ? { duration: 0.18, repeat: 6 } : undefined}
      >
        <div className="mx-3 mt-2 h-1.5 rounded-full bg-background shadow-[inset_0_1px_2px_rgb(0_0_0/.6)]" />
        <div className="mx-auto mt-2.5 flex w-fit items-center gap-1.5">
          <span className={`size-1.5 rounded-full transition-colors ${phase === "shredding" ? "bg-red-500" : "bg-emerald-500"}`} />
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {phase === "shredding" ? "Shredding" : "Ready"}
          </span>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 grid place-items-center" style={{ top: CARD_H + 72 }}>
        <AnimatePresence>
          {phase === "gone" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pl-4 pr-1.5 text-sm text-foreground shadow-lg"
            >
              <span>Document shredded</span>
              <button
                ref={undoBtn}
                type="button"
                onClick={undo}
                className="group flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <RotateCcw className="size-3.5 transition-transform duration-300 group-hover:-rotate-180" aria-hidden />
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="sr-only" aria-live="polite">
        {phase === "gone" ? `${title} shredded. Undo available.` : ""}
      </span>
    </div>
  );
}
