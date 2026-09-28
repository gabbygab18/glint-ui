"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export interface SwipeStackProps {
  cards: ReactNode[];
  /** Px of drag needed to send the top card to the back. */
  sensitivity?: number;
  /** Px between stacked cards. */
  offset?: number;
  className?: string;
}

export function SwipeStack({ cards, sensitivity = 120, offset = 10, className }: SwipeStackProps) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const drag = useRef<{ x: number; y: number } | null>(null);

  const next = () => setOrder((o) => [...o.slice(1), o[0]]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.transition = "none";
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    e.currentTarget.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 12}deg)`;
  };

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = null;
    const el = e.currentTarget;
    el.style.transition = "";
    el.style.transform = "";
    if (Math.hypot(dx, dy) > sensitivity) next();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  // Cards added or removed by the parent: fall back to natural order.
  const safeOrder = order.length === cards.length ? order : cards.map((_, i) => i);

  return (
    <div className={`relative ${className ?? ""}`} style={{ display: "grid" }}>
      {safeOrder.map((cardIndex, depth) => {
        const isTop = depth === 0;
        return (
          <div
            key={cardIndex}
            role={isTop ? "button" : undefined}
            tabIndex={isTop ? 0 : -1}
            aria-label={isTop ? "Swipe or press Enter for next card" : undefined}
            aria-hidden={!isTop || undefined}
            onPointerDown={isTop ? onDown : undefined}
            onPointerMove={isTop ? onMove : undefined}
            onPointerUp={isTop ? onUp : undefined}
            onPointerCancel={isTop ? onUp : undefined}
            onKeyDown={isTop ? onKey : undefined}
            style={{
              gridArea: "1 / 1",
              zIndex: cards.length - depth,
              transform: `translateY(${depth * offset}px) scale(${1 - depth * 0.05})`,
              transformOrigin: "50% 100%",
              opacity: depth > 3 ? 0 : 1,
              transition: "transform .35s cubic-bezier(.2,.7,.2,1), opacity .35s",
              cursor: isTop ? "grab" : "default",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            {cards[cardIndex]}
          </div>
        );
      })}
    </div>
  );
}
