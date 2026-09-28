"use client";

const css = `@keyframes gradient-text{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`;

export interface GradientTextProps {
  text: string;
  colors?: string[];
  /** Seconds per full cycle. */
  speed?: number;
  className?: string;
}

export function GradientText({
  text,
  colors = ["#c6ff3d", "#22d3ee", "#a78bfa", "#c6ff3d"],
  speed = 6,
  className,
}: GradientTextProps) {
  return (
    <>
      <style href="gradient-text" precedence="default">
        {css}
      </style>
      <span
        className={className}
        style={{
          display: "inline-block",
          color: "transparent",
          backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          animation: `gradient-text ${speed}s ease-in-out infinite`,
        }}
      >
        {text}
      </span>
    </>
  );
}
