"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes flex-carousel-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.flex-carousel-bar{animation:flex-carousel-fill linear forwards;transform-origin:left}
.flex-carousel:hover .flex-carousel-bar,.flex-carousel:has(:focus-visible) .flex-carousel-bar{animation-play-state:paused}
.flex-carousel-panel{transition:flex-grow .8s cubic-bezier(.65,0,.2,1)}
.flex-carousel-panel img{transition:transform 1.2s cubic-bezier(.2,.7,.2,1),filter .8s}
.flex-carousel-copy{transition:opacity .5s,transform .6s cubic-bezier(.2,.7,.2,1)}
@media (prefers-reduced-motion:reduce){.flex-carousel-bar{animation:none}.flex-carousel-panel,.flex-carousel-panel img,.flex-carousel-copy{transition:none}}
`;

export interface FlexCarouselItem {
  image: string;
  title: string;
  description?: string;
}

export interface FlexCarouselProps {
  items: FlexCarouselItem[];
  /** Ms each panel stays open before advancing. */
  interval?: number;
  /** Advance automatically (paused on hover and keyboard focus). */
  autoPlay?: boolean;
  /** How many times wider the open panel is than a closed one. */
  expand?: number;
  /** Px between panels. */
  gap?: number;
  /** Height in px. */
  height?: number;
  className?: string;
}

export function FlexCarousel({
  items,
  interval = 5000,
  autoPlay = true,
  expand = 6,
  gap = 10,
  height = 420,
  className,
}: FlexCarouselProps) {
  const [active, setActive] = useState(0);
  const go = (i: number) => setActive((i + items.length) % items.length);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + items.length) % items.length;
    go(next);
    e.currentTarget.querySelectorAll("button")[next]?.focus();
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      onKeyDown={onKey}
      className={cn("flex-carousel flex w-full", className)}
      style={{ gap, height }}
    >
      <style href="flex-carousel" precedence="default">
        {css}
      </style>
      {items.map((it, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            type="button"
            aria-label={it.title}
            aria-current={on}
            tabIndex={on ? 0 : -1}
            onClick={() => go(i)}
            className="flex-carousel-panel group relative min-w-0 overflow-hidden rounded-3xl bg-muted text-left outline-none ring-ring ring-offset-2 ring-offset-background focus-visible:ring-2"
            style={{ flexGrow: on ? expand : 1, flexBasis: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.image}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full object-cover"
              style={{
                transform: on ? "scale(1)" : "scale(1.25)",
                filter: on ? "none" : "saturate(.6) brightness(.7)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <span
              aria-hidden
              className="flex-carousel-copy absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white/80"
              style={{ opacity: on ? 0 : 1 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className="flex-carousel-copy absolute inset-x-0 bottom-0 p-6 sm:p-8"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? "none" : "translateY(16px)",
                transitionDelay: on ? ".25s" : "0s",
              }}
            >
              <p className="font-mono text-xs text-white/60">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              <h3 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white sm:text-4xl">{it.title}</h3>
              {it.description && <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/70">{it.description}</p>}
            </div>
            {on && autoPlay && items.length > 1 && (
              <div className="absolute inset-x-6 top-5 h-[3px] overflow-hidden rounded-full bg-white/25 sm:inset-x-8">
                <div
                  key={active}
                  className="flex-carousel-bar h-full rounded-full bg-white"
                  style={{ animationDuration: `${interval}ms` }}
                  onAnimationEnd={() => go(active + 1)}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
