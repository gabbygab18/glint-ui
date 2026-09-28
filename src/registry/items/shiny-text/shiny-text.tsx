"use client";

const css = `@keyframes shiny-text{from{background-position:150% 0}to{background-position:-50% 0}}`;

export interface ShinyTextProps {
  text: string;
  /** Seconds per sweep. */
  speed?: number;
  color?: string;
  shineColor?: string;
  className?: string;
}

export function ShinyText({
  text,
  speed = 3,
  color = "#8a8a8a",
  shineColor = "#ffffff",
  className,
}: ShinyTextProps) {
  return (
    <>
      <style href="shiny-text" precedence="default">
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
          animation: `shiny-text ${speed}s linear infinite`,
        }}
      >
        {text}
      </span>
    </>
  );
}
