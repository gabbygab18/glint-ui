"use client";

import { useEffect, useRef } from "react";

export interface FuzzyTextProps {
  text?: string;
  /** Any CSS font-size; resolved to px for the canvas. */
  fontSize?: string;
  fontWeight?: number;
  color?: string;
  /** Jitter at rest, 0-1. */
  baseIntensity?: number;
  /** Jitter while the pointer is over the text, 0-1. */
  hoverIntensity?: number;
  /** Maximum horizontal displacement of a row, in px. */
  fuzzRange?: number;
  /** Ramp up the jitter on hover. */
  enableHover?: boolean;
  className?: string;
}

export function FuzzyText({
  text = "FUZZY",
  fontSize = "clamp(4rem, 15vw, 10rem)",
  fontWeight = 900,
  color = "#fafafa",
  baseIntensity = 0.18,
  hoverIntensity = 0.55,
  fuzzRange = 30,
  enableHover = true,
  className,
}: FuzzyTextProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = wrap.current!;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let tw = 0;
    let th = 0;
    let pad = 0;
    let intensity = baseIntensity;
    let target = baseIntensity;
    let raf = 0;
    let visible = true;

    const layout = () => {
      const cs = getComputedStyle(root);
      const px = parseFloat(cs.fontSize) || 96;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const font = `${fontWeight} ${px}px ${cs.fontFamily}`;
      octx.font = font;
      const m = octx.measureText(text);
      const left = m.actualBoundingBoxLeft;
      tw = Math.ceil(left + m.actualBoundingBoxRight) + 4;
      const asc = m.actualBoundingBoxAscent;
      th = Math.ceil(asc + m.actualBoundingBoxDescent) + 8;
      pad = fuzzRange;
      off.width = tw * dpr;
      off.height = th * dpr;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.font = font;
      octx.fillStyle = color;
      octx.textBaseline = "alphabetic";
      octx.fillText(text, left + 2, asc + 4);
      canvas.width = (tw + pad * 2) * dpr;
      canvas.height = th * dpr;
      canvas.style.width = `${tw + pad * 2}px`;
      canvas.style.height = `${th}px`;
      canvas.style.margin = `0 ${-pad}px`;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const range = reduced ? 0 : intensity * pad * dpr;
      const w = off.width;
      // One device-pixel row at a time, each shoved sideways by its own random amount.
      for (let y = 0; y < off.height; y++) {
        const dx = (Math.random() - 0.5) * 2 * range;
        ctx.drawImage(off, 0, y, w, 1, pad * dpr + dx, y, w, 1);
      }
    };

    const loop = () => {
      intensity += (target - intensity) * 0.12;
      draw();
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x > pad && x < r.width - pad && y > 0 && y < r.height;
      target = inside ? hoverIntensity : baseIntensity;
    };
    const leave = () => (target = baseIntensity);

    layout();
    document.fonts?.ready.then(layout);
    window.addEventListener("resize", layout);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    if (enableHover) {
      canvas.addEventListener("pointermove", move, { passive: true });
      canvas.addEventListener("pointerleave", leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      raf = -1;
      io.disconnect();
      window.removeEventListener("resize", layout);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [text, fontSize, fontWeight, color, baseIntensity, hoverIntensity, fuzzRange, enableHover]);

  return (
    <span ref={wrap} className={className} style={{ display: "inline-block", fontSize, lineHeight: 0 }}>
      <span className="sr-only">{text}</span>
      <canvas ref={ref} aria-hidden style={{ display: "block" }} />
    </span>
  );
}
