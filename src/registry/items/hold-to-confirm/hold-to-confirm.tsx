"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export interface HoldToConfirmProps {
  /** Ms the button must be held. */
  duration?: number;
  label?: string;
  confirmedLabel?: string;
  color?: string;
  onConfirm?: () => void;
  className?: string;
}

export function HoldToConfirm({
  duration = 1500,
  label = "Hold to delete",
  confirmedLabel = "Deleted",
  color = "#ef4444",
  onConfirm,
  className,
}: HoldToConfirmProps) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const start = () => {
    if (done) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      setDone(true);
      onConfirm?.();
      timer.current = window.setTimeout(() => setDone(false), 2000);
    }, duration);
  };

  const cancel = () => {
    if (done) return;
    window.clearTimeout(timer.current);
    setHolding(false);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, down: boolean) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (down && !e.repeat) start();
    if (!down) cancel();
  };

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => onKey(e, true)}
      onKeyUp={(e) => onKey(e, false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative h-11 select-none overflow-hidden rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground ${className ?? ""}`}
      style={{ touchAction: "none" }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0"
        style={{
          width: holding || done ? "100%" : "0%",
          background: color,
          opacity: 0.9,
          transition: holding ? `width ${duration}ms linear` : "width 250ms ease-out",
        }}
      />
      <span className="relative" aria-live="polite">
        {done ? confirmedLabel : label}
      </span>
    </button>
  );
}
