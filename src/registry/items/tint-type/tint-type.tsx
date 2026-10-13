"use client";

const css = `@keyframes tint-type{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`;

export interface TintTypeProps {
  text: string;
  colors?: string[];
  /** Seconds per full cycle. */
  speed?: number;
  className?: string;
}

export function TintType({
  text,
  colors = ["#c6ff3d", "#22d3ee", "#a78bfa", "#c6ff3d"],
  speed = 6,
  className,
}: TintTypeProps) {
  return (
    <>
      <style href="tint-type" precedence="default">
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
          animation: `tint-type ${speed}s ease-in-out infinite`,
        }}
      >
        {text}
      </span>
    </>
  );
}
