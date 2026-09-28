"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageTransitionProps {
  /** Change this (e.g. the active tab or route) to play the transition. */
  transitionKey: string | number;
  /** The current view. Swapped in while the curtain is closed. */
  children: ReactNode;
  /** Number of curtain columns. 1 = a plain wipe. */
  columns?: number;
  /** Curtain layers, back to front. */
  colors?: string[];
  /** Ms for each half (cover, then reveal). */
  duration?: number;
  /** Ms between neighboring columns. */
  stagger?: number;
  /** Direction the curtain travels. */
  direction?: "up" | "down";
  className?: string;
}

const EASE = "cubic-bezier(.76,0,.24,1)";
const COLORS = ["#c6ff3d", "#18181b"];

export function PageTransition({
  transitionKey,
  children,
  columns = 5,
  colors = COLORS,
  duration = 550,
  stagger = 55,
  direction = "up",
  className,
}: PageTransitionProps) {
  const [shownKey, setShownKey] = useState(transitionKey);
  const [stale, setStale] = useState<ReactNode>(children);
  // Keep a copy of the visible view so it can stay on screen while the curtain closes.
  if (shownKey === transitionKey && stale !== children) setStale(children);
  const content = shownKey === transitionKey ? children : stale;

  const cols = useRef<(HTMLDivElement | null)[]>([]);
  const body = useRef<HTMLDivElement>(null);
  const covered = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 1 : duration;
    const gap = reduced ? 0 : stagger;
    const nl = colors.length;
    const lag = dur * 0.18;
    const from = direction === "up" ? "bottom" : "top";
    const to = direction === "up" ? "top" : "bottom";
    const els = cols.current.slice(0, columns * nl).filter((c): c is HTMLDivElement => !!c);

    const reveal = () => {
      covered.current = false;
      els.forEach((el, i) => {
        const layer = Math.floor(i / columns);
        const current = getComputedStyle(el).transform;
        el.getAnimations().forEach((a) => a.cancel());
        el.animate(
          [
            { transform: current === "none" ? "scaleY(0)" : current, transformOrigin: to },
            { transform: "scaleY(0)", transformOrigin: to },
          ],
          { duration: dur, delay: (i % columns) * gap + (nl - 1 - layer) * lag, easing: EASE, fill: "forwards" },
        );
      });
      body.current?.animate(
        [
          { transform: `translateY(${direction === "up" ? 28 : -28}px)`, opacity: 0.4 },
          { transform: "none", opacity: 1 },
        ],
        { duration: dur * 1.4, delay: dur * 0.3, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
      );
    };

    if (shownKey === transitionKey) {
      // Switched back to the visible view mid-cover: just open the curtain again.
      if (covered.current) reveal();
      return;
    }
    let alive = true;
    covered.current = true;
    const cover = els.map((el, i) => {
      const layer = Math.floor(i / columns);
      const current = getComputedStyle(el).transform;
      el.getAnimations().forEach((a) => a.cancel());
      return el.animate(
        [
          { transform: current === "none" ? "scaleY(0)" : current, transformOrigin: from },
          { transform: "scaleY(1)", transformOrigin: from },
        ],
        { duration: dur, delay: (i % columns) * gap + layer * lag, easing: EASE, fill: "forwards" },
      );
    });

    Promise.all(cover.map((a) => a.finished))
      .then(() => {
        if (!alive) return;
        setShownKey(transitionKey);
        reveal();
      })
      .catch(() => {}); // cancelled by a newer transition
    return () => {
      alive = false;
    };
  }, [transitionKey, shownKey, columns, colors, duration, stagger, direction]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={body} className="size-full">
        {content}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
        {colors.map((color, layer) => (
          <div key={layer} className="absolute inset-0 flex">
            {Array.from({ length: columns }, (_, col) => (
              <div
                key={col}
                ref={(el) => {
                  cols.current[layer * columns + col] = el;
                }}
                className="h-full flex-1"
                style={{ background: color, transform: "scaleY(0)", marginLeft: col ? -1 : 0 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
