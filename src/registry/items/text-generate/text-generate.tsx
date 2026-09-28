"use client";

import { Fragment, useEffect, useRef, useState } from "react";

const css = `@keyframes text-generate-blink{0%,45%{opacity:1}55%,100%{opacity:0}}`;

export interface TextGenerateProps {
  text: string;
  /** Delay between words, in ms. */
  stagger?: number;
  /** Fade/unblur duration of each word, in ms. */
  duration?: number;
  /** Starting blur of each word, in px. */
  blur?: number;
  /** Show a caret that follows the stream and blinks when done. */
  caret?: boolean;
  /** Caret color. */
  caretColor?: string;
  className?: string;
}

export function TextGenerate({
  text,
  stagger = 70,
  duration = 700,
  blur = 10,
  caret = true,
  caretColor = "#a3e635",
  className,
}: TextGenerateProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  const [count, setCount] = useState(0);
  const [prevText, setPrevText] = useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setCount(0);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const total = text.split(/\s+/).filter(Boolean).length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setCount(total), 0);
      return () => clearTimeout(t);
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || timer) return;
        io.disconnect();
        timer = setInterval(() => {
          setCount((c) => {
            if (c + 1 >= total) clearInterval(timer);
            return Math.min(c + 1, total);
          });
        }, Math.max(stagger, 16));
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [text, stagger]);

  const done = count >= words.length;
  const caretEl = (
    <span aria-hidden style={{ position: "relative", display: "inline-block", width: 0 }}>
      <span
        style={{
          position: "absolute",
          left: "0.12em",
          bottom: "-0.05em",
          width: "0.09em",
          height: "1em",
          borderRadius: 2,
          background: caretColor,
          boxShadow: `0 0 12px ${caretColor}`,
          animation: done ? "text-generate-blink 1s steps(1) infinite" : undefined,
        }}
      />
    </span>
  );

  return (
    <p ref={ref} className={className}>
      <style href="text-generate" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      {caret && count === 0 && caretEl}
      {words.map((word, i) => {
        const on = i < count;
        return (
          <Fragment key={i}>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                opacity: on ? 1 : 0,
                filter: on ? "blur(0px)" : `blur(${blur}px)`,
                transform: on ? "none" : "translateY(0.15em)",
                transition: `opacity ${duration}ms ease, filter ${duration}ms ease, transform ${duration}ms cubic-bezier(.2,.7,.2,1)`,
                willChange: on ? undefined : "opacity, filter",
              }}
            >
              {word}
            </span>
            {caret && i === count - 1 && caretEl}
            {i < words.length - 1 && " "}
          </Fragment>
        );
      })}
    </p>
  );
}
