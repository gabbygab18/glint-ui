"use client";

import { useRef, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes flowing-menu-scroll{to{transform:translate3d(-50%,0,0)}}
.flowing-menu-track{animation:flowing-menu-scroll linear infinite;animation-play-state:paused}
.flowing-menu-row:hover .flowing-menu-track,.flowing-menu-row:focus-visible .flowing-menu-track{animation-play-state:running}
@media (prefers-reduced-motion:reduce){.flowing-menu-track{animation:none}}
`;

export interface FlowingMenuItem {
  label: string;
  href?: string;
  image: string;
}

export interface FlowingMenuProps {
  items: FlowingMenuItem[];
  /** Seconds for one marquee loop. */
  speed?: number;
  /** Background of the revealed band. */
  bandColor?: string;
  /** Text color inside the band. */
  bandTextColor?: string;
  className?: string;
}

const EASE = "cubic-bezier(.19,1,.22,1)";

function Row({ item, speed, bandColor, bandTextColor }: { item: FlowingMenuItem } & Required<Pick<FlowingMenuProps, "speed" | "bandColor" | "bandTextColor">>) {
  const band = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  // Band and its content move in opposite directions, so the content looks
  // pinned in place while a window slides over it: a wipe, not a slide.
  const slide = (to: number) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [el, sign] of [
      [band.current!, 1],
      [inner.current!, -1],
    ] as const) {
      const from = getComputedStyle(el).transform;
      el.getAnimations().forEach((a) => a.cancel());
      el.animate([{ transform: from === "none" ? "none" : from }, { transform: `translateY(${sign * to}%)` }], {
        duration: reduced ? 0 : 650,
        easing: EASE,
        fill: "forwards",
      });
    }
  };
  const place = (edge: number) => {
    band.current!.getAnimations().forEach((a) => a.cancel());
    inner.current!.getAnimations().forEach((a) => a.cancel());
    band.current!.style.transform = `translateY(${edge}%)`;
    inner.current!.style.transform = `translateY(${-edge}%)`;
  };
  const edgeOf = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientY - r.top < r.height / 2 ? -101 : 101;
  };

  return (
    <a
      href={item.href ?? "#"}
      onPointerEnter={(e) => {
        place(edgeOf(e));
        slide(0);
      }}
      onPointerLeave={(e) => slide(edgeOf(e))}
      onFocus={() => {
        place(-101);
        slide(0);
      }}
      onBlur={() => slide(101)}
      className="flowing-menu-row relative flex min-h-16 flex-1 items-center justify-center overflow-hidden border-t border-border text-3xl font-semibold uppercase tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:text-5xl"
    >
      {item.label}
      <div
        ref={band}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ background: bandColor, color: bandTextColor, transform: "translateY(101%)" }}
      >
        <div ref={inner} className="h-full" style={{ transform: "translateY(-101%)" }}>
          <div className="flowing-menu-track flex h-full w-max" style={{ animationDuration: `${speed}s` }}>
            {[0, 1].map((half) => (
              <div key={half} className="flex h-full items-center">
                {Array.from({ length: 4 }, (_, k) => (
                  <div key={k} className="flex h-full items-center">
                    <span className="whitespace-nowrap px-6">{item.label}</span>
                    <span
                      className="h-[62%] w-[clamp(6rem,14vw,12rem)] rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}

export function FlowingMenu({
  items,
  speed = 14,
  bandColor = "#d9f75c",
  bandTextColor = "#0b0d06",
  className,
}: FlowingMenuProps) {
  return (
    <nav className={cn("flex h-full w-full flex-col border-b border-border", className)}>
      <style href="flowing-menu" precedence="default">
        {css}
      </style>
      {items.map((item) => (
        <Row key={item.label} item={item} speed={speed} bandColor={bandColor} bandTextColor={bandTextColor} />
      ))}
    </nav>
  );
}
