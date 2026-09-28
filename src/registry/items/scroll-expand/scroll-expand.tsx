"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ScrollExpandProps {
  /** Image URL. */
  src: string;
  alt?: string;
  /** Headline; its halves slide apart as the media expands. */
  title?: string;
  /** Content faded in once the media is full-bleed. */
  children?: ReactNode;
  /** Starting inset as a percent of the width. */
  startInset?: number;
  /** Starting corner radius in px. */
  radius?: number;
  /** Scroll distance to fully expand, in viewport heights. */
  scrollLength?: number;
  /** Element that scrolls. Defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function ScrollExpand({
  src,
  alt = "",
  title = "Into the wild",
  children,
  startInset = 24,
  radius = 32,
  scrollLength = 1.5,
  scrollContainerRef,
  className,
}: ScrollExpandProps) {
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const left = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef?.current ?? null;
    const target: HTMLElement | Window = container ?? window;
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!section.current || !media.current || !image.current || !left.current || !right.current || !hint.current || !reveal.current) return; // unmounted
      const el = section.current;
      const vh = container ? container.clientHeight : window.innerHeight;
      el.style.setProperty("--se-vh", `${vh}px`);
      const top = container ? container.getBoundingClientRect().top : 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (top - r.top) / Math.max(1, r.height - vh)));
      const e = 1 - Math.pow(1 - p, 3);
      const ix = startInset * (1 - e);
      // Corners round off faster than the inset closes, so the last stretch is a clean full-bleed.
      const rad = radius * Math.pow(1 - p, 2);
      media.current!.style.clipPath = `inset(${ix * 0.75}% ${ix}% round ${rad}px)`;
      image.current!.style.transform = `scale(${1.25 - 0.25 * e})`;
      const shift = e * r.width * 0.3;
      left.current!.style.transform = `translateX(${-shift}px)`;
      right.current!.style.transform = `translateX(${shift}px)`;
      left.current!.style.opacity = right.current!.style.opacity = `${1 - Math.max(0, p - 0.6) / 0.4}`;
      hint.current!.style.opacity = `${1 - Math.min(1, p * 8)}`;
      reveal.current!.style.opacity = `${Math.max(0, (p - 0.8) / 0.2)}`;
      reveal.current!.style.transform = `translateY(${(1 - Math.max(0, (p - 0.8) / 0.2)) * 16}px)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    target.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(container ?? document.documentElement);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", schedule);
      ro.disconnect();
    };
  }, [scrollContainerRef, startInset, radius, scrollLength]);

  const words = title.split(" ");
  const cut = Math.ceil(words.length / 2);

  return (
    <section
      ref={section}
      className={cn("relative w-full", className)}
      style={{ height: `calc(var(--se-vh, 100dvh) * ${1 + scrollLength})` }}
    >
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "var(--se-vh, 100dvh)" }}>
        <div ref={media} className="absolute inset-0 overflow-hidden" style={{ willChange: "clip-path" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={image} src={src} alt={alt} className="size-full object-cover" style={{ willChange: "transform" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
        </div>
        {title && (
          <h2 className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[0.25em] px-4 text-center text-4xl font-semibold tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.45)] sm:text-6xl">
            <span ref={left} className="inline-block whitespace-nowrap">
              {words.slice(0, cut).join(" ")}
            </span>
            <span ref={right} className="inline-block whitespace-nowrap">
              {words.slice(cut).join(" ")}
            </span>
          </h2>
        )}
        <div
          ref={hint}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground"
        >
          Scroll to expand
        </div>
        <div ref={reveal} className="absolute inset-x-0 bottom-0 p-6 sm:p-10" style={{ opacity: 0 }}>
          {children}
        </div>
      </div>
    </section>
  );
}
