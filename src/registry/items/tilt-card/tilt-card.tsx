"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

export interface TiltCardProps {
  children: ReactNode;
  /** Max rotation in degrees. */
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
  className?: string;
}

export function TiltCard({ children, maxTilt = 12, scale = 1.04, glare = true, className }: TiltCardProps) {
  const card = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current!;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transition = "transform .08s linear";
    el.style.transform = `rotateX(${(0.5 - y) * 2 * maxTilt}deg) rotateY(${(x - 0.5) * 2 * maxTilt}deg) scale(${scale})`;
    el.style.setProperty("--glare-x", `${x * 100}%`);
    el.style.setProperty("--glare-y", `${y * 100}%`);
    el.style.setProperty("--glare-o", "1");
  };

  const onLeave = () => {
    const el = card.current!;
    el.style.transition = "transform .5s cubic-bezier(.2,.7,.2,1)";
    el.style.transform = "";
    el.style.setProperty("--glare-o", "0");
  };

  return (
    <div style={{ perspective: 800 }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={card} className={className} style={{ position: "relative", transformStyle: "preserve-3d", willChange: "transform" }}>
        {children}
        {glare && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              pointerEvents: "none",
              opacity: "var(--glare-o, 0)",
              transition: "opacity .3s",
              background:
                "radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,.25), transparent 55%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
