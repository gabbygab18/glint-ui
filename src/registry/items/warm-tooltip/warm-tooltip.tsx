"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

export interface WarmTooltipProps {
  content: ReactNode;
  /** The trigger: one focusable element (button, link...). */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  /** Ms before the tooltip opens on hover or focus. */
  delay?: number;
  /** How far the bubble drifts toward the pointer, 0-1. */
  follow?: number;
  /** Warm glow under the bubble. */
  glow?: string;
  className?: string;
}

export function WarmTooltip({
  content,
  children,
  side = "top",
  delay = 150,
  follow = 0.3,
  glow = "#fb923c",
  className,
}: WarmTooltipProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const wrap = useRef<HTMLSpanElement>(null);

  const mx = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 18 });
  // Follow-through: the bubble leans against the direction it is being pulled.
  const rotate = useTransform(() => Math.max(-8, Math.min(8, (mx.get() - x.get()) * 0.25)));
  const top = side === "top";

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
    mx.set(0);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onMove = (e: PointerEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (r && !reduce) mx.set((e.clientX - (r.left + r.width / 2)) * follow);
  };

  return (
    <span
      ref={wrap}
      className="relative inline-flex"
      onPointerEnter={show}
      onPointerMove={onMove}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {isValidElement(children) ? cloneElement(children, { "aria-describedby": open ? id : undefined }) : children}
      <AnimatePresence>
        {open && (
          <span
            className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 ${top ? "bottom-full pb-2.5" : "top-full pt-2.5"}`}
          >
            <motion.span
              id={id}
              role="tooltip"
              className={`relative block w-max max-w-64 rounded-xl bg-foreground px-3 py-1.5 text-sm font-medium text-background ${className ?? ""}`}
              style={{
                x,
                rotate,
                transformOrigin: top ? "50% 100%" : "50% 0%",
                boxShadow: `0 10px 28px -8px ${glow}, 0 0 0 1px color-mix(in oklab, ${glow} 35%, transparent)`,
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: top ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: top ? 6 : -6, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 520, damping: 14, mass: 0.7 }}
            >
              {content}
              <span
                aria-hidden
                className={`absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-foreground ${top ? "-bottom-1" : "-top-1"}`}
              />
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
