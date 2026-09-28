"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { Trash2 } from "lucide-react";

export interface PaperCrumpleProps {
  /** Note title. */
  title?: string;
  /** Note text. */
  body?: string;
  /** Ms the Undo button stays available after binning. */
  undoDuration?: number;
  /** Called when the undo window closes, i.e. the delete is final. */
  onDelete?: () => void;
  /** Called when the note is restored with Undo. */
  onUndo?: () => void;
  /** Accent used on the bin and undo bar. */
  color?: string;
  className?: string;
}

type Phase = "idle" | "busy" | "binned" | "gone";

// Arc from the note to the bin, sampled so it reads as a real toss.
const arc = (dx: number, dy: number, h: number, reverse = false) => {
  const ts = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((t) => (reverse ? 1 - t : t));
  return { x: ts.map((t) => dx * t), y: ts.map((t) => dy * t - h * 4 * t * (1 - t)) };
};

export function PaperCrumple({
  title = "Grocery list",
  body = "Oat milk, lemons, basil, the good sourdough, something for Sunday.",
  undoDuration = 5000,
  onDelete,
  onUndo,
  color = "#f87171",
  className,
}: PaperCrumpleProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();
  const delta = useRef({ dx: 0, dy: 0 });
  const del = useRef<HTMLButtonElement>(null);
  const undo = useRef<HTMLButtonElement>(null);
  const onDeleteRef = useRef(onDelete);
  useEffect(() => {
    onDeleteRef.current = onDelete;
  });

  const s = (sec: number) => (reduce ? 0 : sec);
  const springy = (stiffness: number, damping: number) =>
    reduce ? { duration: 0 } : ({ type: "spring", stiffness, damping } as const);

  useEffect(() => {
    if (phase !== "binned") return;
    undo.current?.focus();
    const id = window.setTimeout(() => {
      setPhase("gone");
      onDeleteRef.current?.();
    }, undoDuration);
    return () => window.clearTimeout(id);
  }, [phase, undoDuration]);

  const measure = () => {
    const root = scope.current;
    const b = root.querySelector("[data-ball]")!.getBoundingClientRect();
    const bin = root.querySelector("[data-bin]")!.getBoundingClientRect();
    delta.current = {
      dx: bin.left + bin.width / 2 - (b.left + b.width / 2),
      dy: bin.top + 10 - (b.top + b.height / 2),
    };
  };

  const crumple = async () => {
    if (phase !== "idle") return;
    setPhase("busy");
    measure();
    const { dx, dy } = delta.current;
    // Anticipation: the note tenses up before it gets scrunched.
    await animate("[data-card]", { scaleX: 1.04, scaleY: 0.94, rotate: -2 }, { duration: s(0.12) });
    animate("[data-crease]", { opacity: 1 }, { duration: s(0.3) });
    await animate(
      "[data-card]",
      { scaleX: 0.2, scaleY: 0.3, rotate: 28, borderRadius: 80 },
      { duration: s(0.34), ease: [0.55, 0, 0.8, 0.45] },
    );
    animate("[data-card]", { opacity: 0 }, { duration: s(0.06) });
    await animate("[data-ball]", { opacity: 1, scale: [0.6, 1.15, 1] }, { duration: s(0.2) });
    animate("[data-lid]", { rotate: 60 }, springy(420, 13));
    const path = arc(dx, dy, 120);
    await animate(
      "[data-ball]",
      { ...path, rotate: [0, 460] },
      { duration: s(0.62), ease: "linear" },
    );
    await animate("[data-ball]", { y: dy + 26, scale: 0.75, opacity: 0 }, { duration: s(0.16), ease: "easeIn" });
    animate("[data-lid]", { rotate: 0 }, springy(500, 16));
    await animate("[data-bin]", { rotate: [0, -8, 6, -3, 0], scaleY: [1, 0.9, 1.05, 1] }, { duration: s(0.45) });
    setPhase("binned");
  };

  const restore = async () => {
    if (phase !== "binned") return;
    setPhase("busy");
    const { dx, dy } = delta.current;
    await animate("[data-lid]", { rotate: 60 }, springy(420, 13));
    animate("[data-bin]", { scaleY: [1, 0.9, 1] }, { duration: s(0.25) });
    await animate(
      "[data-ball]",
      { ...arc(dx, dy, 120, true), rotate: [460, 0], opacity: [1, 1], scale: [0.8, 1] },
      { duration: s(0.55), ease: "linear" },
    );
    animate("[data-lid]", { rotate: 0 }, springy(500, 16));
    animate("[data-ball]", { opacity: 0, scale: 1.2 }, { duration: s(0.12) });
    animate("[data-card]", { opacity: 1 }, { duration: s(0.08) });
    animate("[data-crease]", { opacity: 0 }, { duration: s(1.2), delay: s(0.2) });
    // Smooth the paper back out with an overshoot.
    await animate("[data-card]", { scaleX: 1, scaleY: 1, rotate: 0, borderRadius: 16 }, springy(260, 14));
    setPhase("idle");
    del.current?.focus();
    onUndo?.();
  };

  return (
    <div ref={scope} className={`relative h-[19rem] w-[22rem] max-w-full select-none ${className ?? ""}`}>
      {phase !== "gone" && (
        <div
          data-card
          className="absolute left-2 top-6 flex h-40 w-64 flex-col overflow-hidden border border-border bg-card p-5 text-foreground shadow-[0_18px_40px_-20px_rgb(0_0_0/.8)]"
          style={{ borderRadius: 16 }}
          aria-hidden={phase !== "idle"}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold">{title}</h3>
            <button
              ref={del}
              type="button"
              onClick={crumple}
              disabled={phase !== "idle"}
              aria-label={`Delete note: ${title}`}
              className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{body}</p>
          <svg data-crease aria-hidden className="pointer-events-none absolute inset-0 size-full" style={{ opacity: 0 }} viewBox="0 0 256 160" preserveAspectRatio="none">
            <g fill="none" stroke="currentColor" strokeWidth={1.2} className="text-muted-foreground/60">
              <path d="M0 40L70 62L120 30L190 70L256 48" />
              <path d="M30 160L64 100L140 118L170 60L230 160" />
              <path d="M0 110L60 100M140 118L256 104M120 30L140 0M190 70L210 0" />
            </g>
          </svg>
        </div>
      )}

      {/* The crumpled ball that gets tossed. */}
      <div
        data-ball
        aria-hidden
        className="pointer-events-none absolute left-28 top-20 size-12"
        style={{ opacity: 0 }}
      >
        <svg viewBox="0 0 48 48" className="size-full overflow-visible drop-shadow-[0_6px_8px_rgb(0_0_0/.45)]">
          <path
            d="M24 2L33 6L43 10L45 22L47 31L39 41L28 46L17 44L7 38L2 26L5 14L14 5Z"
            className="fill-muted stroke-muted-foreground/60"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d="M14 5L20 18L5 14M20 18L33 6M20 18L26 30L45 22M26 30L17 44M26 30L39 41M2 26L20 18"
            fill="none"
            className="stroke-muted-foreground/70"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Bin */}
      <div data-bin aria-hidden className="absolute bottom-4 right-4 h-20 w-16" style={{ transformOrigin: "50% 100%" }}>
        <div data-lid className="absolute -left-1 -right-1 top-0 h-3" style={{ transformOrigin: "100% 100%" }}>
          <span className="absolute left-1/2 -top-1.5 h-2 w-5 -translate-x-1/2 rounded-t-md border-2 border-b-0 border-muted-foreground/70" />
          <span className="absolute inset-0 rounded-md bg-muted-foreground/80" />
        </div>
        <div
          className="absolute inset-x-1 bottom-0 top-4 rounded-b-xl border-2 border-t-0 border-muted-foreground/70 bg-muted"
          style={{ clipPath: "polygon(0 0,100% 0,90% 100%,10% 100%)" }}
        >
          <div className="absolute inset-0 flex justify-evenly px-2 pt-2 pb-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1 rounded-full bg-muted-foreground/40" />
            ))}
          </div>
        </div>
      </div>

      {/* Undo bar */}
      <div className="absolute bottom-4 left-2 right-24" aria-live="polite">
        {phase === "binned" && (
          <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card py-2 pl-3.5 pr-2 text-sm text-foreground shadow-lg">
            <span>Note binned</span>
            <button
              ref={undo}
              type="button"
              onClick={restore}
              className="rounded-lg px-2.5 py-1 font-semibold outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/60"
              style={{ color }}
            >
              Undo
            </button>
            <span
              aria-hidden
              className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
              style={{ background: color, animation: `paper-crumple-timer ${undoDuration}ms linear forwards` }}
            />
            <style href="paper-crumple" precedence="default">
              {`@keyframes paper-crumple-timer{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}
            </style>
          </div>
        )}
        {phase === "gone" && <p className="py-2 text-sm text-muted-foreground">Note deleted.</p>}
      </div>
    </div>
  );
}
