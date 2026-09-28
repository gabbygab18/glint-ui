"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BlobCursorProps {
  children?: ReactNode;
  color?: string;
  /** Number of trailing blobs. */
  count?: number;
  /** Diameter of the lead blob in px. */
  size?: number;
  /** 0 = blobs move together, 1 = long lazy tail. */
  lag?: number;
  /** Blur radius of the goo filter; higher melts blobs together from further away. */
  goo?: number;
  blendMode?: "difference" | "normal" | "screen" | "exclusion";
  /** Hide the native cursor inside the container. */
  hideCursor?: boolean;
  className?: string;
}

export function BlobCursor({
  children,
  color = "#c6ff3d",
  count = 4,
  size = 96,
  lag = 0.5,
  goo = 14,
  blendMode = "difference",
  hideCursor = true,
  className,
}: BlobCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobs = useRef<(HTMLDivElement | null)[]>([]);
  const filterId = "blob-goo-" + useId().replace(/[^\w-]/g, "");

  useEffect(() => {
    const root = rootRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: root.offsetWidth / 2, y: root.offsetHeight / 2 };
    const pos = Array.from({ length: count }, () => ({ ...target }));
    let raf = 0;
    let last = 0;
    let visible = true;

    const loop = (now: number) => {
      const dt = Math.min((now - (last || now)) / 16.67, 3);
      last = now;
      const t = now / 1000;
      pos.forEach((p, i) => {
        const k = reduced ? 1 : 1 - Math.pow(1 - 0.38 / (1 + i * lag * 2.2), dt);
        p.x += (target.x - p.x) * k;
        p.y += (target.y - p.y) * k;
        // A slow orbit keeps the goo breathing while the pointer rests.
        const wob = reduced || i === 0 ? 0 : size * (0.22 + i * 0.06);
        const s = size * Math.max(0.3, 1 - i * 0.17);
        const x = p.x + Math.cos(t * 1.3 + i * 2.1) * wob - s / 2;
        const y = p.y + Math.sin(t * 1.7 + i * 1.3) * wob - s / 2;
        const el = blobs.current[i];
        if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(root);
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
    };
  }, [count, size, lag]);

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      data-blob-cursor-hide={hideCursor ? "" : undefined}
    >
      <style href="blob-cursor" precedence="default">
        {`[data-blob-cursor-hide],[data-blob-cursor-hide] *{cursor:none!important}`}
      </style>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={goo} result="blur" />
          <feColorMatrix in="blur" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${goo * 1.6} -${goo * 0.7}`} />
        </filter>
      </svg>
      {children}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none", filter: `url(#${filterId})`, mixBlendMode: blendMode }}
      >
        {Array.from({ length: count }, (_, i) => {
          const s = size * Math.max(0.3, 1 - i * 0.17);
          return (
            <div
              key={i}
              ref={(el) => {
                blobs.current[i] = el;
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: s,
                height: s,
                borderRadius: "50%",
                background: color,
                willChange: "transform",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "22%",
                  top: "20%",
                  width: "26%",
                  height: "26%",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.75)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
