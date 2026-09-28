"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface TextHighlighterProps {
  children: ReactNode;
  /** Marker color. */
  color?: string;
  /** Text color while highlighted (marker variant). */
  textColor?: string;
  /** Full marker stroke, or a low underline swipe. */
  variant?: "marker" | "underline";
  /** Direction the pen travels. */
  direction?: "ltr" | "rtl";
  /** Stroke duration, in ms. */
  duration?: number;
  /** Delay after entering view, in ms. */
  delay?: number;
  className?: string;
}

export function TextHighlighter({
  children,
  color = "#a3e635",
  textColor = "#0a0a0a",
  variant = "marker",
  direction = "ltr",
  duration = 900,
  delay = 0,
  className,
}: TextHighlighterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = direction === "ltr" ? "inset(-20% 100% -20% 0)" : "inset(-20% 0 -20% 100%)";
  const marker = variant === "marker";
  const layer = {
    position: "absolute",
    inset: 0,
    padding: "0 0.18em",
    clipPath: on ? "inset(-20% 0 -20% 0)" : hidden,
    transition: `clip-path ${duration}ms cubic-bezier(.65,0,.35,1) ${delay}ms`,
    pointerEvents: "none",
  } as const;

  return (
    <span
      ref={ref}
      className={className}
      style={{ position: "relative", display: "inline-block", padding: "0 0.18em", margin: "0 -0.18em", isolation: "isolate" }}
    >
      {children}
      <span aria-hidden style={{ ...layer, zIndex: marker ? 0 : -1 }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: marker ? "0.1em" : "62%",
            bottom: marker ? "0.02em" : "0.04em",
            background: color,
            borderRadius: "0.35em 0.2em 0.45em 0.15em / 0.5em 0.25em 0.6em 0.3em",
            transform: "rotate(-0.8deg) skewX(-6deg)",
            opacity: marker ? 1 : 0.85,
          }}
        />
        {marker && <span style={{ position: "relative", color: textColor }}>{children}</span>}
      </span>
    </span>
  );
}
