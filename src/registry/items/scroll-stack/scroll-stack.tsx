"use client";

import { Children, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ScrollStackProps {
  /** One child per card. */
  children: ReactNode;
  /** The scrolling element. Defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Distance from the top of the scroller where the first card pins, in px. */
  stackOffset?: number;
  /** Visible sliver of each earlier card peeking above the next, in px. */
  stackGap?: number;
  /** Vertical space between cards before they stack, in px. */
  itemGap?: number;
  /** How much each covered card shrinks per card on top of it. */
  scaleStep?: number;
  /** How dark a fully covered card gets, 0 to 1. */
  dim?: number;
  /** Blur for covered cards, in px per card on top. */
  blur?: number;
  className?: string;
  /** Classes for every card wrapper. */
  itemClassName?: string;
}

export function ScrollStack({
  children,
  scrollContainerRef,
  stackOffset = 32,
  stackGap = 18,
  itemGap = 96,
  scaleStep = 0.05,
  dim = 0.45,
  blur = 0,
  className,
  itemClassName,
}: ScrollStackProps) {
  const items = Children.toArray(children);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const shades = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const scroller = scrollContainerRef?.current ?? null;
    const target: HTMLElement | Window = scroller ?? window;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const paint = () => {
      raf = 0;
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      const els = cards.current.filter(Boolean) as HTMLDivElement[];
      // p[j]: 0 while card j is still a full card-height away from its pin line, 1 once pinned.
      const p = els.map((el, j) => {
        const pin = top + stackOffset + j * stackGap;
        const dist = el.getBoundingClientRect().top - pin;
        return Math.min(1, Math.max(0, 1 - dist / (el.offsetHeight + itemGap)));
      });
      els.forEach((el, i) => {
        let covered = 0;
        for (let j = i + 1; j < els.length; j++) covered += p[j];
        const inner = el.firstElementChild as HTMLElement | null;
        if (!inner) return;
        inner.style.transform = reduce ? "" : `scale(${Math.max(0.5, 1 - covered * scaleStep)})`;
        inner.style.filter = blur && !reduce && covered > 0.01 ? `blur(${(covered * blur).toFixed(2)}px)` : "";
        const shade = shades.current[i];
        if (shade) shade.style.opacity = String(Math.min(1, covered) * dim);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    paint();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollContainerRef, stackOffset, stackGap, itemGap, scaleStep, dim, blur, items.length]);

  return (
    <div className={cn("relative", className)} style={{ paddingBottom: stackGap * items.length + itemGap }}>
      {items.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            cards.current[i] = el;
          }}
          className="sticky"
          style={{ top: stackOffset + i * stackGap, marginTop: i ? itemGap : 0 }}
        >
          <div className={cn("relative origin-top overflow-hidden rounded-3xl will-change-transform", itemClassName)}>
            {child}
            <div
              aria-hidden
              ref={(el) => {
                shades.current[i] = el;
              }}
              className="pointer-events-none absolute inset-0 bg-black opacity-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
