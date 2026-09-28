"use client";

import { Fragment, type CSSProperties } from "react";

const css = `
.fancy-text{display:inline-block;cursor:default}
.fancy-text .ft-l{position:relative;display:inline-block;transition:transform var(--ft-d) cubic-bezier(.3,1.5,.5,1) calc(var(--i)*var(--ft-s))}
.fancy-text .ft-o{color:transparent;-webkit-text-stroke:var(--ft-w) var(--ft-stroke)}
.fancy-text .ft-f{position:absolute;inset:0;color:transparent;background-image:var(--ft-g);background-size:var(--ft-n) 100%;background-position:var(--ft-p) 0;-webkit-background-clip:text;background-clip:text;clip-path:inset(-20% 100% -20% 0);transition:clip-path var(--ft-d) cubic-bezier(.6,0,.2,1) calc(var(--i)*var(--ft-s))}
.fancy-text:hover .ft-l,.fancy-text:focus-visible .ft-l,.fancy-text[data-active] .ft-l{transform:translateY(calc(var(--ft-lift)*-1))}
.fancy-text:hover .ft-f,.fancy-text:focus-visible .ft-f,.fancy-text[data-active] .ft-f{clip-path:inset(-20% -10% -20% 0)}
@media (prefers-reduced-motion:reduce){.fancy-text .ft-l,.fancy-text .ft-f{transition-duration:0s;transition-delay:0s}}
`;

export interface FancyTextProps {
  text: string;
  /** Gradient stops for the filled state. */
  colors?: string[];
  /** Outline color in the resting state. Defaults to a faint foreground. */
  strokeColor?: string;
  /** Outline width, in px. */
  strokeWidth?: number;
  /** How far each letter rises on hover, in em. */
  lift?: number;
  /** Delay between letters, in ms. */
  stagger?: number;
  /** Duration of each letter's sweep, in ms. */
  duration?: number;
  /** Keep the filled state on, e.g. to drive it from a parent. */
  active?: boolean;
  className?: string;
}

export function FancyText({
  text,
  colors = ["#a3e635", "#22d3ee", "#a78bfa"],
  strokeColor = "color-mix(in oklab, var(--foreground, #fff) 55%, transparent)",
  strokeWidth = 1.5,
  lift = 0.08,
  stagger = 40,
  duration = 600,
  active = false,
  className,
}: FancyTextProps) {
  const chars = Array.from(text);
  const n = Math.max(chars.length, 1);
  const words = text.split(" ");
  let i = 0;

  return (
    <span
      className={`fancy-text ${className ?? ""}`}
      data-active={active || undefined}
      style={
        {
          "--ft-g": `linear-gradient(90deg, ${colors.join(", ")})`,
          "--ft-n": `${n * 100}%`,
          "--ft-stroke": strokeColor,
          "--ft-w": `${strokeWidth}px`,
          "--ft-lift": `${lift}em`,
          "--ft-s": `${stagger}ms`,
          "--ft-d": `${duration}ms`,
        } as CSSProperties
      }
    >
      <style href="fancy-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((c, k) => {
              const idx = i++;
              const style = { "--i": idx, "--ft-p": `${n > 1 ? (idx / (n - 1)) * 100 : 0}%` } as CSSProperties;
              return (
                <span key={k} className="ft-l" style={style}>
                  <span className="ft-o">{c}</span>
                  <span className="ft-f">{c}</span>
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && (i++, " ")}
        </Fragment>
      ))}
    </span>
  );
}
