"use client";

const css = `
@keyframes aurora-drift-a{0%,100%{transform:translate(-10%,-10%) scale(1)}50%{transform:translate(20%,10%) scale(1.2)}}
@keyframes aurora-drift-b{0%,100%{transform:translate(10%,10%) scale(1.1)}50%{transform:translate(-20%,-5%) scale(.9)}}
@keyframes aurora-drift-c{0%,100%{transform:translate(0,15%) scale(.9)}50%{transform:translate(10%,-15%) scale(1.15)}}
`;

export interface AuroraProps {
  colors?: string[];
  /** Seconds per drift cycle; higher is calmer. */
  speed?: number;
  /** Blur radius in px. */
  blur?: number;
  opacity?: number;
  className?: string;
}

export function Aurora({
  colors = ["#c6ff3d", "#22d3ee", "#a78bfa"],
  speed = 14,
  blur = 90,
  opacity = 0.55,
  className,
}: AuroraProps) {
  const blobs = [
    { left: "5%", top: "0%", anim: "aurora-drift-a" },
    { left: "40%", top: "10%", anim: "aurora-drift-b" },
    { left: "20%", top: "35%", anim: "aurora-drift-c" },
  ];
  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <style href="aurora" precedence="default">
        {css}
      </style>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.left,
            top: b.top,
            width: "55%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: colors[i % colors.length],
            opacity,
            filter: `blur(${blur}px)`,
            mixBlendMode: "screen",
            animation: `${b.anim} ${speed}s ease-in-out infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
