"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

const EASES = {
  smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  snappy: "cubic-bezier(0.65, 0, 0.35, 1)",
  linear: "linear",
} as const;

const OFFSET = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] } as const;

export interface AnimatedContentProps {
  children: ReactNode;
  /** Direction the content travels as it enters. */
  direction?: keyof typeof OFFSET;
  /** Px travelled on entry. */
  distance?: number;
  /** Starting scale; 1 disables scaling. */
  scale?: number;
  /** Starting opacity. */
  initialOpacity?: number;
  /** Ms. */
  duration?: number;
  /** Ms to wait once in view. */
  delay?: number;
  /** A preset name or any CSS timing function. */
  ease?: keyof typeof EASES | (string & {});
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
  /** Animate only the first time; otherwise it replays on every entry. */
  once?: boolean;
  /** Scrolling ancestor to observe. Defaults to the viewport. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function AnimatedContent({
  children,
  direction = "up",
  distance = 80,
  scale = 0.96,
  initialOpacity = 0,
  duration = 900,
  delay = 0,
  ease = "smooth",
  threshold = 0.15,
  once = true,
  scrollContainerRef,
  className,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) setShown(false);
      },
      { threshold, root: scrollContainerRef?.current ?? null },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, scrollContainerRef]);

  const [dx, dy] = OFFSET[direction] ?? OFFSET.up;
  const curve = EASES[ease as keyof typeof EASES] ?? ease;
  const timing = `${duration}ms ${curve} ${delay}ms`;

  return (
    <div
      ref={ref}
      data-animated-content=""
      className={className}
      style={{
        opacity: shown ? 1 : initialOpacity,
        transform: shown ? "none" : `translate3d(${dx * distance}px, ${dy * distance}px, 0) scale(${scale})`,
        transition: `opacity ${timing}, transform ${timing}`,
        willChange: "transform, opacity",
      }}
    >
      <style href="animated-content" precedence="default">
        {`@media (prefers-reduced-motion: reduce){[data-animated-content]{transform:none!important;transition:opacity .2s!important}}`}
      </style>
      {children}
    </div>
  );
}
