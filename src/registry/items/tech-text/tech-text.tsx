"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes tech-text-flicker{0%{opacity:0}8%{opacity:1}12%{opacity:.1}22%{opacity:.9}28%{opacity:.2}44%,100%{opacity:1}}
@keyframes tech-text-glow{from{color:var(--tech);text-shadow:0 0 .35em var(--tech)}}
@keyframes tech-text-corner{from{opacity:0;transform:translate(var(--dx),var(--dy))}}
@keyframes tech-text-scan{0%{top:0;opacity:0}15%{opacity:.9}100%{top:100%;opacity:0}}
@keyframes tech-text-blink{50%{opacity:0}}
@keyframes tech-text-in{from{opacity:0;transform:translateY(.3em)}}
@media (prefers-reduced-motion: reduce){[data-tech-text] *{animation:none!important}}`;

export interface TechTextProps {
  text: string;
  /** Small readout above the frame. */
  label?: string;
  /** Small readout below the frame; a live percentage is appended. */
  sublabel?: string;
  /** Accent for brackets, labels, caret and the flicker glow. */
  color?: string;
  /** Ms between characters flickering on. */
  speed?: number;
  /** Show a blinking block caret after the text. */
  caret?: boolean;
  /** Replay the boot sequence on hover. */
  replayOnHover?: boolean;
  className?: string;
}

// Deterministic 0-1 jitter so SSR and client agree.
const jitter = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;

const corners: CSSProperties[] = [
  { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, "--dx": "-.3em", "--dy": "-.3em" } as CSSProperties,
  { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, "--dx": ".3em", "--dy": "-.3em" } as CSSProperties,
  { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, "--dx": "-.3em", "--dy": ".3em" } as CSSProperties,
  { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, "--dx": ".3em", "--dy": ".3em" } as CSSProperties,
];

export function TechText({
  text,
  label = "SYS.07 // UPLINK",
  sublabel = "SIGNAL LOCK",
  color = "#a3e635",
  speed = 45,
  caret = true,
  replayOnHover = true,
  className,
}: TechTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(0);
  const chars = Array.from(text);
  const total = 300 + chars.length * speed + speed * 2 + 450;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRun((r) => r || 1);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Percentage readout counts up with the boot sequence (DOM write, no re-render).
  useEffect(() => {
    const out = readout.current;
    if (!out || !run) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = still ? 1 : Math.min(1, (now - t0) / total);
      out.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, total]);

  const hud = "absolute whitespace-nowrap font-mono uppercase leading-none tracking-[0.2em]";
  const hudStyle: CSSProperties = { fontSize: "max(10px, 0.16em)", color: "var(--tech)", fontWeight: 500 };

  return (
    <div
      ref={ref}
      data-tech-text=""
      className={cn("relative inline-block px-[0.55em] py-[0.4em]", className)}
      style={{ "--tech": color, visibility: run ? "visible" : "hidden" } as CSSProperties}
      onMouseEnter={replayOnHover ? () => setRun((r) => r + 1) : undefined}
    >
      <style href="tech-text" precedence="default">
        {css}
      </style>
      <span className="sr-only">{text}</span>
      <div key={run} aria-hidden>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, color-mix(in oklab, var(--tech) 7%, transparent) 0 1px, transparent 1px 4px), color-mix(in oklab, var(--tech) 5%, transparent)",
            animation: "tech-text-in .5s ease-out both",
          }}
        />
        {corners.map((s, i) => (
          <span
            key={i}
            className="absolute size-[0.32em] min-h-3 min-w-3"
            style={{
              ...s,
              borderColor: "var(--tech)",
              borderStyle: "solid",
              filter: "drop-shadow(0 0 4px var(--tech))",
              animation: `tech-text-corner .6s cubic-bezier(.2,.8,.2,1) ${i * 60}ms both`,
            }}
          />
        ))}
        <span
          className="pointer-events-none absolute inset-x-0 h-px"
          style={{ background: "var(--tech)", boxShadow: "0 0 8px var(--tech)", animation: `tech-text-scan ${total}ms ease-in-out both` }}
        />
        <span className={cn(hud, "bottom-full left-0 mb-[0.5em] flex items-center gap-[0.6em]")} style={{ ...hudStyle, animation: "tech-text-in .5s .2s ease-out both" }}>
          <span className="inline-block size-[0.6em] rounded-full" style={{ background: "var(--tech)", animation: "tech-text-blink 1.2s steps(1) infinite" }} />
          {label}
        </span>
        <span className={cn(hud, "right-0 top-full mt-[0.5em]")} style={{ ...hudStyle, opacity: 0.8, animation: "tech-text-in .5s .35s ease-out both" }}>
          {sublabel} · <span ref={readout}>000%</span>
        </span>
        <span className="relative whitespace-pre">
          {chars.map((c, i) => {
            const d = 300 + i * speed + jitter(i) * speed * 3;
            return (
              <span
                key={i}
                style={{ animation: `tech-text-flicker 480ms linear ${d}ms both, tech-text-glow 900ms ease-out ${d}ms both` }}
              >
                {c}
              </span>
            );
          })}
          {caret && (
            <span
              className="ml-[0.08em] inline-block h-[0.8em] w-[0.5em] align-[-0.05em]"
              style={{ background: "var(--tech)", boxShadow: "0 0 10px var(--tech)", animation: "tech-text-blink 1s steps(1) infinite" }}
            />
          )}
        </span>
      </div>
    </div>
  );
}
