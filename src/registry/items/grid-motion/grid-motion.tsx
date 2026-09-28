"use client";

import { useEffect, useRef } from "react";

export interface GridMotionProps {
  /** Tile contents: image URLs or short labels. Repeats to fill the grid. */
  items?: string[];
  rows?: number;
  columns?: number;
  /** Grid rotation in degrees. */
  tilt?: number;
  /** Max horizontal slide in px when the cursor is at an edge. */
  strength?: number;
  /** Gap between tiles in px. */
  gap?: number;
  className?: string;
}

const isImage = (s: string) => /^(https?:|\/|\.|data:image|blob:)/.test(s);

export function GridMotion({
  items = [],
  rows = 4,
  columns = 7,
  tilt = -12,
  strength = 260,
  gap = 16,
  className,
}: GridMotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = ref.current!;
    const zone = host.parentElement ?? host;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let target = 0; // -0.5..0.5, cursor x relative to center
    const pos = rowRefs.current.map(() => 0);
    let raf = 0;

    const tick = () => {
      let moving = false;
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const goal = target * strength * (i % 2 ? -1 : 1);
        // each row trails at its own pace for a layered feel
        pos[i] += (goal - pos[i]) * (0.05 + 0.025 * (i % 3));
        if (Math.abs(goal - pos[i]) > 0.1) moving = true;
        row.style.transform = `translate3d(${pos[i].toFixed(2)}px,0,0)`;
      });
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target = (e.clientX - r.left) / r.width - 0.5;
      kick();
    };
    const leave = () => {
      target = 0;
      kick();
    };
    zone.addEventListener("pointermove", move);
    zone.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerleave", leave);
    };
  }, [strength, rows]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "150%",
          height: "150%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap,
          transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
        }}
      >
        {Array.from({ length: rows }, (_, r) => (
          <div
            key={r}
            ref={(el) => {
              rowRefs.current[r] = el;
            }}
            style={{ display: "flex", gap, flex: 1, minHeight: 0, willChange: "transform" }}
          >
            {Array.from({ length: columns }, (_, c) => {
              const n = r * columns + c;
              const item = items.length ? items[n % items.length] : String(n + 1).padStart(2, "0");
              return (
                <div
                  key={c}
                  className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-muted"
                  style={
                    isImage(item)
                      ? { backgroundImage: `url("${item}")`, backgroundSize: "cover", backgroundPosition: "center" }
                      : undefined
                  }
                >
                  {!isImage(item) && (
                    <span className="absolute inset-0 grid place-items-center text-2xl font-semibold text-muted-foreground">
                      {item}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
