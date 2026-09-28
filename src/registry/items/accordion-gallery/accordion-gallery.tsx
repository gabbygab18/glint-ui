"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type KeyboardEvent } from "react";

export interface AccordionGalleryItem {
  src: string;
  title: string;
  subtitle?: string;
}

export interface AccordionGalleryProps {
  items: AccordionGalleryItem[];
  /** Height of the row in px. */
  height?: number;
  /** How many times wider the open panel is than a closed one. */
  expandRatio?: number;
  /** Px between panels. */
  gap?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Transition length in ms. */
  duration?: number;
  /** Index of the panel open at rest. */
  defaultIndex?: number;
  className?: string;
}

export function AccordionGallery({
  items,
  height = 380,
  expandRatio = 5,
  gap = 10,
  radius = 20,
  duration = 700,
  defaultIndex = 0,
  className,
}: AccordionGalleryProps) {
  const [active, setActive] = useState(defaultIndex);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const ease = "cubic-bezier(.22,.9,.24,1)";

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    refs.current[(i + step + items.length) % items.length]?.focus();
  };

  return (
    <div role="list" className={`flex w-full ${className ?? ""}`} style={{ height, gap }}>
      {items.map((item, i) => {
        const open = i === active;
        return (
          <div
            key={item.src + i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="listitem"
            tabIndex={0}
            aria-label={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
            aria-current={open || undefined}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="group relative min-w-0 cursor-pointer overflow-hidden bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:!transition-none"
            style={{
              flex: `${open ? expandRatio : 1} 1 0%`,
              borderRadius: radius,
              transition: `flex-grow ${duration}ms ${ease}`,
            }}
          >
            <img
              src={item.src}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full object-cover motion-reduce:!transition-none"
              style={{
                transform: open ? "scale(1)" : "scale(1.15)",
                filter: open ? "none" : "saturate(.6) brightness(.7)",
                transition: `transform ${duration * 1.4}ms ${ease}, filter ${duration}ms ${ease}`,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
              style={{ opacity: open ? 1 : 0.6, transition: `opacity ${duration}ms ${ease}` }}
            />
            {/* Closed: a vertical label. Open: the full caption. */}
            <span
              aria-hidden
              className="absolute bottom-5 left-1/2 whitespace-nowrap text-sm font-medium tracking-wide text-white/85"
              style={{
                writingMode: "vertical-rl",
                transform: "translateX(-50%) rotate(180deg)",
                opacity: open ? 0 : 1,
                transition: `opacity ${open ? duration * 0.3 : duration * 0.6}ms ${open ? "0ms" : `${duration * 0.4}ms`}`,
              }}
            >
              {item.title}
            </span>
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 p-6"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(16px)",
                transition: open
                  ? `opacity ${duration * 0.6}ms ${ease} ${duration * 0.35}ms, transform ${duration * 0.8}ms ${ease} ${duration * 0.35}ms`
                  : `opacity 150ms, transform 150ms`,
              }}
            >
              <p className="text-xs font-medium uppercase tracking-[.2em] text-white/60">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 whitespace-nowrap text-2xl font-semibold tracking-tight text-white">{item.title}</p>
              {item.subtitle && <p className="mt-1 whitespace-nowrap text-sm text-white/70">{item.subtitle}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
