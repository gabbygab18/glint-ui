"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CrosshairProps {
  children?: ReactNode;
  color?: string;
  /** Line width in px. */
  thickness?: number;
  /** Show live x/y readouts on the lines. */
  showCoords?: boolean;
  /** Distort the lines briefly when the pointer enters a target. */
  glitch?: boolean;
  /** Elements that trigger the glitch. */
  targetSelector?: string;
  /** Hide the native cursor inside the container. */
  hideCursor?: boolean;
  className?: string;
}

const pad = (n: number) => String(Math.round(n)).padStart(4, "0");

export function Crosshair({
  children,
  color = "#ffffff",
  thickness = 1,
  showCoords = true,
  glitch = true,
  targetSelector = "a, button",
  hideCursor = true,
  className,
}: CrosshairProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const filterId = "crosshair-" + useId().replace(/[^\w-]/g, "");

  useEffect(() => {
    const root = rootRef.current!;
    const svg = svgRef.current!;
    const q = <T extends Element>(s: string) => svg.querySelector(s) as T;
    const hLine = q<SVGLineElement>("[data-h]");
    const vLine = q<SVGLineElement>("[data-v]");
    const ring = q<SVGCircleElement>("[data-ring]");
    const xLabel = q<SVGTextElement>("[data-x]");
    const yLabel = q<SVGTextElement>("[data-y]");
    const turb = q<SVGFETurbulenceElement>("feTurbulence");
    const disp = q<SVGFEDisplacementMapElement>("feDisplacementMap");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    let y = 0;
    let raf = 0;
    let glitchAt = -1;
    let target: Element | null = null;

    const render = (now: number) => {
      raf = 0;
      hLine.setAttribute("y1", String(y));
      hLine.setAttribute("y2", String(y));
      vLine.setAttribute("x1", String(x));
      vLine.setAttribute("x2", String(x));
      ring.setAttribute("cx", String(x));
      ring.setAttribute("cy", String(y));
      xLabel.setAttribute("x", String(x + 8));
      xLabel.textContent = `X ${pad(x)}`;
      yLabel.setAttribute("y", String(y - 8));
      yLabel.textContent = `Y ${pad(y)}`;
      if (glitchAt >= 0) {
        const p = (now - glitchAt) / 520;
        if (p >= 1) {
          glitchAt = -1;
          disp.setAttribute("scale", "0");
        } else {
          // Random frequency + seed per frame reads as a torn, flickering signal.
          const burst = Math.random() > 0.25 ? 1 : 0.15;
          disp.setAttribute("scale", String(36 * (1 - p) * burst));
          turb.setAttribute("seed", String((Math.random() * 1000) | 0));
          turb.setAttribute("baseFrequency", `${0.002 + Math.random() * 0.01} ${0.04 + Math.random() * 0.3}`);
          raf = requestAnimationFrame(render);
        }
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      svg.style.opacity = "1";
      const hit = (e.target as Element).closest?.(targetSelector);
      const next = hit && root.contains(hit) ? hit : null;
      if (next !== target) {
        target = next;
        ring.setAttribute("r", target ? "14" : "5");
        if (target && glitch && !reduced) glitchAt = performance.now();
      }
      schedule();
    };
    const onLeave = () => {
      svg.style.opacity = "0";
      target = null;
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [glitch, targetSelector]);

  const text = { fill: color, fontSize: 10, fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em", opacity: 0.7 };

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      data-crosshair-hide={hideCursor ? "" : undefined}
    >
      <style href="crosshair" precedence="default">
        {`[data-crosshair-hide],[data-crosshair-hide] *{cursor:none!important}`}
      </style>
      {children}
      <svg
        ref={svgRef}
        aria-hidden
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, transition: "opacity .25s" }}
      >
        <filter id={filterId} filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.2" numOctaves="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <g filter={`url(#${filterId})`} stroke={color} strokeWidth={thickness}>
          <line data-h x1="0" x2="100%" opacity={0.55} />
          <line data-v y1="0" y2="100%" opacity={0.55} />
          <circle data-ring r="5" fill="none" style={{ transition: "r .25s cubic-bezier(.3,1.6,.5,1)" }} />
        </g>
        <g style={{ display: showCoords ? undefined : "none" }}>
          <text data-x y="18" style={text} />
          <text data-y x="10" style={text} />
        </g>
      </svg>
    </div>
  );
}
