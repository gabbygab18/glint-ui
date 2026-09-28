"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface CurvedLoopProps {
  text?: string;
  /** Scroll speed in viewBox px per frame (60fps). */
  speed?: number;
  /** Depth of the curve in viewBox px; negative bends upward. */
  curveAmount?: number;
  direction?: "left" | "right";
  /** Drag to scrub; the release flick sets the new direction. */
  interactive?: boolean;
  className?: string;
}

const W = 1440;
const FONT = 72;

export function CurvedLoop({
  text = "Glint ✦ Motion ✦ Components ✦ ",
  speed = 2,
  curveAmount = 300,
  direction = "left",
  interactive = true,
  className,
}: CurvedLoopProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const measure = useRef<SVGTextElement>(null);
  const tp = useRef<SVGTextPathElement>(null);
  const [spacing, setSpacing] = useState(0);

  const y = 80 + Math.max(0, -curveAmount / 2);
  const height = y + Math.max(0, curveAmount / 2) + 40;
  const d = `M -100,${y} Q ${W / 2},${y + curveAmount} ${W + 100},${y}`;

  useEffect(() => {
    const m = () => setSpacing(measure.current?.getComputedTextLength() ?? 0);
    m();
    document.fonts?.ready.then(m);
  }, [text]);

  useEffect(() => {
    const el = svg.current;
    const path = tp.current;
    if (!el || !path || !spacing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = -spacing;
    let dir = direction === "left" ? -1 : 1;
    let drag: { x: number; v: number } | null = null;
    let raf = 0;
    let last = 0;
    let visible = true;

    const set = () => {
      offset = ((((offset % spacing) - spacing) % spacing) + spacing) % spacing;
      path.setAttribute("startOffset", `${offset - spacing}`);
    };
    const loop = (now: number) => {
      const k = last ? Math.min((now - last) / 16.67, 3) : 1;
      last = now;
      if (!drag && !reduced) offset += speed * dir * k;
      set();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const scale = () => W / el.getBoundingClientRect().width;
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, v: 0 };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) * scale();
      drag.x = e.clientX;
      drag.v = dx;
      offset += dx;
    };
    const up = () => {
      if (drag && Math.abs(drag.v) > 0.5) dir = Math.sign(drag.v);
      drag = null;
      el.style.cursor = "grab";
    };

    set();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);
    if (interactive) {
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [spacing, speed, direction, interactive]);

  const copies = spacing ? Math.ceil((W + 400) / spacing) + 2 : 0;
  return (
    <div className={className} style={{ width: "100%", userSelect: "none" }}>
      <span className="sr-only">{text}</span>
      <svg
        ref={svg}
        aria-hidden
        viewBox={`0 0 ${W} ${height}`}
        style={{
          display: "block",
          width: "100%",
          overflow: "visible",
          cursor: interactive ? "grab" : undefined,
          touchAction: interactive ? "pan-y" : undefined,
          visibility: spacing ? "visible" : "hidden",
        }}
      >
        <text ref={measure} fontSize={FONT} style={{ whiteSpace: "pre", visibility: "hidden" }} x={0} y={-999}>
          {text}
        </text>
        <defs>
          <path id={`cl-${id}`} d={d} fill="none" />
        </defs>
        {copies > 0 && (
          <text fontSize={FONT} fill="currentColor" style={{ whiteSpace: "pre" }}>
            <textPath ref={tp} href={`#cl-${id}`}>
              {text.repeat(copies)}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
