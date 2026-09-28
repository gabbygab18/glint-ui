"use client";

import { useEffect, useRef } from "react";

export interface EchoTextProps {
  text?: string;
  /** Number of trailing copies. */
  echoes?: number;
  /** How fast each echo catches up with the one ahead (0-1). Lower is a longer trail. */
  lag?: number;
  /** Drift on a loop, or follow the pointer. */
  mode?: "loop" | "pointer";
  /** Maximum travel of the lead text, in px. */
  amplitude?: number;
  color?: string;
  echoColor?: string;
  /** Draw echoes as outlines instead of solid copies. */
  outline?: boolean;
  className?: string;
}

export function EchoText({
  text = "ECHO",
  echoes = 7,
  lag = 0.1,
  mode = "loop",
  amplitude = 60,
  color = "#fafafa",
  echoColor = "#a3e635",
  outline = true,
  className,
}: EchoTextProps) {
  const root = useRef<HTMLDivElement>(null);
  const copies = useRef<(HTMLSpanElement | null)[]>([]);
  const n = Math.max(0, Math.round(echoes));

  useEffect(() => {
    const el = root.current!;
    const area = el.parentElement ?? el;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pos = Array.from({ length: n + 1 }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    let raf = 0;
    let visible = true;

    const loop = (now: number) => {
      if (mode === "loop") {
        const t = now / 1000;
        target.x = Math.sin(t * 1.6) * amplitude;
        target.y = Math.sin(t * 3.2) * amplitude * 0.35;
      }
      pos[0].x += (target.x - pos[0].x) * 0.18;
      pos[0].y += (target.y - pos[0].y) * 0.18;
      for (let i = 1; i <= n; i++) {
        pos[i].x += (pos[i - 1].x - pos[i].x) * lag;
        pos[i].y += (pos[i - 1].y - pos[i].y) * lag;
      }
      for (let i = 0; i <= n; i++) {
        const c = copies.current[i];
        if (c) c.style.transform = `translate3d(${pos[i].x}px, ${pos[i].y}px, 0)`;
      }
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-amplitude, Math.min(amplitude, v));
      target.x = clamp((e.clientX - r.left - r.width / 2) * 0.3);
      target.y = clamp((e.clientY - r.top - r.height / 2) * 0.3);
    };
    const leave = () => {
      target.x = 0;
      target.y = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    if (mode === "pointer") {
      area.addEventListener("pointermove", move, { passive: true });
      area.addEventListener("pointerleave", leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, [n, lag, mode, amplitude]);

  return (
    <div ref={root} className={className} style={{ position: "relative", display: "inline-block" }}>
      <span className="sr-only">{text}</span>
      {Array.from({ length: n }, (_, k) => {
        const i = n - k; // farthest echo first so the lead paints on top
        const fade = 1 - i / (n + 1);
        return (
          <span
            key={i}
            ref={(node) => {
              copies.current[i] = node;
            }}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              whiteSpace: "pre",
              opacity: 0.15 + fade * 0.7,
              color: outline ? "transparent" : echoColor,
              WebkitTextStroke: outline ? `1.5px ${echoColor}` : undefined,
              filter: `blur(${(i / (n + 1)) * 1.5}px)`,
              willChange: "transform",
            }}
          >
            {text}
          </span>
        );
      })}
      <span
        ref={(node) => {
          copies.current[0] = node;
        }}
        aria-hidden
        style={{ position: "relative", display: "block", whiteSpace: "pre", color, willChange: "transform" }}
      >
        {text}
      </span>
    </div>
  );
}
