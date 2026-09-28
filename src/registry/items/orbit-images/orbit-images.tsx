"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface OrbitImagesProps {
  /** Image URLs placed evenly around the orbit. */
  images: string[];
  /** Content in the middle of the orbit. */
  children?: ReactNode;
  /** Horizontal orbit radius in px. */
  radius?: number;
  /** Tilt of the orbit plane in degrees (0 = seen from above, 90 = edge-on). */
  tilt?: number;
  /** Seconds per revolution. Negative spins the other way. */
  duration?: number;
  /** Image width in px. */
  size?: number;
  /** Ease to a stop while hovered. */
  pauseOnHover?: boolean;
  className?: string;
}

// Position of item i on the tilted ellipse: nearer items are larger, brighter and on top.
function pose(a: number, radius: number, ry: number) {
  const depth = Math.sin(a); // -1 back, +1 front
  const k = (depth + 1) / 2;
  return {
    transform: `translate(-50%, -50%) translate3d(${(Math.cos(a) * radius).toFixed(2)}px, ${(depth * ry).toFixed(2)}px, 0) scale(${(0.55 + 0.5 * k).toFixed(4)})`,
    zIndex: String(depth > 0 ? 20 + Math.round(k * 10) : Math.round(k * 10)),
    filter: `brightness(${(0.45 + 0.55 * k).toFixed(3)}) blur(${((1 - k) * 1.5).toFixed(2)}px)`,
  };
}

export function OrbitImages({
  images,
  children,
  radius = 320,
  tilt = 64,
  duration = 28,
  size = 110,
  pauseOnHover = true,
  className,
}: OrbitImagesProps) {
  const root = useRef<HTMLDivElement>(null);
  const ryInit = radius * Math.cos((tilt * Math.PI) / 180);
  const items = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = root.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ry = radius * Math.cos((tilt * Math.PI) / 180);
    const n = images.length;
    let angle = 0;
    let rate = 1;
    let hovered = false;
    let raf = 0;
    let visible = true;
    let prev = performance.now();

    const place = () => {
      for (let i = 0; i < n; i++) {
        const node = items.current[i];
        if (!node) continue;
        Object.assign(node.style, pose(angle + (i / n) * Math.PI * 2, radius, ry));
      }
    };
    const loop = (now: number) => {
      const dt = Math.min(now - prev, 50) / 1000;
      prev = now;
      rate += ((hovered && pauseOnHover ? 0 : 1) - rate) * Math.min(1, dt * 4);
      angle += ((Math.PI * 2) / duration) * dt * rate;
      place();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    place();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);
    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [images, radius, tilt, duration, pauseOnHover]);

  return (
    <div ref={root} className={cn("relative", className)}>
      {children && (
        <div className="absolute top-1/2 left-1/2 z-[15] -translate-x-1/2 -translate-y-1/2">{children}</div>
      )}
      {images.map((src, i) => (
        <div
          key={src + i}
          ref={(node) => {
            items.current[i] = node;
          }}
          className="absolute top-1/2 left-1/2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          style={{ width: size, aspectRatio: "3 / 4", willChange: "transform", ...pose((i / images.length) * Math.PI * 2, radius, ryInit) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="size-full object-cover" />
        </div>
      ))}
    </div>
  );
}
