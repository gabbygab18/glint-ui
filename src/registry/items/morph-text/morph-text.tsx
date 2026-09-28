"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

export interface MorphTextProps {
  /** Words to cycle through. */
  words: string[];
  /** Morph duration, in ms. */
  duration?: number;
  /** How long each word rests, in ms. */
  pause?: number;
  className?: string;
}

const piece: CSSProperties = { gridArea: "1 / 1", whiteSpace: "nowrap", userSelect: "none" };

export function MorphText({ words, duration = 1100, pause = 1600, className }: MorphTextProps) {
  const box = useRef<HTMLSpanElement>(null);
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const id = `mt${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const n = Math.max(words.length, 1);
  const count = words.length;

  // Called with f in [0, 1]: 0 shows the current word, 1 the next one.
  const apply = (f: number) => {
    if (!box.current || !a.current || !b.current) return;
    const blur = (x: number) => (x <= 0 ? 100 : Math.min(8 / x - 8, 100));
    b.current.style.filter = `blur(${blur(f)}px)`;
    b.current.style.opacity = String(Math.pow(f, 0.4));
    a.current.style.filter = `blur(${blur(1 - f)}px)`;
    a.current.style.opacity = String(Math.pow(1 - f, 0.4));
    box.current.style.filter = f > 0 && f < 1 ? `url(#${id})` : "";
  };
  const applyRef = useRef(apply);
  useLayoutEffect(() => {
    applyRef.current = apply;
    apply(0);
  });

  useEffect(() => {
    const el = box.current;
    if (!el || count < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!start) start = now;
      const t = now - start - pause;
      if (t < 0) return;
      const f = reduced ? 1 : Math.min(t / duration, 1);
      applyRef.current(f);
      if (f >= 1) {
        start = now;
        setIndex((i) => (i + 1) % count);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      start = 0;
      applyRef.current(0);
      if (e.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [count, duration, pause]);

  const current = words[index % n] ?? "";
  const next = words[(index + 1) % n] ?? "";

  return (
    <span className={className} style={{ display: "inline-block" }}>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id}>
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
        </filter>
      </svg>
      <span className="sr-only">{words.join(", ")}</span>
      <span ref={box} aria-hidden style={{ display: "inline-grid", justifyItems: "center" }}>
        <span ref={a} style={piece}>
          {current}
        </span>
        <span ref={b} style={{ ...piece, opacity: 0 }}>
          {next}
        </span>
      </span>
    </span>
  );
}
