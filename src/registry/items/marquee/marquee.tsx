"use client";

import type { ReactNode } from "react";

const css = `
@keyframes marquee-x{to{transform:translateX(-50%)}}
.marquee:hover [data-pause]{animation-play-state:paused}
`;

export interface MarqueeProps {
  items: ReactNode[];
  /** Seconds per full loop. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  /** Px between items. */
  gap?: number;
  fadeEdges?: boolean;
  className?: string;
}

export function Marquee({
  items,
  speed = 20,
  direction = "left",
  pauseOnHover = true,
  gap = 48,
  fadeEdges = true,
  className,
}: MarqueeProps) {
  const fade = "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)";
  return (
    <div
      className={`marquee ${className ?? ""}`}
      style={{ overflow: "hidden", maskImage: fadeEdges ? fade : undefined, WebkitMaskImage: fadeEdges ? fade : undefined }}
    >
      <style href="marquee" precedence="default">
        {css}
      </style>
      <div
        data-pause={pauseOnHover || undefined}
        style={{
          display: "flex",
          width: "max-content",
          animation: `marquee-x ${speed}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {/* Two identical halves; sliding by -50% loops seamlessly. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1 || undefined}
            style={{ display: "flex", alignItems: "center", flexShrink: 0, gap, paddingRight: gap }}
          >
            {items.map((item, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
