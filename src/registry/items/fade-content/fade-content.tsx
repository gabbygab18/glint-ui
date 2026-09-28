"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export interface FadeContentProps {
  children: ReactNode;
  /** Starting blur in px. */
  blur?: number;
  /** Ms. */
  duration?: number;
  /** Ms to wait once in view. */
  delay?: number;
  /** Any CSS timing function. */
  easing?: string;
  /** Starting opacity. */
  initialOpacity?: number;
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
  /** Fade only the first time; otherwise it fades out and back in. */
  once?: boolean;
  /** Scrolling ancestor to observe. Defaults to the viewport. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function FadeContent({
  children,
  blur = 12,
  duration = 1000,
  delay = 0,
  easing = "ease-out",
  initialOpacity = 0,
  threshold = 0.2,
  once = true,
  scrollContainerRef,
  className,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) setShown(false);
      },
      { threshold, root: scrollContainerRef?.current ?? null },
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [threshold, once, scrollContainerRef]);

  const timing = `${duration}ms ${easing} ${delay}ms`;

  return (
    <div
      ref={ref}
      data-fade-content=""
      className={className}
      style={{
        opacity: shown ? 1 : initialOpacity,
        filter: shown || !blur ? "none" : `blur(${blur}px)`,
        transition: `opacity ${timing}, filter ${timing}`,
      }}
    >
      <style href="fade-content" precedence="default">
        {`@media (prefers-reduced-motion: reduce){[data-fade-content]{filter:none!important;transition:opacity .2s!important}}`}
      </style>
      {children}
    </div>
  );
}
