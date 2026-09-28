"use client";

import { useEffect, useRef } from "react";

export interface SquaresGridProps {
  /** Px per square. */
  squareSize?: number;
  /** Px per frame; 0 holds the grid still. */
  speed?: number;
  direction?: "diagonal" | "up" | "down" | "left" | "right";
  borderColor?: string;
  hoverFill?: string;
  className?: string;
}

const vectors = {
  diagonal: [-1, -1],
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
} as const;

export function SquaresGrid({
  squareSize = 40,
  speed = 0.5,
  direction = "diagonal",
  borderColor = "#27272a",
  hoverFill = "#1f2a12",
  className,
}: SquaresGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [vx, vy] = vectors[direction];
    const moving = speed > 0 && !reduced;
    const mouse = { x: -1, y: -1 };
    let w = 0;
    let h = 0;
    let ox = 0;
    let oy = 0;
    let raf = 0;
    let visible = true;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      const sx = ((ox % squareSize) + squareSize) % squareSize;
      const sy = ((oy % squareSize) + squareSize) % squareSize;
      for (let x = sx - squareSize; x < w; x += squareSize) {
        for (let y = sy - squareSize; y < h; y += squareSize) {
          if (mouse.x >= x && mouse.x < x + squareSize && mouse.y >= y && mouse.y < y + squareSize) {
            ctx.fillStyle = hoverFill;
            ctx.fillRect(x, y, squareSize, squareSize);
          }
          ctx.strokeRect(x + 0.5, y + 0.5, squareSize, squareSize);
        }
      }
    };

    const loop = () => {
      ox += vx * speed;
      oy += vy * speed;
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (!moving) draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && moving && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [squareSize, speed, direction, borderColor, hoverFill]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
