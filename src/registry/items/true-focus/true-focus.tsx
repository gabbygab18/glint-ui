"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface TrueFocusProps {
  text: string;
  /** Blur of unfocused words, in px. */
  blur?: number;
  /** Ms each word holds focus in auto mode. */
  interval?: number;
  /** Ms for the frame to travel and the blur to shift. */
  duration?: number;
  /** Cycle on its own, or follow the pointer. */
  mode?: "auto" | "hover";
  /** Corner bracket color. */
  color?: string;
  className?: string;
}

const corner = "absolute size-[0.3em] min-h-3 min-w-3 rounded-[3px]";
const bracket: CSSProperties = { borderColor: "var(--focus)", filter: "drop-shadow(0 0 6px var(--focus))" };

export function TrueFocus({
  text,
  blur = 5,
  interval = 1800,
  duration = 550,
  mode = "auto",
  color = "#bef264",
  className,
}: TrueFocusProps) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const [active, setActive] = useState(0);
  const words = text.split(/\s+/).filter(Boolean);
  const n = words.length;

  useEffect(() => {
    if (mode !== "auto" || n < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % n), interval);
    return () => window.clearInterval(id);
  }, [mode, n, interval]);

  // Move the frame around the active word (DOM write, re-run on resize).
  useLayoutEffect(() => {
    const el = root.current;
    const f = frame.current;
    if (!el || !f) return;
    const place = (animate: boolean) => {
      const word = el.querySelectorAll<HTMLElement>("[data-word]")[active % Math.max(1, n)];
      if (!word) return;
      const pad = Math.max(6, word.offsetHeight * 0.12);
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      f.style.transition =
        animate && !still
          ? `transform ${duration}ms cubic-bezier(.65,0,.35,1), width ${duration}ms cubic-bezier(.65,0,.35,1), height ${duration}ms cubic-bezier(.65,0,.35,1), opacity .3s`
          : "none";
      f.style.transform = `translate(${word.offsetLeft - pad}px, ${word.offsetTop - pad}px)`;
      f.style.width = `${word.offsetWidth + pad * 2}px`;
      f.style.height = `${word.offsetHeight + pad * 2}px`;
      f.style.opacity = "1";
    };
    place(placed.current);
    placed.current = true;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, n, duration, text]);

  return (
    <div
      ref={root}
      className={cn("relative inline-flex flex-wrap justify-center gap-x-[0.3em] gap-y-[0.2em]", className)}
      style={{ "--focus": color } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => {
        const on = i === active % n;
        return (
          <span
            key={i}
            data-word
            aria-hidden
            onPointerEnter={mode === "hover" ? () => setActive(i) : undefined}
            style={{
              filter: on ? "none" : `blur(${blur}px)`,
              opacity: on ? 1 : 0.5,
              transition: `filter ${duration}ms ease, opacity ${duration}ms ease`,
              cursor: mode === "hover" ? "default" : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
      <span ref={frame} aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ opacity: 0 }}>
        <span className={cn(corner, "left-0 top-0 border-l-[3px] border-t-[3px]")} style={bracket} />
        <span className={cn(corner, "right-0 top-0 border-r-[3px] border-t-[3px]")} style={bracket} />
        <span className={cn(corner, "bottom-0 left-0 border-b-[3px] border-l-[3px]")} style={bracket} />
        <span className={cn(corner, "bottom-0 right-0 border-b-[3px] border-r-[3px]")} style={bracket} />
      </span>
    </div>
  );
}
