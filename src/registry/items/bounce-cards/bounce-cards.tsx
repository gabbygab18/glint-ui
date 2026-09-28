"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export interface BounceCardsProps {
  images: string[];
  /** Card width in px (height is 1.25x). */
  cardSize?: number;
  /** Px between neighbouring card centers. */
  overlap?: number;
  /** Degrees of fan rotation per card. */
  rotation?: number;
  /** Px the other cards are pushed away on hover. */
  spread?: number;
  /** Seconds between each card's entrance. */
  stagger?: number;
  /** Spring damping of the entrance, lower = bouncier. */
  bounciness?: number;
  className?: string;
}

export function BounceCards({
  images,
  cardSize = 170,
  overlap = 110,
  rotation = 7,
  spread = 70,
  stagger = 0.08,
  bounciness = 9,
  className,
}: BounceCardsProps) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [hovered, setHoveredState] = useState<number | null>(null);
  // After the first hover the entrance delay is dropped so cards react instantly.
  const [touched, setTouched] = useState(false);
  const setHovered = (i: number | null) => {
    setHoveredState(i);
    if (i !== null) setTouched(true);
  };
  const mid = (images.length - 1) / 2;
  const h = cardSize * 1.25;

  return (
    <div
      ref={root}
      role="list"
      className={`relative ${className ?? ""}`}
      style={{ width: overlap * (images.length - 1) + cardSize + spread * 2, height: h + 60 }}
      onPointerLeave={() => setHovered(null)}
    >
      {images.map((src, i) => {
        const off = i - mid;
        const push = hovered === null || hovered === i ? 0 : Math.sign(i - hovered) * spread;
        const lifted = hovered === i;
        const shown = inView || reduce;
        return (
          <motion.div
            key={src + i}
            role="listitem"
            tabIndex={0}
            aria-label={`Photo ${i + 1} of ${images.length}`}
            onPointerEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            className="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden rounded-[18px] border-[5px] border-white bg-muted shadow-[0_18px_40px_-12px_rgba(0,0,0,.6)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{
              width: cardSize,
              height: h,
              marginLeft: -cardSize / 2,
              marginTop: -h / 2,
              zIndex: lifted ? 50 : 10 - Math.round(Math.abs(off)),
            }}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{
              scale: shown ? (lifted ? 1.08 : 1) : 0,
              opacity: shown ? 1 : 0,
              x: off * overlap + push,
              y: lifted ? -14 : Math.abs(off) * 6,
              rotate: lifted ? 0 : off * rotation,
            }}
            transition={{
              scale: touched
                ? { type: "spring", stiffness: 300, damping: 18 }
                : { type: "spring", stiffness: 260, damping: bounciness, delay: i * stagger },
              opacity: { duration: 0.2, delay: i * stagger },
              default: { type: "spring", stiffness: 260, damping: 22 },
            }}
          >
            <img src={src} alt="" draggable={false} className="size-full object-cover" />
          </motion.div>
        );
      })}
    </div>
  );
}
