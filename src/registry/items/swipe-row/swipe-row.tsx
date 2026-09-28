"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Archive, Trash2 } from "lucide-react";

type Side = "archive" | "delete";

export interface SwipeRowProps {
  children: ReactNode;
  /** Accessible name of the row, e.g. the item title. */
  label?: string;
  /** Px the row must travel to commit an action on release. */
  threshold?: number;
  /** Width of the action button when the row rests half open, px. */
  actionWidth?: number;
  archiveColor?: string;
  deleteColor?: string;
  archiveLabel?: string;
  deleteLabel?: string;
  /** Called after the row has swiped out and collapsed. Remove the item here. Omit to disable the right swipe. */
  onArchive?: () => void;
  /** Called after the row has swiped out and collapsed. Remove the item here. Omit to disable the left swipe. */
  onDelete?: () => void;
  className?: string;
}

const settleSpring = { type: "spring", stiffness: 520, damping: 26 } as const;
const exitSpring = { type: "spring", stiffness: 380, damping: 40 } as const;

// iOS-style rubber band: follows 1:1 at first, then gives less and less.
const rubber = (v: number, limit: number) => (1 - 1 / ((v * 0.55) / limit + 1)) * limit;

export function SwipeRow({
  children,
  label,
  threshold = 110,
  actionWidth = 80,
  archiveColor = "#22c55e",
  deleteColor = "#ef4444",
  archiveLabel = "Archive",
  deleteLabel = "Delete",
  onArchive,
  onDelete,
  className,
}: SwipeRowProps) {
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const start = useRef(0);
  const fired = useRef(false);
  const hintId = useId();
  const [open, setOpen] = useState<Side | null>(null);
  const [armed, setArmed] = useState<Side | null>(null);
  const [gone, setGone] = useState<Side | null>(null);

  const x = useMotionValue(0);
  useMotionValueEvent(x, "change", (v) => setArmed(v >= threshold ? "archive" : v <= -threshold ? "delete" : null));

  const leftOpacity = useTransform(x, (v) => (v > 0.5 ? 1 : 0));
  const rightOpacity = useTransform(x, (v) => (v < -0.5 ? 1 : 0));
  // Once past the button width, the icon rides along with the row's edge.
  const leftIconX = useTransform(x, (v) => Math.max(0, v - actionWidth));
  const rightIconX = useTransform(x, (v) => Math.min(0, v + actionWidth));
  const leftReveal = useTransform(x, [0, actionWidth], [0.4, 1]);
  const rightReveal = useTransform(x, [-actionWidth, 0], [1, 0.4]);

  const resist = (raw: number) => {
    const allowed = raw > 0 ? !!onArchive : !!onDelete;
    const s = Math.sign(raw);
    const a = Math.abs(raw);
    if (!allowed) return s * rubber(a, 36);
    return a <= threshold ? raw : s * (threshold + rubber(a - threshold, threshold));
  };

  const settle = (side: Side | null) => {
    setOpen(side);
    animate(x, side === "archive" ? actionWidth : side === "delete" ? -actionWidth : 0, reduce ? { duration: 0 } : settleSpring);
  };

  const commit = (side: Side) => {
    const w = (rowRef.current?.offsetWidth ?? 400) + 40;
    setOpen(null);
    animate(x, side === "archive" ? w : -w, reduce ? { duration: 0 } : exitSpring).then(() => setGone(side));
  };

  const onPanEnd = (_: unknown, info: PanInfo) => {
    const v = x.get();
    const vel = info.velocity.x;
    if (onArchive && (v >= threshold || (v > actionWidth && vel > 900))) return commit("archive");
    if (onDelete && (v <= -threshold || (v < -actionWidth && vel < -900))) return commit("delete");
    if (onArchive && v > actionWidth / 2 && vel > -300) return settle("archive");
    if (onDelete && v < -actionWidth / 2 && vel < 300) return settle("delete");
    settle(null);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || gone) return;
    if (e.key === "Enter" && open) {
      e.preventDefault();
      return commit(open);
    }
    let next: Side | null | undefined;
    if (e.key === "ArrowRight") next = open === "delete" ? null : onArchive ? "archive" : open;
    if (e.key === "ArrowLeft") next = open === "archive" ? null : onDelete ? "delete" : open;
    if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    settle(next);
  };

  const action = (side: Side) => {
    const isLeft = side === "archive";
    const Icon = isLeft ? Archive : Trash2;
    return (
      <motion.div
        className={`absolute inset-0 flex items-center ${isLeft ? "justify-start" : "justify-end"}`}
        style={{ background: isLeft ? archiveColor : deleteColor, opacity: isLeft ? leftOpacity : rightOpacity }}
      >
        {/* Dim veil lifts once the swipe is armed, so the color "floods" in. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-black/25"
          animate={{ opacity: armed === side ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        />
        <motion.button
          type="button"
          tabIndex={open === side ? 0 : -1}
          aria-hidden={open !== side}
          onClick={() => commit(side)}
          style={{ width: actionWidth, x: isLeft ? leftIconX : rightIconX }}
          className="relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset"
        >
          <motion.span style={{ scale: isLeft ? leftReveal : rightReveal }}>
            <motion.span
              className="block"
              animate={{ scale: armed === side ? 1.3 : 1, rotate: armed === side ? (isLeft ? -12 : 12) : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 12 }}
            >
              <Icon className="size-5" />
            </motion.span>
          </motion.span>
          {isLeft ? archiveLabel : deleteLabel}
        </motion.button>
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className ?? ""}`}
      initial={false}
      animate={gone ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        if (!gone || fired.current) return;
        fired.current = true;
        (gone === "archive" ? onArchive : onDelete)?.();
      }}
    >
      {onArchive && action("archive")}
      {onDelete && action("delete")}
      <motion.div
        ref={rowRef}
        tabIndex={gone ? -1 : 0}
        role="group"
        aria-label={label}
        aria-describedby={hintId}
        onPanStart={() => {
          start.current = x.get();
          setOpen(null);
        }}
        onPan={(_, info) => x.set(resist(start.current + info.offset.x))}
        onPanEnd={onPanEnd}
        onKeyDown={onKey}
        style={{ x, touchAction: "pan-y" }}
        className="relative cursor-grab bg-card outline-none select-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {children}
      </motion.div>
      <span id={hintId} className="sr-only">
        Swipe, or press the arrow keys to reveal actions. Enter confirms, Escape closes.
      </span>
    </motion.div>
  );
}
