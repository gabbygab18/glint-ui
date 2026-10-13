"use client";

const css = `@keyframes sheen-type{from{background-position:150% 0}to{background-position:-50% 0}}`;

export interface SheenTypeProps {
  text: string;
  /** Seconds per sweep. */
  speed?: number;
  color?: string;
  shineColor?: string;
  className?: string;
}

export function SheenType({
  text,
  speed = 3,
  color = "#8a8a8a",
  shineColor = "#ffffff",
  className,
}: SheenTypeProps) {
  return (
    <>
      <style href="sheen-type" precedence="default">
        {css}
      </style>
      <span
        className={className}
        style={{
          display: "inline-block",
          color: "transparent",
          backgroundImage: `linear-gradient(110deg, ${color} 40%, ${shineColor} 50%, ${color} 60%)`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          animation: `sheen-type ${speed}s linear infinite`,
        }}
      >
        {text}
      </span>
    </>
  );
}
