"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TextCursorProps {
  /** Glyphs or emoji dropped along the trail, used in order. */
  items?: string[];
  /** Colors cycled per glyph. Emoji keep their own colors. */
  colors?: string[];
  /** Px the pointer travels between glyphs. */
  spacing?: number;
  /** Ms each glyph lives. */
  lifetime?: number;
  /** Glyph size in px. */
  size?: number;
  /** Degrees each glyph spins while fading. */
  spin?: number;
  /** Cap on glyphs alive at once. */
  maxItems?: number;
  children?: ReactNode;
  className?: string;
}

export function TextCursor({
  items = ["✦", "✧", "✶", "⋆"],
  colors = ["#bef264", "#67e8f9", "#f0abfc"],
  spacing = 22,
  lifetime = 1000,
  size = 30,
  spin = 180,
  maxItems = 60,
  children,
  className,
}: TextCursorProps) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const count = useRef(0);

  const spawn = (x: number, y: number, angle: number) => {
    const host = layer.current;
    if (!host || !items.length) return;
    const n = count.current++;
    const el = document.createElement("span");
    el.textContent = items[n % items.length];
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:${size}px;line-height:1;color:${
      colors.length ? colors[n % colors.length] : "currentColor"
    };text-shadow:0 0 12px currentColor;will-change:transform,opacity`;
    host.appendChild(el);
    while (host.childElementCount > maxItems) host.firstElementChild?.remove();
    // Drift backwards from the direction of travel, with a little sideways scatter and gravity.
    const back = 18 + Math.random() * 22;
    const dx = -Math.cos(angle) * back + (Math.random() - 0.5) * 24;
    const dy = -Math.sin(angle) * back + (Math.random() - 0.5) * 24 + 18;
    const r0 = (Math.random() - 0.5) * 60;
    const r1 = r0 + (Math.random() < 0.5 ? -spin : spin);
    const anim = el.animate(
      [
        { transform: `translate(-50%,-50%) rotate(${r0}deg) scale(0.3)`, opacity: 0, easing: "cubic-bezier(.2,1.4,.4,1)" },
        { transform: `translate(-50%,-50%) rotate(${r0}deg) scale(1.15)`, opacity: 1, offset: 0.12, easing: "ease-out" },
        {
          transform: `translate(calc(-50% + ${dx * 0.5}px),calc(-50% + ${dy * 0.5}px)) rotate(${(r0 + r1) / 2}deg) scale(0.9)`,
          opacity: 0.9,
          offset: 0.55,
          easing: "ease-in",
        },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${r1}deg) scale(0.2)`, opacity: 0 },
      ],
      { duration: lifetime, fill: "forwards" },
    );
    anim.onfinish = () => el.remove();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = root.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const prev = last.current;
    if (!prev) {
      last.current = { x, y };
      return;
    }
    const dist = Math.hypot(x - prev.x, y - prev.y);
    const step = Math.max(4, spacing);
    if (dist < step) return;
    const angle = Math.atan2(y - prev.y, x - prev.x);
    // Fill fast moves with evenly spaced glyphs so the trail never gaps.
    const steps = Math.min(8, Math.floor(dist / step));
    for (let k = 1; k <= steps; k++) {
      spawn(prev.x + ((x - prev.x) * k) / steps, prev.y + ((y - prev.y) * k) / steps, angle);
    }
    last.current = { x, y };
  };

  return (
    <div
      ref={root}
      className={cn("relative overflow-hidden", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => (last.current = null)}
    >
      {children}
      <div ref={layer} aria-hidden className="pointer-events-none absolute inset-0 select-none" />
    </div>
  );
}
