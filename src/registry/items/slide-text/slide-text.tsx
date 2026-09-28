"use client";

import { Fragment, type CSSProperties } from "react";

const css = `
.slide-text{display:inline-block;cursor:pointer}
.slide-text .st-c{position:relative;display:inline-block;overflow:hidden;vertical-align:top;line-height:1.2}
.slide-text .st-i{display:inline-block;white-space:pre;transition:transform var(--st-d) cubic-bezier(.7,0,.2,1) calc(var(--o)*var(--st-s))}
.slide-text .st-i+.st-i{position:absolute;left:0;top:calc(100% * var(--st-dir));color:var(--st-c,inherit)}
.slide-text:hover .st-i,:focus-visible>.slide-text .st-i,.slide-text[data-active] .st-i{transform:translateY(calc(-100% * var(--st-dir)))}
@media (prefers-reduced-motion:reduce){.slide-text .st-i{transition-duration:0s;transition-delay:0s}}
`;

export interface SlideTextProps {
  text: string;
  /** Color of the incoming letters. */
  hoverColor?: string;
  /** Direction the letters travel. */
  direction?: "up" | "down";
  /** Where the stagger starts. */
  from?: "start" | "center" | "end";
  /** Delay between letters, in ms. */
  stagger?: number;
  /** Slide duration of each letter, in ms. */
  duration?: number;
  /** Keep the swapped state, e.g. for an active link. */
  active?: boolean;
  className?: string;
}

export function SlideText({
  text,
  hoverColor = "#a3e635",
  direction = "up",
  from = "start",
  stagger = 25,
  duration = 500,
  active = false,
  className,
}: SlideTextProps) {
  const chars = Array.from(text);
  const n = chars.length;
  const order = (i: number) =>
    from === "end" ? n - 1 - i : from === "center" ? Math.abs(i - (n - 1) / 2) : i;
  const words = text.split(" ");
  let i = 0;

  return (
    <span
      className={`slide-text ${className ?? ""}`}
      data-active={active || undefined}
      style={
        {
          "--st-s": `${stagger}ms`,
          "--st-d": `${duration}ms`,
          "--st-dir": direction === "up" ? 1 : -1,
          "--st-c": hoverColor || undefined,
        } as CSSProperties
      }
    >
      <style href="slide-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => {
        const letters = Array.from(word).map((c, k) => {
          const o = order(i++);
          return (
            <span key={k} className="st-c" style={{ "--o": o } as CSSProperties}>
              <span className="st-i">{c}</span>
              <span className="st-i">{c}</span>
            </span>
          );
        });
        i++;
        return (
          <Fragment key={w}>
            <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {letters}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        );
      })}
    </span>
  );
}
