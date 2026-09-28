"use client";

import { Fragment, useRef } from "react";

const effects: Record<string, (accent: string) => Keyframe[]> = {
  wave: (c) => [
    { transform: "none" },
    { transform: "translateY(-0.4em) rotate(-12deg)", color: c, offset: 0.35 },
    { transform: "translateY(0.06em) rotate(5deg)", offset: 0.68 },
    { transform: "none" },
  ],
  bounce: (c) => [
    { transform: "none" },
    { transform: "translateY(-0.5em) scale(1.08, 0.94)", color: c, offset: 0.35 },
    { transform: "translateY(0.04em) scale(1.1, 0.88)", offset: 0.62 },
    { transform: "translateY(-0.06em) scale(0.97, 1.03)", offset: 0.8 },
    { transform: "none" },
  ],
  spin: (c) => [
    { transform: "rotate(0deg)" },
    { transform: "translateY(-0.25em) rotate(180deg) scale(1.1)", color: c, offset: 0.5 },
    { transform: "rotate(360deg)" },
  ],
  flip: (c) => [
    { transform: "perspective(400px) rotateX(0deg)" },
    { transform: "perspective(400px) rotateX(180deg)", color: c, offset: 0.5 },
    { transform: "perspective(400px) rotateX(360deg)" },
  ],
};

export interface StaggerCharsProps {
  text: string;
  /** Motion each character performs. */
  effect?: "wave" | "bounce" | "spin" | "flip";
  /** Where the wave starts. */
  direction?: "start" | "end" | "center" | "edges" | "random";
  /** Delay between characters, in ms. */
  stagger?: number;
  /** Duration of each character's motion, in ms. */
  duration?: number;
  /** Color flashed at the peak of the motion. */
  accent?: string;
  className?: string;
}

export function StaggerChars({
  text,
  effect = "wave",
  direction = "start",
  stagger = 35,
  duration = 700,
  accent = "#a3e635",
  className,
}: StaggerCharsProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const busy = useRef(0);

  const play = () => {
    const els = ref.current?.querySelectorAll<HTMLElement>("[data-sc]");
    if (!els?.length || performance.now() < busy.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = els.length;
    const mid = (n - 1) / 2;
    const order = (i: number) =>
      direction === "end"
        ? n - 1 - i
        : direction === "center"
          ? Math.abs(i - mid)
          : direction === "edges"
            ? mid - Math.abs(i - mid)
            : direction === "random"
              ? (((i + 1) * 7919) % 97) / 97 * (n - 1)
              : i;
    const frames = (effects[effect] ?? effects.wave)(accent);
    let max = 0;
    els.forEach((el, i) => {
      const delay = order(i) * stagger;
      max = Math.max(max, delay);
      el.animate(frames, { duration, delay, easing: "cubic-bezier(.3,.7,.3,1)" });
    });
    busy.current = performance.now() + max + duration;
  };

  const words = text.split(" ");

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", cursor: "default" }}
      onPointerEnter={play}
      onClick={play}
    >
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((c, k) => (
              <span key={k} data-sc style={{ display: "inline-block", transformOrigin: "50% 70%" }}>
                {c}
              </span>
            ))}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
