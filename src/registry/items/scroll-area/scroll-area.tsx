"use client";

import { useEffect, useRef, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

type Axis = "y" | "x";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
  /** When the overlay scrollbars show: on hover or scroll, only while scrolling, or always. */
  type?: "hover" | "scroll" | "always";
  /** Fade content out at edges that have more to scroll. */
  fade?: boolean;
  /** Fade length in px. */
  fadeSize?: number;
  /** Classes for the scrolling viewport (e.g. padding). */
  viewportClassName?: string;
}

// Native scrolling underneath (wheel, touch, keyboard, momentum, find-in-page);
// we hide the platform scrollbar and draw overlay thumbs synced from scroll events.
export function ScrollArea({
  orientation = "vertical",
  type = "hover",
  fade = true,
  fadeSize = 32,
  viewportClassName,
  className,
  children,
  ...props
}: ScrollAreaProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const thumbs = useRef<Record<Axis, HTMLDivElement | null>>({ y: null, x: null });
  const tracks = useRef<Record<Axis, HTMLDivElement | null>>({ y: null, x: null });
  const drag = useRef<{ axis: Axis; start: number; scroll: number } | null>(null);
  const showY = orientation !== "horizontal";
  const showX = orientation !== "vertical";

  useEffect(() => {
    const r = root.current;
    const vp = viewport.current;
    if (!r || !vp) return;
    let hideTimer = 0;

    const sync = () => {
      for (const axis of ["y", "x"] as const) {
        const thumb = thumbs.current[axis];
        const track = tracks.current[axis];
        const pos = axis === "y" ? vp.scrollTop : vp.scrollLeft;
        const size = axis === "y" ? vp.scrollHeight : vp.scrollWidth;
        const view = axis === "y" ? vp.clientHeight : vp.clientWidth;
        const max = size - view;
        const overflow = max > 1;
        r.style.setProperty(`--sa-${axis}0`, overflow ? String(Math.min(1, pos / fadeSize)) : "0");
        r.style.setProperty(`--sa-${axis}1`, overflow ? String(Math.min(1, (max - pos) / fadeSize)) : "0");
        if (!thumb || !track) continue;
        track.dataset.overflow = String(overflow);
        const trackLen = axis === "y" ? track.clientHeight : track.clientWidth;
        const len = Math.max(24, (trackLen * view) / size);
        const offset = overflow ? ((trackLen - len) * pos) / max : 0;
        thumb.style[axis === "y" ? "height" : "width"] = `${len}px`;
        thumb.style.transform = axis === "y" ? `translateY(${offset}px)` : `translateX(${offset}px)`;
      }
    };

    const onScroll = () => {
      sync();
      r.dataset.scrolling = "";
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => delete r.dataset.scrolling, 700);
    };

    sync();
    vp.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(vp);
    if (content.current) ro.observe(content.current);
    return () => {
      vp.removeEventListener("scroll", onScroll);
      ro.disconnect();
      clearTimeout(hideTimer);
    };
  }, [fadeSize]);

  const metrics = (axis: Axis) => {
    const vp = viewport.current!;
    const track = tracks.current[axis]!;
    const thumb = thumbs.current[axis]!;
    const trackLen = axis === "y" ? track.clientHeight : track.clientWidth;
    const thumbLen = axis === "y" ? thumb.offsetHeight : thumb.offsetWidth;
    const max = axis === "y" ? vp.scrollHeight - vp.clientHeight : vp.scrollWidth - vp.clientWidth;
    return { vp, track, trackLen, thumbLen, ratio: max / Math.max(1, trackLen - thumbLen) };
  };

  const onThumbDown = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const vp = viewport.current!;
    drag.current = { axis, start: axis === "y" ? e.clientY : e.clientX, scroll: axis === "y" ? vp.scrollTop : vp.scrollLeft };
    root.current!.dataset.dragging = "";
  };
  const onThumbMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const { vp, ratio } = metrics(d.axis);
    const delta = ((d.axis === "y" ? e.clientY : e.clientX) - d.start) * ratio;
    if (d.axis === "y") vp.scrollTop = d.scroll + delta;
    else vp.scrollLeft = d.scroll + delta;
  };
  const onThumbUp = () => {
    drag.current = null;
    delete root.current?.dataset.dragging;
  };
  // Clicking the track glides the thumb's center to the pointer.
  const onTrackDown = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const { vp, track, thumbLen, ratio } = metrics(axis);
    const rect = track.getBoundingClientRect();
    const at = (axis === "y" ? e.clientY - rect.top : e.clientX - rect.left) - thumbLen / 2;
    vp.scrollTo({ [axis === "y" ? "top" : "left"]: at * ratio, behavior: "smooth" });
  };

  const size = `${fadeSize}px`;
  const grad = (dir: string, a: Axis) =>
    `linear-gradient(to ${dir},transparent,#000 calc(var(--sa-${a}0,0)*${size}),#000 calc(100% - var(--sa-${a}1,0)*${size}),transparent)`;
  const mask = fade ? [showY && grad("bottom", "y"), showX && grad("right", "x")].filter(Boolean).join(",") : undefined;

  const bar = (axis: Axis) => (
    <div
      ref={(el) => {
        tracks.current[axis] = el;
      }}
      aria-hidden
      onPointerDown={onTrackDown(axis)}
      className={cn(
        "group/bar absolute z-10 flex touch-none p-0.5 opacity-0 transition-opacity duration-300 select-none data-[overflow=false]:hidden",
        axis === "y" ? "inset-y-0 right-0 w-3 justify-end" : "inset-x-0 bottom-0 h-3 flex-col justify-end",
        axis === "y" && showX && "bottom-3",
        type === "always" && "opacity-100",
        type === "hover" && "group-hover/sa:opacity-100",
        "group-data-scrolling/sa:opacity-100 group-data-dragging/sa:opacity-100",
      )}
    >
      <div
        ref={(el) => {
          thumbs.current[axis] = el;
        }}
        onPointerDown={onThumbDown(axis)}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
        className={cn(
          "rounded-full bg-foreground/25 transition-[background-color,width,height] duration-200 hover:bg-foreground/45 group-data-dragging/sa:bg-foreground/50",
          axis === "y" ? "w-1.5 group-hover/bar:w-2 group-data-dragging/sa:w-2" : "h-1.5 group-hover/bar:h-2 group-data-dragging/sa:h-2",
        )}
      />
    </div>
  );

  return (
    <div {...props} ref={root} className={cn("group/sa relative overflow-hidden", className)}>
      <div
        ref={viewport}
        tabIndex={0}
        className={cn(
          "size-full rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          orientation === "vertical" ? "overflow-y-auto overflow-x-hidden" : orientation === "horizontal" ? "overflow-x-auto overflow-y-hidden" : "overflow-auto",
          viewportClassName,
        )}
        style={mask ? { maskImage: mask, WebkitMaskImage: mask, maskComposite: "intersect", WebkitMaskComposite: "source-in" } : undefined}
      >
        <div ref={content} className={cn(orientation === "vertical" ? "min-w-full" : "w-max min-w-full")}>
          {children}
        </div>
      </div>
      {showY && bar("y")}
      {showX && bar("x")}
    </div>
  );
}
