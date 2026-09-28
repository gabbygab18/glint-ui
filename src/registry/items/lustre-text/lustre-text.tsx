"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";

const css = `
.lustre-text{display:inline-block;color:transparent;-webkit-background-clip:text;background-clip:text;background-repeat:no-repeat;background-size:250% 100%,100% 100%;background-position:100% 0,0 0;animation:lustre-sweep var(--lu-d) cubic-bezier(.45,0,.25,1) infinite}
.lustre-text[data-tracking]{animation:none;background-position:var(--lu-x) 0,0 0;transition:background-position .25s ease-out}
@keyframes lustre-sweep{0%{background-position:100% 0,0 0}70%,100%{background-position:0% 0,0 0}}
@media (prefers-reduced-motion:reduce){.lustre-text{animation:none;background-position:40% 0,0 0}}
`;

const metals = {
  silver: ["#d4d4d8", "#8b8b94", "#46464e", "#1c1c20", "#5f5f68", "#b4b4bc"],
  gold: ["#f5d98a", "#c08a2e", "#7a4c0e", "#3d2505", "#9c6b1f", "#e3b95c"],
  rose: ["#f3c6cf", "#c77a88", "#86424f", "#481c25", "#a45a68", "#e4a9b4"],
  titanium: ["#cfdbe7", "#7b8ca2", "#364355", "#141b25", "#55687f", "#b2c1d0"],
};

export interface LustreTextProps {
  text: string;
  /** Metal finish. */
  metal?: keyof typeof metals;
  /** Seconds per lustre sweep (includes a short rest). */
  speed?: number;
  /** Highlight follows the pointer while hovered. */
  followPointer?: boolean;
  /** Strength of the bevel shading, 0–1. */
  bevel?: number;
  className?: string;
}

export function LustreText({
  text,
  metal = "silver",
  speed = 4,
  followPointer = true,
  bevel = 0.6,
  className,
}: LustreTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [a, b, c, d, e, f] = metals[metal] ?? metals.silver;

  const move = (ev: PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!followPointer || !el) return;
    const r = el.getBoundingClientRect();
    const fx = (ev.clientX - r.left) / r.width;
    el.dataset.tracking = "";
    el.style.setProperty("--lu-x", `${((1.25 - fx) / 1.5) * 100}%`);
  };
  const leave = () => ref.current?.removeAttribute("data-tracking");

  return (
    <span
      ref={ref}
      className={`lustre-text ${className ?? ""}`}
      onPointerMove={move}
      onPointerLeave={leave}
      style={
        {
          "--lu-d": `${speed}s`,
          backgroundImage: `linear-gradient(110deg, transparent 36%, rgba(255,255,255,.25) 44%, #fff 50%, rgba(255,255,255,.25) 56%, transparent 64%), linear-gradient(180deg, ${a} 0%, ${b} 32%, ${c} 49%, ${d} 51%, ${e} 72%, ${f} 100%)`,
          filter: `drop-shadow(0 -1px 0 rgba(255,255,255,${0.35 * bevel})) drop-shadow(0 1px 0 rgba(0,0,0,${0.9 * bevel})) drop-shadow(0 3px 2px rgba(0,0,0,${0.5 * bevel}))`,
        } as CSSProperties
      }
    >
      <style href="lustre-text" precedence="default">
        {css}
      </style>
      {text}
    </span>
  );
}
