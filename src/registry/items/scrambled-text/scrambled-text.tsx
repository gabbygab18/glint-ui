"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";

const css = `
.scr-c{position:relative;display:inline-block;white-space:pre}
.scr-c[data-g]{color:transparent}
.scr-c[data-g]::after{content:attr(data-g);position:absolute;inset:0;text-align:center;color:var(--scr-color)}
`;

export interface ScrambledTextProps {
  text?: string;
  /** Pointer radius that scrambles characters, in px. */
  radius?: number;
  /** How long a character right under the pointer keeps scrambling, in ms. */
  duration?: number;
  /** Ms between glyph swaps. */
  speed?: number;
  /** Glyphs used while scrambling. */
  scrambleChars?: string;
  /** Color of scrambled glyphs. */
  scrambleColor?: string;
  className?: string;
}

export function ScrambledText({
  text = "Move your cursor across this paragraph. Every letter it passes dissolves into noise for a moment, then snaps right back into place as if nothing happened.",
  radius = 100,
  duration = 1200,
  speed = 50,
  scrambleChars = "!<>-_\\/[]{}=+*^?#01",
  scrambleColor = "#a3e635",
  className,
}: ScrambledTextProps) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLSpanElement>(".scr-c"));
    const until = new Float64Array(chars.length);
    const active = new Set<number>();
    let centers: { x: number; y: number }[] = [];
    let raf = 0;
    let lastSwap = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      centers = chars.map((c) => {
        const b = c.getBoundingClientRect();
        return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
      });
    };
    const glyph = () => scrambleChars[Math.floor(Math.random() * scrambleChars.length)] ?? "";

    const loop = (now: number) => {
      const swap = now - lastSwap >= speed;
      if (swap) lastSwap = now;
      for (const i of active) {
        if (now >= until[i]) {
          delete chars[i].dataset.g;
          active.delete(i);
        } else if (swap) chars[i].dataset.g = glyph();
      }
      raf = active.size ? requestAnimationFrame(loop) : 0;
    };

    const move = (e: PointerEvent) => {
      if (!centers.length) measure();
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const now = performance.now();
      centers.forEach((c, i) => {
        const d = Math.hypot(c.x - x, c.y - y);
        if (d >= radius || chars[i].textContent === " ") return;
        until[i] = Math.max(until[i], now + duration * (1 - d / radius));
        if (!active.has(i)) {
          active.add(i);
          chars[i].dataset.g = glyph();
        }
      });
      if (active.size && !raf) raf = requestAnimationFrame(loop);
    };
    const reset = () => (centers = []);

    el.addEventListener("pointerenter", reset);
    el.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", reset);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", reset);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("resize", reset);
      chars.forEach((c) => delete c.dataset.g);
    };
  }, [text, radius, duration, speed, scrambleChars]);

  const words = text.split(" ");
  return (
    <p ref={root} className={className} style={{ "--scr-color": scrambleColor } as CSSProperties}>
      <style href="scrambled-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <Fragment key={w}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {Array.from(word).map((c, i) => (
                <span key={i} className="scr-c">
                  {c}
                </span>
              ))}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </p>
  );
}
