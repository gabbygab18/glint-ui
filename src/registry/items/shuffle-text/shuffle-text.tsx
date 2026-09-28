"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

const css = `@keyframes shuffle-text-spin{from{transform:translateY(0)}to{transform:translateY(var(--shuffle-to))}}`;

export interface ShuffleTextProps {
  text: string;
  /** Ms each reel spins before landing. */
  duration?: number;
  /** Ms between neighbouring reels starting. */
  stagger?: number;
  /** Random glyphs each reel passes before the final one. */
  spins?: number;
  /** Glyphs the reels are filled with. */
  characters?: string;
  /** Spin again on every hover. */
  shuffleOnHover?: boolean;
  className?: string;
}

type Run = { id: number; reels: string[][] };

export function ShuffleText({
  text,
  duration = 900,
  stagger = 45,
  spins = 8,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#&%",
  shuffleOnHover = true,
  className,
}: ShuffleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState<Run | null>(null);
  const busyUntil = useRef(0);
  const chars = Array.from(text);

  const shuffle = useCallback(() => {
    const now = performance.now();
    if (now < busyUntil.current) return;
    const letters = Array.from(text);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    busyUntil.current = still ? 0 : now + duration + letters.length * stagger;
    const pick = () => characters[Math.floor(Math.random() * characters.length)] ?? "";
    setRun((r) => ({
      id: (r?.id ?? 0) + 1,
      reels: letters.map((c) => (still || c.trim() === "" ? [] : Array.from({ length: Math.max(1, spins) }, pick))),
    }));
  }, [text, duration, stagger, spins, characters]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        busyUntil.current = 0;
        shuffle();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [shuffle]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", opacity: run ? 1 : 0 }}
      onMouseEnter={shuffleOnHover ? shuffle : undefined}
    >
      <style href="shuffle-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      <span aria-hidden style={{ whiteSpace: "pre" }}>
        {chars.map((c, i) => {
          const reel = run?.reels[i] ?? [];
          if (!reel.length)
            return (
              <span key={i} style={{ display: "inline-block" }}>
                {c}
              </span>
            );
          // Random glyphs, the final letter, and one spare below it for the overshoot.
          const column = [...reel, c, reel[0]];
          const to = (-reel.length / column.length) * 100;
          return (
            <span
              key={`${run?.id}-${i}`}
              style={{ position: "relative", display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
            >
              <span style={{ visibility: "hidden" }}>{c}</span>
              <span
                style={
                  {
                    position: "absolute",
                    inset: "0 -0.5em auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    "--shuffle-to": `${to}%`,
                    animation: `shuffle-text-spin ${duration}ms cubic-bezier(.2,.9,.25,1.03) ${i * stagger}ms both`,
                  } as CSSProperties
                }
              >
                {column.map((g, k) => (
                  <span key={k} style={{ opacity: k === reel.length ? 1 : 0.4 }}>
                    {g}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
