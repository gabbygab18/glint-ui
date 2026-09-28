"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

export interface ClickSparkProps {
  children?: ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  /** How far sparks travel, in px. */
  sparkRadius?: number;
  /** Length of each spark line, in px. */
  sparkSize?: number;
  /** Ms per burst. */
  duration?: number;
  className?: string;
}

type Spark = { x: number; y: number; angle: number; t0: number };

export function ClickSpark({
  children,
  sparkColor = "#ffffff",
  sparkCount = 8,
  sparkRadius = 24,
  sparkSize = 10,
  duration = 400,
  className,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparks = useRef<Spark[]>([]);
  const raf = useRef(0);
  const draw = useRef<(now: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(canvas);

    draw.current = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks.current = sparks.current.filter((s) => now - s.t0 < duration);
      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      for (const s of sparks.current) {
        const p = (now - s.t0) / duration;
        const eased = p * (2 - p);
        const dist = eased * sparkRadius;
        const len = sparkSize * (1 - eased);
        const cos = Math.cos(s.angle);
        const sin = Math.sin(s.angle);
        ctx.beginPath();
        ctx.moveTo(s.x + dist * cos, s.y + dist * sin);
        ctx.lineTo(s.x + (dist + len) * cos, s.y + (dist + len) * sin);
        ctx.stroke();
      }
      // Loop only while sparks are alive: idle costs nothing.
      raf.current = sparks.current.length ? requestAnimationFrame(draw.current) : 0;
    };

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [sparkColor, sparkRadius, sparkSize, duration]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const t0 = performance.now();
    for (let i = 0; i < sparkCount; i++) {
      sparks.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        angle: (2 * Math.PI * i) / sparkCount,
        t0,
      });
    }
    if (!raf.current) raf.current = requestAnimationFrame(draw.current);
  };

  return (
    <div className={className} style={{ position: "relative" }} onPointerDown={onPointerDown}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
