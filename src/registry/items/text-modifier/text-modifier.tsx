"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const css = `@keyframes text-modifier-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`;

export type TextModifierAction = "underline" | "circle" | "box" | "strike" | "cross";

export interface TextModifierProps {
  children: ReactNode;
  /** Annotation to draw. */
  action?: TextModifierAction;
  /** Pen color. */
  color?: string;
  /** Pen width, in px. */
  strokeWidth?: number;
  /** Space between the text and the annotation, in px. */
  padding?: number;
  /** Draw duration, in ms. */
  duration?: number;
  /** Delay after entering view, in ms. */
  delay?: number;
  /** Changes the hand-drawn wobble. */
  seed?: number;
  className?: string;
}

type Pt = [number, number];

function rng(seed: number) {
  let s = seed * 2654435761;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
  };
}

// Smooth curve through points using midpoint quadratics.
const smooth = (p: Pt[]) =>
  p.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const [nx, ny] = p[i + 1] ?? [x, y];
    return `${d} Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`;
  }, "");

function annotate(action: TextModifierAction, w: number, h: number, pad: number, seed: number) {
  const r = rng(seed);
  const j = (n: number) => r() * n;
  switch (action) {
    case "underline": {
      const y = h + pad * 0.3;
      return smooth([
        [-pad * 0.6, y + j(3)],
        [w * 0.5, y + 2 + j(4)],
        [w + pad * 0.6, y - 2 + j(3)],
        [w * 0.55, y + 5 + j(3)],
        [w * 0.08, y + 8 + j(3)],
      ]);
    }
    case "strike": {
      const y = h * 0.55;
      return smooth([[-pad * 0.6, y + j(4)], [w * 0.5, y - 3 + j(4)], [w + pad * 0.6, y + j(4)]]);
    }
    case "cross": {
      const a = smooth([[-pad * 0.4, -pad * 0.3 + j(4)], [w * 0.5 + j(6), h * 0.5], [w + pad * 0.4, h + pad * 0.3 + j(4)]]);
      const b = smooth([[w + pad * 0.4, -pad * 0.3 + j(4)], [w * 0.5 + j(6), h * 0.5], [-pad * 0.4, h + pad * 0.3 + j(4)]]);
      return `${a} ${b}`;
    }
    case "box": {
      const x0 = -pad, y0 = -pad * 0.6, x1 = w + pad, y1 = h + pad * 0.6;
      const c = (x: number, y: number): Pt => [x + j(pad * 0.5), y + j(pad * 0.5)];
      return smooth([
        c(x0 + pad, y0), c(x1, y0 - 1), c(x1, y0), c(x1 + 1, y1), c(x1, y1),
        c(x0, y1 + 1), c(x0, y1), c(x0 - 1, y0), c(x0, y0), c(x0 + pad * 2.5, y0 - 2),
      ]);
    }
    default: {
      const cx = w / 2, cy = h / 2, rx = w / 2 + pad * 1.3, ry = h / 2 + pad;
      const start = -Math.PI * 0.62 + j(0.3);
      const steps = 44;
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = start + t * Math.PI * 2 * 1.12;
        const k = 1 + 0.07 * t + 0.03 * Math.sin(t * 9 + seed);
        pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k * 0.98]);
      }
      return smooth(pts);
    }
  }
}

export function TextModifier({
  children,
  action = "circle",
  color = "#fb7185",
  strokeWidth = 3,
  padding = 8,
  duration = 900,
  delay = 0,
  seed = 3,
  className,
}: TextModifierProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<[number, number] | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize([el.offsetWidth, el.offsetHeight]));
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, { threshold: 0.6 });
    ro.observe(el);
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const d = size ? annotate(action, size[0], size[1], padding, seed) : "";

  return (
    <span ref={ref} className={className} style={{ position: "relative", display: "inline-block" }}>
      <style href="text-modifier" precedence="default">
        {css}
      </style>
      {children}
      {size && on && (
        <svg
          aria-hidden
          width={size[0]}
          height={size[1]}
          style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        >
          <path
            key={action}
            d={d}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            style={{ animation: `text-modifier-draw ${duration}ms cubic-bezier(.55,.1,.3,1) ${delay}ms both` }}
          />
        </svg>
      )}
    </span>
  );
}
