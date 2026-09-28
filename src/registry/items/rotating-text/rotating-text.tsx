"use client";

import { useEffect, useState } from "react";

const css = `@keyframes rotating-text-in{from{transform:translateY(100%);opacity:0;filter:blur(4px)}to{transform:none;opacity:1;filter:none}}`;

export interface RotatingTextProps {
  words: string[];
  /** Ms each word stays on screen. */
  interval?: number;
  className?: string;
}

export function RotatingText({
  words,
  interval = 2000,
  className,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={className} style={{ display: "inline-flex", overflow: "hidden", verticalAlign: "bottom" }}>
      <style href="rotating-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{words.join(", ")}</span>
      <span
        key={index}
        aria-hidden
        style={{ display: "inline-block", animation: "rotating-text-in .5s cubic-bezier(.2,.7,.2,1)" }}
      >
        {words[index % words.length]}
      </span>
    </span>
  );
}
