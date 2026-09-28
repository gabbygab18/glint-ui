"use client";

import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { Bell, CircleAlert, CircleCheck, Info, X } from "lucide-react";

export type ToastTone = "default" | "success" | "error" | "info";
export type ToastId = string | number;

export interface ToastItem {
  id: ToastId;
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
}

/** Tiny local queue. Pass `toasts` and `dismiss` to <SwipeToast />. */
export function useSwipeToast(initial: ToastItem[] = []) {
  const [toasts, setToasts] = useState(initial);
  const seq = useRef(0);
  const push = useCallback((t: Omit<ToastItem, "id"> & { id?: ToastId }) => {
    const id = t.id ?? `t${++seq.current}-${Date.now()}`;
    setToasts((v) => [...v, { ...t, id }]);
    return id;
  }, []);
  const dismiss = useCallback((id: ToastId) => setToasts((v) => v.filter((t) => t.id !== id)), []);
  return { toasts, push, dismiss };
}

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface SwipeToastProps {
  toasts: ToastItem[];
  onDismiss: (id: ToastId) => void;
  /** Corner of the container (or viewport with strategy="fixed"). */
  position?: Position;
  /** "absolute" keeps the stack inside the nearest positioned parent. */
  strategy?: "absolute" | "fixed";
  /** Ms before a toast auto-dismisses. 0 keeps them until swiped. */
  duration?: number;
  /** How many toasts peek out of the collapsed stack. */
  visible?: number;
  /** Px between toasts when the stack is expanded. */
  gap?: number;
  className?: string;
}

const css = `@keyframes swipe-toast-timer{from{transform:scaleX(1)}to{transform:scaleX(0)}}`;
const PEEK = 12;
const place: Record<Position, string> = {
  "top-left": "top-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-0 right-0",
};
const tones = {
  default: { Icon: Bell, color: "var(--foreground)" },
  success: { Icon: CircleCheck, color: "#22c55e" },
  error: { Icon: CircleAlert, color: "#ef4444" },
  info: { Icon: Info, color: "#38bdf8" },
};

export function SwipeToast({
  toasts,
  onDismiss,
  position = "bottom-right",
  strategy = "absolute",
  duration = 5000,
  visible = 3,
  gap = 10,
  className,
}: SwipeToastProps) {
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const top = position.startsWith("top");
  const dir = top ? 1 : -1;

  const front = [...toasts].reverse(); // newest first
  const h = (t: ToastItem) => heights[String(t.id)] ?? 64;
  const offsets: number[] = [];
  front.reduce((acc, t, i) => ((offsets[i] = acc), acc + h(t) + gap), 0);
  const shown = Math.min(front.length, visible);
  const stackHeight = !front.length
    ? 0
    : expanded
      ? offsets[front.length - 1] + h(front[front.length - 1])
      : h(front[0]) + (shown - 1) * PEEK;

  const onHeight = useCallback((id: ToastId, px: number) => {
    setHeights((v) => (v[String(id)] === px ? v : { ...v, [String(id)]: px }));
  }, []);

  return (
    <section
      aria-label="Notifications"
      className={`${strategy === "fixed" ? "fixed" : "absolute"} ${place[position]} z-50 w-[min(22rem,100%)] p-4 ${className ?? ""}`}
    >
      <style href="swipe-toast" precedence="default">
        {css}
      </style>
      <ol
        aria-live="polite"
        className="relative transition-[height] duration-300"
        style={{ height: stackHeight }}
        onPointerEnter={() => setExpanded(true)}
        onPointerLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setExpanded(false)}
      >
        <AnimatePresence initial={false}>
          {front.map((t, i) => (
            <Toast
              key={t.id}
              toast={t}
              index={i}
              total={front.length}
              visible={visible}
              expanded={expanded}
              y={dir * (expanded ? offsets[i] : i * PEEK)}
              top={top}
              duration={duration}
              onHeight={onHeight}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}

interface ToastProps {
  toast: ToastItem;
  index: number;
  total: number;
  visible: number;
  expanded: boolean;
  y: number;
  top: boolean;
  duration: number;
  onHeight: (id: ToastId, px: number) => void;
  onDismiss: (id: ToastId) => void;
}

function Toast({ toast, index, total, visible, expanded, y, top, duration, onHeight, onDismiss }: ToastProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const [dragging, setDragging] = useState(false);
  const leaving = useRef(false);
  const x = useMotionValue(0);
  const fade = useTransform(x, [-220, 0, 220], [0, 1, 0]);
  const { Icon, color } = tones[toast.tone ?? "default"];
  const hidden = index >= visible && !expanded;
  const tucked = index > 0 && !expanded;

  useLayoutEffect(() => {
    if (ref.current) onHeight(toast.id, ref.current.offsetHeight);
  }, [toast.id, onHeight]);

  const leave = (sign: number, velocity = 0) => {
    if (leaving.current) return;
    leaving.current = true;
    if (reduce || !sign) return onDismiss(toast.id);
    animate(x, sign * 440, { type: "spring", stiffness: 260, damping: 32, velocity }).then(() => onDismiss(toast.id));
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > 90 || Math.abs(velocity.x) > 600) leave(Math.sign(offset.x || velocity.x), velocity.x);
  };

  const onKey = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === "Escape" || e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      leave(1);
    }
  };

  return (
    <motion.li
      ref={ref}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
      onKeyDown={onKey}
      className={`absolute inset-x-0 ${top ? "top-0" : "bottom-0"} rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring ${hidden ? "pointer-events-none" : ""}`}
      style={{ zIndex: total - index, transformOrigin: top ? "top center" : "bottom center" }}
      initial={{ y: top ? -36 : 36, opacity: 0, scale: 0.9 }}
      animate={{ y, opacity: hidden ? 0 : 1, scale: expanded ? 1 : 1 - index * 0.06 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
    >
      <motion.div
        drag={hidden ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragStart={() => setDragging(true)}
        onDragEnd={onDragEnd}
        style={{ x, opacity: fade, touchAction: "pan-y" }}
        className="relative flex cursor-grab items-start gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 pr-9 shadow-lg shadow-black/20 select-none active:cursor-grabbing"
      >
        <motion.div
          className="flex min-w-0 flex-1 items-start gap-3"
          animate={{ opacity: tucked ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <Icon aria-hidden className="mt-0.5 size-4 shrink-0" style={{ color }} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{toast.title}</p>
            {toast.description && <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>}
          </div>
        </motion.div>
        <button
          type="button"
          aria-label="Dismiss notification"
          tabIndex={hidden ? -1 : 0}
          onClick={() => leave(0)}
          className="absolute top-2 right-2 grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-3.5" />
        </button>
        {duration > 0 && (
          <span aria-hidden className="absolute inset-x-3 bottom-1 h-0.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block size-full origin-left rounded-full"
              style={{
                background: color,
                animation: `swipe-toast-timer ${duration}ms linear forwards`,
                animationPlayState: expanded || dragging ? "paused" : "running",
              }}
              onAnimationEnd={() => leave(0)}
            />
          </span>
        )}
      </motion.div>
    </motion.li>
  );
}
