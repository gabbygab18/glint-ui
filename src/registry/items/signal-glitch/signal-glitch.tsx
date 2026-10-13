"use client";

import type { CSSProperties } from "react";

const css = `
.signal-glitch{position:relative;display:inline-block}
.signal-glitch::before,.signal-glitch::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none}
.signal-glitch::before{transform:translateX(3px);text-shadow:-2px 0 #ff2bd6;animation:glitch-a var(--glitch-speed) infinite linear alternate-reverse}
.signal-glitch::after{transform:translateX(-3px);text-shadow:2px 0 #2bf0ff;animation:glitch-b calc(var(--glitch-speed) * 1.4) infinite linear alternate-reverse}
.signal-glitch[data-hover-only]:not(:hover)::before,.signal-glitch[data-hover-only]:not(:hover)::after{content:none}
@keyframes glitch-a{0%{clip-path:inset(20% 0 55% 0)}20%{clip-path:inset(62% 0 8% 0)}40%{clip-path:inset(40% 0 33% 0)}60%{clip-path:inset(82% 0 4% 0)}80%{clip-path:inset(8% 0 72% 0)}100%{clip-path:inset(30% 0 44% 0)}}
@keyframes glitch-b{0%{clip-path:inset(70% 0 6% 0)}25%{clip-path:inset(12% 0 64% 0)}50%{clip-path:inset(48% 0 22% 0)}75%{clip-path:inset(4% 0 86% 0)}100%{clip-path:inset(56% 0 18% 0)}}
`;

export interface SignalGlitchProps {
  text: string;
  /** Seconds per glitch loop; lower is more frantic. */
  speed?: number;
  /** Only glitch while hovered. */
  hoverOnly?: boolean;
  className?: string;
}

export function SignalGlitch({ text, speed = 0.6, hoverOnly = false, className }: SignalGlitchProps) {
  return (
    <>
      <style href="signal-glitch" precedence="default">
        {css}
      </style>
      <span
        className={`signal-glitch ${className ?? ""}`}
        data-text={text}
        data-hover-only={hoverOnly || undefined}
        style={{ "--glitch-speed": `${speed}s` } as CSSProperties}
      >
        {text}
      </span>
    </>
  );
}
