"use client";

import { Fragment, useEffect, useRef, useState } from "react";

export interface SplitTextProps {
  text: string;
  /** Animate each character or each word. */
  splitBy?: "chars" | "words";
  variant?: "slide" | "blur" | "fade";
  /** Delay between pieces, in ms. */
  stagger?: number;
  /** Duration of each piece, in ms. */
  duration?: number;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
}

export function SplitText({
  text,
  splitBy = "chars",
  variant = "slide",
  stagger = 35,
  duration = 600,
  as: Tag = "p",
  className,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");
  let index = 0;
  const piece = (content: string, key: number) => {
    const delay = index++ * stagger;
    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          whiteSpace: "pre",
          opacity: shown ? 1 : 0,
          transform: shown || variant !== "slide" ? "none" : "translateY(0.6em)",
          filter: shown || variant !== "blur" ? "none" : "blur(10px)",
          transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms, filter ${duration}ms ease ${delay}ms`,
        }}
      >
        {content}
      </span>
    );
  };

  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {splitBy === "words" ? piece(word, 0) : Array.from(word).map(piece)}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
