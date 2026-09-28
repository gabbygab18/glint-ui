"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export interface TimelineItem {
  /** Short label shown above the title, e.g. a date or version. */
  date: string;
  title: string;
  description?: ReactNode;
  /** Optional icon rendered inside the marker. */
  icon?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  /** Element that scrolls. Defaults to the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Where in the viewport the progress head sits, 0 (top) to 1 (bottom). */
  anchor?: number;
  /** Progress line color. */
  color?: string;
  /** Px entries slide up while fading in. */
  distance?: number;
  className?: string;
}

const css = `
.timeline-entry{opacity:0;transform:translate3d(0,var(--timeline-distance),0);transition:opacity .6s ease,transform .7s cubic-bezier(.2,.8,.2,1)}
.timeline-entry[data-shown]{opacity:1;transform:none}
.timeline-dot{transition:background-color .3s,border-color .3s,box-shadow .3s,color .3s}
.timeline-dot[data-reached]{border-color:var(--timeline-color);background:var(--timeline-color);color:#0a0a0a;box-shadow:0 0 0 5px color-mix(in oklab,var(--timeline-color) 22%,transparent),0 0 18px var(--timeline-color)}
@media (prefers-reduced-motion: reduce){.timeline-entry{opacity:1;transform:none;transition:none}.timeline-dot{transition:none}}
`;

export function Timeline({ items, scrollContainerRef, anchor = 0.5, color = "#a3e635", distance = 24, className }: TimelineProps) {
  const root = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const bar = fill.current;
    if (!el || !bar) return;
    const scroller = scrollContainerRef?.current ?? null;
    const target: HTMLElement | Window = scroller ?? window;
    const entries = Array.from(el.querySelectorAll<HTMLElement>("[data-entry]"));
    const dots = Array.from(el.querySelectorAll<HTMLElement>("[data-dot]"));
    let raf = 0;

    const update = () => {
      raf = 0;
      const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const r = el.getBoundingClientRect();
      const head = view.top + view.height * anchor - r.top; // px from the list's top
      const p = Math.min(1, Math.max(0, head / r.height));
      bar.style.transform = `scaleY(${p})`;
      for (const d of dots) {
        const b = d.getBoundingClientRect();
        const reached = b.top + b.height / 2 - r.top <= head;
        if (reached !== d.hasAttribute("data-reached")) d.toggleAttribute("data-reached", reached);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Entries reveal once, when they scroll into the container.
    const io = new IntersectionObserver(
      (list) => {
        for (const e of list) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.shown = "";
            io.unobserve(e.target);
          }
        }
      },
      { root: scroller, rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    entries.forEach((e) => io.observe(e));

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [scrollContainerRef, anchor, items.length]);

  return (
    <ol
      ref={root}
      className={`relative ${className ?? ""}`}
      style={{ ["--timeline-color" as string]: color, ["--timeline-distance" as string]: `${distance}px` }}
    >
      <style href="timeline" precedence="default">
        {css}
      </style>
      {/* Track + fill. The fill scales from the top, so scrolling never triggers layout. */}
      <div aria-hidden className="absolute bottom-3 left-[15px] top-3 w-0.5 -translate-x-1/2 rounded-full bg-border">
        <div
          ref={fill}
          className="absolute inset-0 origin-top rounded-full"
          style={{
            transform: "scaleY(0)",
            background: `linear-gradient(to bottom, transparent, ${color} 12%)`,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
      {items.map((item, i) => (
        <li key={i} className="relative pb-12 pl-14 last:pb-0">
          <span
            data-dot
            aria-hidden
            className="timeline-dot absolute left-0 top-0.5 grid size-[30px] place-items-center rounded-full border-2 border-border bg-background text-muted-foreground [&_svg]:size-3.5"
          >
            {item.icon ?? <span className="size-1.5 rounded-full bg-current" />}
          </span>
          <div data-entry className="timeline-entry" style={{ transitionDelay: "60ms" }}>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.date}</p>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
            {item.description && <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
