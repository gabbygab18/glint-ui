"use client";

import type { CSSProperties } from "react";

const css = `
.glitch-text{position:relative;display:inline-block}
.glitch-text::before,.glitch-text::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none}
.glitch-text::before{transform:translateX(3px);text-shadow:-2px 0 #ff2bd6;animation:glitch-a var(--glitch-speed) infinite linear alternate-reverse}
.glitch-text::after{transform:translateX(-3px);text-shadow:2px 0 #2bf0ff;animation:glitch-b calc(var(--glitch-speed) * 1.4) infinite linear alternate-reverse}
.glitch-text[data-hover-only]:not(:hover)::before,.glitch-text[data-hover-only]:not(:hover)::after{content:none}
@keyframes glitch-a{0%{clip-path:inset(20% 0 55% 0)}20%{clip-path:inset(62% 0 8% 0)}40%{clip-path:inset(40% 0 33% 0)}60%{clip-path:inset(82% 0 4% 0)}80%{clip-path:inset(8% 0 72% 0)}100%{clip-path:inset(30% 0 44% 0)}}
@keyframes glitch-b{0%{clip-path:inset(70% 0 6% 0)}25%{clip-path:inset(12% 0 64% 0)}50%{clip-path:inset(48% 0 22% 0)}75%{clip-path:inset(4% 0 86% 0)}100%{clip-path:inset(56% 0 18% 0)}}
`;

export interface GlitchTextProps {
  text: string;
  /** Seconds per glitch loop; lower is more frantic. */
  speed?: number;
  /** Only glitch while hovered. */
  hoverOnly?: boolean;
  className?: string;
}

export function GlitchText({ text, speed = 0.6, hoverOnly = false, className }: GlitchTextProps) {
  return (
    <>
      <style href="glitch-text" precedence="default">
        {css}
      </style>
      <span
        className={`glitch-text ${className ?? ""}`}
        data-text={text}
        data-hover-only={hoverOnly || undefined}
        style={{ "--glitch-speed": `${speed}s` } as CSSProperties}
      >
        {text}
      </span>
    </>
  );
}
