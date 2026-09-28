"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-:/!?&";

const css = `
@keyframes split-flap-top{from{transform:rotateX(0);filter:brightness(1)}to{transform:rotateX(-90deg);filter:brightness(.55)}}
@keyframes split-flap-bottom{from{transform:rotateX(90deg);filter:brightness(.55)}to{transform:rotateX(0);filter:brightness(1)}}
@media (prefers-reduced-motion: reduce){[data-flap]{animation:none!important}}`;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface SplitFlapTextProps {
  /** Words to cycle through. Shorter words are padded to the longest. */
  words: string[];
  /** Ms each word stays after it lands. */
  interval?: number;
  /** Ms for one flap to fall. */
  flipDuration?: number;
  /** Ms between neighbouring tiles starting. */
  stagger?: number;
  align?: "left" | "center";
  tileColor?: string;
  textColor?: string;
  className?: string;
}

function Half({ char, side, animation }: { char: string; side: "top" | "bottom"; animation?: string }) {
  const top = side === "top";
  return (
    <span
      data-flap={animation ? "" : undefined}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: "50%",
        [top ? "top" : "bottom"]: 0,
        overflow: "hidden",
        background: top
          ? "linear-gradient(rgb(255 255 255 / .07), rgb(255 255 255 / .02)), var(--flap-tile)"
          : "linear-gradient(rgb(0 0 0 / .12), rgb(0 0 0 / .02)), var(--flap-tile)",
        borderRadius: top ? "0.12em 0.12em 0 0" : "0 0 0.12em 0.12em",
        transformOrigin: top ? "50% 100%" : "50% 0%",
        backfaceVisibility: "hidden",
        animation,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "200%",
          [top ? "top" : "bottom"]: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        {char}
      </span>
    </span>
  );
}

function Tile({ target, delay, flipDuration }: { target: string; delay: number; flipDuration: number }) {
  const [goal, setGoal] = useState(" ");
  const [cur, setCur] = useState(" ");
  const [next, setNext] = useState(" ");

  useEffect(() => {
    const t = window.setTimeout(() => setGoal(target), delay);
    return () => window.clearTimeout(t);
  }, [target, delay]);

  useEffect(() => {
    // A flap is falling: land it, then pick the next character on the drum.
    if (cur !== next) {
      const t = window.setTimeout(() => setCur(next), reduced() ? 0 : flipDuration);
      return () => window.clearTimeout(t);
    }
    if (cur === goal) return;
    const t = window.setTimeout(() => {
      const i = CHARSET.indexOf(cur);
      setNext(reduced() || i < 0 || !CHARSET.includes(goal) ? goal : CHARSET[(i + 1) % CHARSET.length]);
    }, 0);
    return () => window.clearTimeout(t);
  }, [cur, next, goal, flipDuration]);

  const half = flipDuration / 2;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: "calc(1ch + 0.36em)",
        height: "1.3em",
        perspective: "5em",
        boxShadow: "0 0.08em 0.2em rgb(0 0 0 / .45)",
        borderRadius: "0.12em",
      }}
    >
      <Half char={next} side="top" />
      <Half char={cur} side="bottom" />
      {cur !== next && (
        <span key={cur + next}>
          <Half char={cur} side="top" animation={`split-flap-top ${half}ms ease-in both`} />
          <Half char={next} side="bottom" animation={`split-flap-bottom ${half}ms ease-out ${half}ms both`} />
        </span>
      )}
      <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "0.04em", background: "rgb(0 0 0 / .6)" }} />
    </span>
  );
}

export function SplitFlapText({
  words,
  interval = 4200,
  flipDuration = 55,
  stagger = 40,
  align = "center",
  tileColor = "#1b1b1f",
  textColor = "#f5f5f0",
  className,
}: SplitFlapTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(-1);
  const list = words.map((w) => w.toUpperCase());
  const len = Math.max(1, ...list.map((w) => w.length));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (!entry.isIntersecting) return;
      setIndex((i) => (i < 0 ? 0 : i));
      timer = window.setInterval(() => setIndex((i) => (i + 1) % Math.max(1, words.length)), interval);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [interval, words.length]);

  const word = index < 0 ? "" : (list[index % list.length] ?? "");
  const gap = len - word.length;
  const padded = (align === "center" ? " ".repeat(Math.floor(gap / 2)) + word : word).padEnd(len, " ");

  return (
    <span
      ref={ref}
      className={cn("font-mono font-bold", className)}
      style={
        {
          display: "inline-flex",
          gap: "0.1em",
          lineHeight: 1,
          color: "var(--flap-text)",
          "--flap-tile": tileColor,
          "--flap-text": textColor,
        } as CSSProperties
      }
    >
      <style href="split-flap-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">
        {word}
      </span>
      <span aria-hidden style={{ display: "inline-flex", gap: "inherit" }}>
        {Array.from(padded).map((c, i) => (
          <Tile key={i} target={c} delay={i * stagger} flipDuration={flipDuration} />
        ))}
      </span>
    </span>
  );
}
