"use client";

import { useEffect, useRef, useState } from "react";

export interface FoldTextProps {
  /** One entry per line. */
  lines?: string[];
  /** Unfold whole lines or each letter. */
  splitBy?: "lines" | "letters";
  /** Unfold once on view, refold and unfold on hover, or keep looping. */
  trigger?: "view" | "hover" | "loop";
  /** Edge the paper hinges on. */
  hinge?: "top" | "bottom";
  /** Delay between pieces, in ms. */
  stagger?: number;
  /** Duration of each piece, in ms. */
  duration?: number;
  className?: string;
}

export function FoldText({
  lines = ["Unfold", "the next", "big idea"],
  splitBy = "letters",
  trigger = "view",
  hinge = "top",
  stagger = 45,
  duration = 1000,
  className,
}: FoldTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const timers = useRef<number[]>([]);
  const count = splitBy === "lines" ? lines.length : lines.join("").replace(/\s/g, "").length;
  const total = duration + stagger * count;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const refold = (then?: () => void) => {
    setClosing(true);
    setOpen(false);
    later(() => {
      setClosing(false);
      setOpen(true);
      then?.();
    }, 380 + stagger * count * 0.25);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setOpen(true));
      return () => clearTimeout(t);
    }
    const cycle = () => later(() => refold(cycle), total + 1800);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setOpen(true);
        if (trigger === "loop") cycle();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refold/later only touch refs and setters
  }, [trigger, total]);

  const origin = hinge === "top" ? "50% 0%" : "50% 100%";
  const folded = `rotateX(${hinge === "top" ? -100 : 100}deg)`;
  let i = 0;
  const piece = (content: string, key: number, block = false) => {
    const n = i++;
    const delay = closing ? (count - n) * stagger * 0.25 : n * stagger;
    const d = closing ? 320 : duration;
    return (
      <span
        key={key}
        style={{
          display: block ? "block" : "inline-block",
          whiteSpace: "pre",
          transformOrigin: origin,
          backfaceVisibility: "hidden",
          transform: open ? "none" : folded,
          opacity: open ? 1 : 0,
          filter: open ? "brightness(1)" : "brightness(0.25)",
          transition: `transform ${d}ms cubic-bezier(.3,1.45,.5,1) ${delay}ms, opacity ${d * 0.45}ms ease ${delay}ms, filter ${d}ms ease ${delay}ms`,
        }}
      >
        {content}
      </span>
    );
  };

  return (
    <div
      ref={ref}
      className={className}
      onPointerEnter={trigger === "hover" && open && !closing ? () => {
              clear();
              refold();
            } : undefined}
    >
      <span className="sr-only">{lines.join(" ")}</span>
      <div aria-hidden>
        {lines.map((line, l) => (
          <div key={l} style={{ perspective: "700px", perspectiveOrigin: "50% 50%" }}>
            {splitBy === "lines" ? piece(line, 0, true) : Array.from(line).map((c, k) => (c === " " ? " " : piece(c, k)))}
          </div>
        ))}
      </div>
    </div>
  );
}
