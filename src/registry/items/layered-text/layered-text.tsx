"use client";

import { Fragment, type CSSProperties } from "react";

const css = `
.layered-text{display:inline-block;cursor:default;isolation:isolate}
.layered-text .lt-c{position:relative;display:inline-block}
.layered-text .lt-l{position:absolute;inset:0;pointer-events:none;transform:translate(0,0);transition:transform var(--lt-d) cubic-bezier(.34,1.56,.64,1) calc(var(--i)*var(--lt-s) + var(--j)*40ms)}
.layered-text .lt-top{position:relative;z-index:1}
.layered-text:hover .lt-l,.layered-text[data-active] .lt-l{transform:translate(calc(var(--lt-x)*var(--k)),calc(var(--lt-y)*var(--k)))}
@media (prefers-reduced-motion:reduce){.layered-text .lt-l{transition:none}}
`;

export interface LayeredTextProps {
  text: string;
  /** One color per layer, nearest first. */
  colors?: string[];
  /** Distance between layers when fanned out, in px. */
  offset?: number;
  /** Fan-out direction in degrees (0 = right, 90 = down). */
  angle?: number;
  /** Delay between letters, in ms. */
  stagger?: number;
  /** Transition duration, in ms. */
  duration?: number;
  /** Keep the layers fanned out. */
  active?: boolean;
  className?: string;
}

export function LayeredText({
  text,
  colors = ["#a3e635", "#22d3ee", "#818cf8", "#f472b6"],
  offset = 6,
  angle = 45,
  stagger = 30,
  duration = 700,
  active = false,
  className,
}: LayeredTextProps) {
  const rad = (angle * Math.PI) / 180;
  const words = text.split(" ");
  let i = 0;

  return (
    <span
      className={`layered-text ${className ?? ""}`}
      data-active={active || undefined}
      style={
        {
          "--lt-x": `${(Math.cos(rad) * offset).toFixed(2)}px`,
          "--lt-y": `${(Math.sin(rad) * offset).toFixed(2)}px`,
          "--lt-s": `${stagger}ms`,
          "--lt-d": `${duration}ms`,
        } as CSSProperties
      }
    >
      <style href="layered-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((c, k) => {
              const idx = i++;
              return (
                <span key={k} className="lt-c" style={{ "--i": idx } as CSSProperties}>
                  {colors
                    .map((color, j) => (
                      <span key={j} className="lt-l" style={{ color, "--j": j, "--k": j + 1 } as CSSProperties}>
                        {c}
                      </span>
                    ))
                    .reverse()}
                  <span className="lt-top">{c}</span>
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
