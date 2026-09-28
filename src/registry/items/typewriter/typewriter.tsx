"use client";

import { useEffect, useState } from "react";

const css = `@keyframes typewriter-blink{50%{opacity:0}}`;

export interface TypewriterProps {
  words: string[];
  /** Ms per typed character. */
  typeSpeed?: number;
  /** Ms per deleted character. */
  deleteSpeed?: number;
  /** Ms to hold a finished word. */
  pause?: number;
  cursor?: string;
  className?: string;
}

export function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  pause = 1500,
  cursor = "|",
  className,
}: TypewriterProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[wordIndex % words.length] ?? "";

  useEffect(() => {
    if (!deleting && length >= word.length) {
      const id = window.setTimeout(() => setDeleting(true), pause);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(
      () => {
        if (deleting && length <= 1) {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }
        setLength((l) => Math.max(0, l + (deleting ? -1 : 1)));
      },
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => window.clearTimeout(id);
  }, [length, deleting, word, words.length, typeSpeed, deleteSpeed, pause]);

  return (
    <span className={className}>
      <style href="typewriter" precedence="default">
        {css}
      </style>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden>
        {word.slice(0, length)}
        <span style={{ animation: "typewriter-blink 1s steps(1) infinite" }}>{cursor}</span>
      </span>
    </span>
  );
}
