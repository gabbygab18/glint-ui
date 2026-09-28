"use client";

import { useEffect, useState, type TransitionEvent } from "react";
import { cn } from "@/lib/utils";

export interface TextLoopProps {
  items: string[];
  /** Ms between steps. */
  interval?: number;
  /** Ms for one slide. */
  duration?: number;
  /** Lines shown in the window (odd numbers keep the active line centered). */
  visibleLines?: number;
  /** Blur and dim lines that are not active. */
  dimInactive?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}

const LINE = 1.2; // em per line

export function TextLoop({
  items,
  interval = 2200,
  duration = 800,
  visibleLines = 3,
  dimInactive = true,
  align = "left",
  className,
}: TextLoopProps) {
  const [step, setStep] = useState(0);
  const [instant, setInstant] = useState(false);
  const n = items.length;
  const pad = Math.floor(Math.max(1, visibleLines) / 2);
  const i = Math.min(step, n);

  useEffect(() => {
    if (n < 2) return;
    const id = window.setInterval(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // At the cloned end, wait for the snap back to 0 before moving on.
      setStep((s) => (still ? (s + 1) % n : s >= n ? s : s + 1));
    }, interval);
    return () => window.clearInterval(id);
  }, [n, interval]);

  useEffect(() => {
    if (!instant) return;
    let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => setInstant(false))));
    return () => cancelAnimationFrame(raf);
  }, [instant]);

  const onEnd = (e: TransitionEvent) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform" || step < n) return;
    setInstant(true);
    setStep(0);
  };

  // pad lines before, the list, then pad + 1 wrapped lines so the loop point looks identical.
  const track = Array.from({ length: n + pad * 2 + 1 }, (_, k) => items[(((k - pad) % n) + n) % n]);
  const ease = "cubic-bezier(.76,0,.24,1)";
  const transition = instant ? "none" : `${duration}ms ${ease}`;
  const edge = (pad / Math.max(1, visibleLines)) * 90;
  const fade = `linear-gradient(transparent, #000 ${edge}%, #000 ${100 - edge}%, transparent)`;

  return (
    <span
      className={cn("relative inline-block overflow-hidden align-middle", className)}
      style={{ height: `${Math.max(1, visibleLines) * LINE}em`, maskImage: pad ? fade : undefined, WebkitMaskImage: pad ? fade : undefined }}
    >
      <span className="sr-only">{items.join(", ")}</span>
      {n > 0 && (
        <span
          aria-hidden
          onTransitionEnd={onEnd}
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: align,
            transform: `translateY(${-i * LINE}em)`,
            transition: instant ? "none" : `transform ${transition}`,
          }}
        >
          {track.map((t, k) => {
            const d = Math.abs(k - i - pad);
            return (
              <span
                key={k}
                style={{
                  height: `${LINE}em`,
                  lineHeight: `${LINE}em`,
                  whiteSpace: "nowrap",
                  opacity: dimInactive ? [1, 0.3, 0.12][Math.min(d, 2)] : 1,
                  filter: dimInactive && d ? `blur(${Math.min(d, 2) * 1.5}px)` : "none",
                  transition: instant ? "none" : `opacity ${transition}, filter ${transition}`,
                }}
              >
                {t}
              </span>
            );
          })}
        </span>
      )}
    </span>
  );
}
