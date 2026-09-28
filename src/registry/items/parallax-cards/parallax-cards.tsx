"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

export interface ParallaxCardItem {
  image: string;
  title: string;
  subtitle?: string;
  /** Small chip in the top-left corner. */
  tag?: string;
}

export interface ParallaxCardsProps {
  items: ParallaxCardItem[];
  /** Card width in px. */
  cardWidth?: number;
  /** Card height in px. */
  cardHeight?: number;
  /** Px between cards. */
  gap?: number;
  /** How far the photo drifts inside its card while scrolling, as a fraction of the card width. */
  intensity?: number;
  /** Max pointer tilt in degrees. */
  tilt?: number;
  /** Fade the row out at both edges. */
  fadeEdges?: boolean;
  className?: string;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function ParallaxCards({
  items,
  cardWidth = 280,
  cardHeight = 380,
  gap = 20,
  intensity = 0.2,
  tilt = 6,
  fadeEdges = true,
  className,
}: ParallaxCardsProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  // Horizontal scroll parallax: each card gets --px in [-1, 1] by its distance from the center.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-pc-card]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const half = el.clientWidth / 2;
      const center = el.scrollLeft + half;
      const max = el.scrollWidth - el.clientWidth;
      el.parentElement?.style.setProperty("--pc-progress", String(max > 0 ? el.scrollLeft / max : 0));
      if (reduced.current) return;
      for (const c of cards) {
        c.style.setProperty("--px", clamp((c.offsetLeft + c.offsetWidth / 2 - center) / (half + c.offsetWidth / 2)).toFixed(4));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // Start in the middle of the row so both sides are filled.
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items.length, cardWidth, gap]);

  const onCardMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced.current || drag.current?.moved) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    const s = e.currentTarget.style;
    s.setProperty("--mx", x.toFixed(3));
    s.setProperty("--my", y.toFixed(3));
    s.setProperty("--hover", "1");
  };
  const onCardLeave = (e: PointerEvent<HTMLElement>) => {
    const s = e.currentTarget.style;
    s.setProperty("--mx", "0");
    s.setProperty("--my", "0");
    s.setProperty("--hover", "0");
  };

  // Mouse drag-to-scroll (touch and trackpads scroll natively).
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.scrollSnapType = "none";
      e.currentTarget.style.cursor = "grabbing";
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (drag.current?.moved) {
      el.style.cursor = "";
      // Re-enabling snap makes the browser glide to the nearest card.
      el.style.scrollSnapType = "";
    }
    drag.current = null;
  };

  const pad = cardWidth * intensity;
  const mask = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";

  return (
    <div className={cn("relative w-full contain-inline-size", className)}>
      <div
        ref={scroller}
        role="region"
        aria-label="Cards"
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="flex cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-8 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
        style={{
          gap,
          paddingInline: `calc(50% - ${cardWidth / 2}px)`,
          maskImage: fadeEdges ? mask : undefined,
          WebkitMaskImage: fadeEdges ? mask : undefined,
        }}
      >
        {items.map((it, i) => (
          <figure
            key={it.image + i}
            data-pc-card
            onPointerMove={onCardMove}
            onPointerLeave={onCardLeave}
            className="group relative m-0 shrink-0 snap-center [perspective:900px]"
            style={{ width: cardWidth, height: cardHeight, ["--px" as string]: 0, ["--mx" as string]: 0, ["--my" as string]: 0, ["--hover" as string]: 0 } as CSSProperties}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-[22px] border border-border bg-muted shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)] transition-[transform,box-shadow] duration-500 ease-out will-change-transform group-hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,.85)] motion-reduce:transition-none"
              style={{
                transform: `rotateX(calc(var(--my) * ${-tilt}deg)) rotateY(calc(var(--mx) * ${tilt}deg)) scale(calc(1 + var(--hover) * .02))`,
              }}
            >
              {/* Scroll layer: moves against the card, no transition so it tracks scroll 1:1. */}
              <div
                aria-hidden
                className="absolute inset-y-[-24px] will-change-transform"
                style={{ left: -pad - 16, right: -pad - 16, transform: `translate3d(calc(var(--px) * ${-pad}px), 0, 0)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image}
                  alt=""
                  draggable={false}
                  className="h-full w-full select-none object-cover transition-transform duration-700 ease-out motion-reduce:transition-none"
                  style={{ transform: `translate3d(calc(var(--mx) * -14px), calc(var(--my) * -14px), 0)` }}
                />
              </div>

              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
              {/* Soft glare that follows the pointer. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at calc(50% + var(--mx) * 50%) calc(50% + var(--my) * 50%), rgba(255,255,255,.16), transparent 45%)",
                }}
              />

              <div
                className="absolute inset-0 flex flex-col justify-between p-5 text-white transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translate3d(calc(var(--mx) * 6px), calc(var(--my) * 6px), 0)` }}
              >
                <div className="flex items-start justify-between">
                  {it.tag ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur-md">
                      {it.tag}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="font-mono text-xs text-white/70">
                    {String(i + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <figcaption>
                  <p className="text-2xl font-semibold leading-tight tracking-tight">{it.title}</p>
                  {it.subtitle && <p className="mt-1 text-sm text-white/75">{it.subtitle}</p>}
                </figcaption>
              </div>
            </div>
          </figure>
        ))}
      </div>
      <div aria-hidden className="mx-auto h-0.5 w-40 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full w-1/4 rounded-full bg-foreground/70"
          style={{ transform: "translateX(calc(var(--pc-progress, 0) * 300%))" }}
        />
      </div>
    </div>
  );
}
