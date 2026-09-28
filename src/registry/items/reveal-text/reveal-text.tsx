"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const css = `
.reveal-text{position:relative;display:inline-block;cursor:default;white-space:nowrap}
.reveal-text .rt-m{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}
.reveal-text .rt-i{display:inline-block;transform:translateY(110%);transition:transform var(--rt-d) cubic-bezier(.2,.8,.2,1) calc(var(--i)*var(--rt-s))}
.reveal-text[data-shown] .rt-i{transform:none}
.reveal-text .rt-base{transition:opacity .5s ease}
.reveal-text .rt-img{position:absolute;inset:0;color:transparent;-webkit-background-clip:text;background-clip:text;background-size:115% auto;background-position:50% 50%;opacity:0;transition:opacity .5s ease,background-size 1.2s cubic-bezier(.2,.8,.2,1)}
.reveal-text[data-shown]:hover .rt-img{opacity:1;background-size:100% auto}
.reveal-text[data-shown]:hover .rt-base{opacity:0}
@media (prefers-reduced-motion:reduce){.reveal-text .rt-i{transition:none}}
`;

export interface RevealTextProps {
  text: string;
  /** Image shown through the letters on hover. */
  image: string;
  /** Delay between letters, in ms. */
  stagger?: number;
  /** Slide duration of each letter, in ms. */
  duration?: number;
  className?: string;
}

export function RevealText({ text, image, stagger = 45, duration = 900, className }: RevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chars = Array.from(text);
  const letters = (masked: boolean) =>
    chars.map((c, i) => (
      <span key={i} className={masked ? "rt-m" : undefined} style={masked ? undefined : { display: "inline-block" }}>
        <span className={masked ? "rt-i" : undefined} style={{ display: "inline-block", whiteSpace: "pre", "--i": i } as CSSProperties}>
          {c}
        </span>
      </span>
    ));

  return (
    <span
      ref={ref}
      className={`reveal-text ${className ?? ""}`}
      data-shown={shown || undefined}
      style={{ "--rt-s": `${stagger}ms`, "--rt-d": `${duration}ms` } as CSSProperties}
    >
      <style href="reveal-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="rt-base">
        {letters(true)}
      </span>
      <span aria-hidden className="rt-img" style={{ backgroundImage: `url("${image}")` }}>
        {letters(false)}
      </span>
    </span>
  );
}
