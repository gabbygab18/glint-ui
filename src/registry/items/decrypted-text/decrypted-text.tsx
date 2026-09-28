"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DecryptedTextProps {
  text: string;
  /** Ms between reveal steps. */
  speed?: number;
  characters?: string;
  revealDirection?: "start" | "end" | "random";
  /** Start when scrolled into view, or on every hover. */
  trigger?: "view" | "hover";
  className?: string;
}

export function DecryptedText({
  text,
  speed = 40,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*",
  revealDirection = "start",
  trigger = "view",
  className,
}: DecryptedTextProps) {
  const [output, setOutput] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const run = useCallback(() => {
    window.clearInterval(timer.current);
    const chars = Array.from(text);
    const order = chars.map((_, i) => i);
    if (revealDirection === "end") order.reverse();
    if (revealDirection === "random") order.sort(() => Math.random() - 0.5);

    const revealed = new Set<number>();
    const scramble = () =>
      chars
        .map((c, i) =>
          revealed.has(i) || c === " " ? c : characters[Math.floor(Math.random() * characters.length)],
        )
        .join("");

    setOutput(scramble());
    timer.current = window.setInterval(() => {
      revealed.add(order[revealed.size]);
      setOutput(scramble());
      if (revealed.size >= order.length) window.clearInterval(timer.current);
    }, speed);
  }, [text, speed, characters, revealDirection]);

  useEffect(() => {
    if (trigger !== "view" || !ref.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [trigger, run, text]);

  useEffect(() => () => window.clearInterval(timer.current), []);

  return (
    <span ref={ref} className={className} onMouseEnter={trigger === "hover" ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{output}</span>
    </span>
  );
}
