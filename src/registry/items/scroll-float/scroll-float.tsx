"use client";

import { Fragment, useEffect, useRef, type RefObject } from "react";

export interface ScrollFloatProps {
  text?: string;
  /** Scrolling element; defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Where the animation starts: element top at this fraction of the viewport height (1 = bottom edge). */
  start?: number;
  /** Where every character has landed, as a fraction of the viewport height. */
  end?: number;
  /** Progress offset between consecutive characters (0-0.2). */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function ScrollFloat({
  text = "Scroll to float",
  scrollContainerRef,
  start = 0.95,
  end = 0.45,
  stagger = 0.04,
  as: Tag = "h2",
  className,
}: ScrollFloatProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const chars = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-sf]"));
    const scroller = scrollContainerRef?.current ?? null;
    const target: HTMLElement | Window = scroller ?? window;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = chars.length;
    let raf = 0;

    const update = () => {
      raf = 0;
      const vp = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const top = el.getBoundingClientRect().top - vp.top;
      const from = vp.height * start;
      const to = vp.height * end;
      const p = reduced ? 1 : Math.min(1, Math.max(0, (from - top) / Math.max(1, from - to)));
      const spread = stagger * Math.max(0, n - 1);
      chars.forEach((c, i) => {
        const e = easeOut(Math.min(1, Math.max(0, p * (1 + spread) - i * stagger)));
        const k = 1 - e;
        c.style.opacity = `${e}`;
        c.style.transform = `translate3d(0, ${k * 110}%, 0) scale(${1 - k * 0.35}, ${1 + k * 1.2})`;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [text, scrollContainerRef, start, end, stagger]);

  const words = text.split(" ");
  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <Fragment key={w}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {Array.from(word).map((c, i) => (
                <span
                  key={i}
                  data-sf=""
                  style={{ display: "inline-block", opacity: 0, transformOrigin: "50% 0%", willChange: "transform, opacity" }}
                >
                  {c}
                </span>
              ))}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
