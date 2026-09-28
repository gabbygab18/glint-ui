"use client";

import { Fragment, useEffect, useRef, type RefObject } from "react";

export interface ScrollRevealProps {
  text: string;
  /** Element that scrolls. Defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Opacity of words that are not revealed yet (0-1). */
  baseOpacity?: number;
  /** Blur of unrevealed words, in px. */
  blur?: number;
  /** How many words are mid-transition at once. Higher is a softer sweep. */
  softness?: number;
  /** Degrees the block starts tilted, settling to 0 as it reveals. */
  rotation?: number;
  as?: "p" | "h2" | "h3" | "div";
  className?: string;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function ScrollReveal({
  text,
  scrollContainerRef,
  baseOpacity = 0.12,
  blur = 8,
  softness = 6,
  rotation = 3,
  as: Tag = "p",
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    const scroller = scrollContainerRef?.current ?? null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const soft = Math.max(1, softness);
    let raf = 0;

    const update = () => {
      raf = 0;
      const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const r = el.getBoundingClientRect();
      // 0 when the block's top crosses 90% of the view, 1 when its bottom crosses 45%.
      const p = reduced ? 1 : clamp((view.height * 0.9 - (r.top - view.top)) / (view.height * 0.45 + r.height));
      const head = p * (words.length + soft);
      words.forEach((w, i) => {
        const t = clamp((head - i) / soft);
        w.style.opacity = String(baseOpacity + (1 - baseOpacity) * t);
        w.style.filter = t >= 1 || blur === 0 ? "none" : `blur(${((1 - t) * blur).toFixed(2)}px)`;
      });
      el.style.transform = rotation ? `rotate(${((1 - p) * rotation).toFixed(3)}deg)` : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollContainerRef, baseOpacity, blur, softness, rotation, text]);

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref as never} className={className} style={{ transformOrigin: "0% 50%", willChange: "transform" }}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            data-word
            aria-hidden
            style={{ display: "inline-block", opacity: baseOpacity, filter: `blur(${blur}px)`, willChange: "opacity, filter" }}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
