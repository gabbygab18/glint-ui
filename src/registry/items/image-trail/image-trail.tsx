"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ImageTrailProps {
  /** Image URLs, spawned in order. */
  images: string[];
  children?: ReactNode;
  /** Px the cursor travels between spawns. */
  threshold?: number;
  /** Image width in px (height follows the image aspect ratio). */
  size?: number;
  /** Lifetime of each image in ms. */
  duration?: number;
  /** Max random tilt in degrees. */
  rotation?: number;
  className?: string;
}

export function ImageTrail({
  images,
  children,
  threshold = 60,
  size = 150,
  duration = 1100,
  rotation = 10,
  className,
}: ImageTrailProps) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const box = layer.current!;
    if (!images.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Warm the cache so the first pass of the trail does not pop in empty.
    images.forEach((s) => (new Image().src = s));
    let last: { x: number; y: number } | null = null;
    let idx = 0;
    let z = 1;

    const spawn = (x: number, y: number, dx: number, dy: number) => {
      const img = document.createElement("img");
      img.src = images[idx++ % images.length];
      img.alt = "";
      img.draggable = false;
      const rot = (Math.random() * 2 - 1) * rotation;
      Object.assign(img.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        borderRadius: "14px",
        boxShadow: "0 18px 40px -12px rgba(0,0,0,.55)",
        zIndex: String(z++),
        pointerEvents: "none",
        willChange: "transform, opacity",
      });
      box.appendChild(img);
      const len = Math.hypot(dx, dy) || 1;
      const drift = `${(dx / len) * 40}px, ${(dy / len) * 40}px`;
      const at = (t: string, s: number, r = rot) => `translate(-50%, -50%) translate(${t}) rotate(${r}deg) scale(${s})`;
      const frames: Keyframe[] = reduced
        ? [{ opacity: 1, transform: at("0,0", 1) }, { opacity: 0, transform: at("0,0", 1) }]
        : [
            { opacity: 0, transform: at("0,0", 0.4, 0) },
            { opacity: 1, transform: at("0,0", 1.04), offset: 0.14, easing: "cubic-bezier(.2,.8,.2,1)" },
            { opacity: 1, transform: at("0,0", 1), offset: 0.55 },
            { opacity: 0, transform: at(drift, 0.7) },
          ];
      img.animate(frames, { duration, easing: "ease-in", fill: "forwards" }).finished.then(
        () => img.remove(),
        () => img.remove(),
      );
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (!last) {
        last = { x, y };
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      if (Math.hypot(dx, dy) >= threshold) {
        spawn(x, y, dx, dy);
        last = { x, y };
      }
    };
    const onLeave = () => (last = null);

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      box.replaceChildren();
    };
  }, [images, threshold, size, duration, rotation]);

  return (
    <div ref={root} className={cn("relative overflow-hidden", className)}>
      <div ref={layer} aria-hidden className="pointer-events-none absolute inset-0" />
      {children}
    </div>
  );
}
