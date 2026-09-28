"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";

const css = `
.blur-text-piece{display:inline-block;opacity:0;white-space:pre;will-change:transform,filter,opacity}
[data-blur-shown] .blur-text-piece{animation:blur-text-in var(--bt-d) cubic-bezier(.2,.65,.3,1) both;animation-delay:calc(var(--i) * var(--bt-s))}
@keyframes blur-text-in{0%{opacity:0;filter:blur(14px);transform:translateY(var(--bt-y))}55%{opacity:.65;filter:blur(4px);transform:translateY(calc(var(--bt-y) * -.12))}100%{opacity:1;filter:blur(0);transform:none}}
@media (prefers-reduced-motion:reduce){.blur-text-piece{opacity:1;animation:none!important}}
`;

export interface BlurTextProps {
  text?: string;
  /** Animate each word or each letter. */
  animateBy?: "words" | "letters";
  /** Where pieces come from. */
  direction?: "top" | "bottom";
  /** Delay between pieces, in ms. */
  delay?: number;
  /** Duration of each piece, in ms. */
  duration?: number;
  /** Replay every time it re-enters the viewport. */
  once?: boolean;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
}

export function BlurText({
  text = "Isn't this so cool?!",
  animateBy = "words",
  direction = "top",
  delay = 90,
  duration = 900,
  once = true,
  as: Tag = "p",
  className,
}: BlurTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) setShown(false);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const words = text.split(" ");
  let i = 0;
  const piece = (content: string, key: number) => (
    <span key={key} className="blur-text-piece" style={{ "--i": i++ } as CSSProperties}>
      {content}
    </span>
  );

  return (
    <Tag
      ref={ref as never}
      className={className}
      data-blur-shown={shown || undefined}
      style={
        {
          "--bt-d": `${duration}ms`,
          "--bt-s": `${delay}ms`,
          "--bt-y": direction === "top" ? "-0.7em" : "0.7em",
        } as CSSProperties
      }
    >
      <style href="blur-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      {/* Keyed so changing the options restarts the entrance. */}
      <span aria-hidden key={`${text}|${animateBy}|${direction}|${delay}|${duration}`}>
        {words.map((word, w) => (
          <Fragment key={w}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {animateBy === "words" ? piece(word, 0) : Array.from(word).map(piece)}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
