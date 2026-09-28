"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface MagnetProps {
  children: ReactNode;
  /** Extra px around the element where the pull starts. */
  padding?: number;
  /** Higher is weaker: offset = distance / strength. */
  strength?: number;
  className?: string;
}

export function Magnet({ children, padding = 80, strength = 3, className }: MagnetProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!outer.current || !inner.current) return;
      // Measure the untransformed wrapper so the pull does not feed back on itself.
      const r = outer.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const active = Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding;
      inner.current.style.transition = `transform ${active ? 0.2 : 0.5}s ease-out`;
      inner.current.style.transform = active ? `translate3d(${dx / strength}px, ${dy / strength}px, 0)` : "";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [padding, strength]);

  return (
    <div ref={outer} className={className} style={{ display: "inline-block" }}>
      <div ref={inner} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
