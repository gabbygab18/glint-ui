"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  /** Outline thickness as a percentage of the font size. */
  strokeWidth?: number;
  /** Ms for the full draw + fill sequence. */
  duration?: number;
  /** Fill once scrolled into view, or only while hovered. */
  trigger?: "view" | "hover";
  className?: string;
}

// Glyphs are laid out at 100 user units so stroke width and dash length scale with the font.
const SIZE = 100;
const DASH = 900;
const css = `@media (prefers-reduced-motion: reduce){[data-stroke-text] *{transition:none!important}}`;

export function StrokeText({
  text,
  strokeColor = "#bef264",
  fillColor = "#ecfccb",
  strokeWidth = 1.2,
  duration = 2200,
  trigger = "view",
  className,
}: StrokeTextProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const measure = useRef<SVGTextElement>(null);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Fit the viewBox to the rendered glyphs (again once web fonts load).
  useEffect(() => {
    const fit = () => {
      const t = measure.current;
      const s = svg.current;
      if (!t || !s) return;
      const b = t.getBBox();
      const pad = SIZE * 0.06;
      s.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
    };
    fit();
    document.fonts?.ready.then(fit);
  }, [text]);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const filled = trigger === "view" ? inView : hovered;
  const drawMs = duration * 0.65;
  const fillMs = trigger === "view" ? duration * 0.5 : duration * 0.35;
  const fillDelay = trigger === "view" ? duration * 0.45 : 0;
  const ease = "cubic-bezier(.65,0,.35,1)";
  const glyphs = { x: 0, y: 0, style: { font: "inherit", fontSize: SIZE, letterSpacing: "inherit" } };

  return (
    <span
      className={className}
      style={{ display: "inline-block", lineHeight: 1 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <style href="stroke-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      <svg
        ref={svg}
        data-stroke-text=""
        aria-hidden
        viewBox={`0 -${SIZE * 0.9} ${text.length * SIZE * 0.6} ${SIZE * 1.2}`}
        style={{ display: "block", height: "1.2em", width: "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`${uid}-g`}>
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="0.6" stopColor="#000" />
          </linearGradient>
          {/* Mask content is in bounding-box units: 1 = the text's width, so no measuring needed. */}
          <mask id={`${uid}-m`} maskContentUnits="objectBoundingBox">
            <rect
              x="-0.1"
              y="-0.5"
              width="2.4"
              height="2"
              fill={`url(#${uid}-g)`}
              style={{
                transform: filled ? "translateX(0)" : "translateX(-1.45px)",
                transition: `transform ${fillMs}ms ${ease} ${filled ? fillDelay : 0}ms`,
              }}
            />
          </mask>
        </defs>
        <text ref={measure} {...glyphs} fill={fillColor} mask={`url(#${uid}-m)`}>
          {text}
        </text>
        <text
          {...glyphs}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeDasharray={DASH}
          style={{
            ...glyphs.style,
            strokeDashoffset: inView ? 0 : DASH,
            transition: `stroke-dashoffset ${drawMs}ms ${ease}`,
          }}
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
