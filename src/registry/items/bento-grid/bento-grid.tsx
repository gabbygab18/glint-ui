"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export interface BentoGridProps {
  children: ReactNode;
  /** Columns on wide screens (collapses to one column on small screens). */
  columns?: number;
  /** Row height in px. */
  rowHeight?: number;
  /** Gap between tiles in px. */
  gap?: number;
  /** Cursor spotlight that glows across tile borders. */
  spotlight?: boolean;
  /** Spotlight color. */
  spotlightColor?: string;
  className?: string;
}

export function BentoGrid({
  children,
  columns = 3,
  rowHeight = 176,
  gap = 12,
  spotlight = true,
  spotlightColor = "#a3e635",
  className,
}: BentoGridProps) {
  const root = useRef<HTMLDivElement>(null);

  // One listener on the grid feeds every tile, so the glow bleeds across neighbouring borders.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!spotlight) return;
    for (const el of root.current!.querySelectorAll<HTMLElement>("[data-bento-card]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--bx", `${e.clientX - r.left}px`);
      el.style.setProperty("--by", `${e.clientY - r.top}px`);
    }
  };

  return (
    <div
      ref={root}
      onPointerMove={onMove}
      className={`group/grid grid w-full grid-cols-1 md:[grid-template-columns:repeat(var(--bento-cols),minmax(0,1fr))] ${className ?? ""}`}
      style={
        {
          "--bento-cols": columns,
          "--bento-spot": spotlight ? spotlightColor : "transparent",
          gridAutoRows: rowHeight,
          gap,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export interface BentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  /** Decorative visual that fills the top of the tile. Style it with `group-hover/bento:` for hover motion. */
  visual?: ReactNode;
  /** Link for the reveal-on-hover call to action. */
  href?: string;
  cta?: string;
  /** Use for spans, e.g. "md:col-span-2 md:row-span-2". */
  className?: string;
}

export function BentoCard({ title, description, icon, visual, href, cta = "Learn more", className }: BentoCardProps) {
  return (
    <div
      data-bento-card
      className={`group/bento relative isolate overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,.7)] ${className ?? ""}`}
    >
      {/* Border glow: a radial gradient masked to the 1px ring. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/grid:opacity-100"
        style={{
          padding: 1,
          background: "radial-gradient(260px circle at var(--bx,-999px) var(--by,-999px), var(--bento-spot), transparent 70%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/bento:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--bx,50%) var(--by,50%), color-mix(in oklab, var(--bento-spot) 10%, transparent), transparent 70%)" }}
      />

      {visual && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover/bento:scale-[1.04] [mask-image:linear-gradient(to_bottom,#000_35%,transparent_85%)]"
        >
          {visual}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex translate-y-7 flex-col gap-1 p-5 transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover/bento:translate-y-0 group-focus-within/bento:translate-y-0">
        <span className="mb-2 grid size-9 origin-bottom-left place-items-center rounded-lg border border-border bg-muted text-foreground transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover/bento:-rotate-6 group-hover/bento:scale-110 [&>svg]:size-[18px]">
          {icon}
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {href ? (
          <a
            href={href}
            className="mt-1 inline-flex w-fit items-center gap-1 rounded text-sm font-medium text-foreground opacity-0 outline-none transition-opacity duration-300 group-hover/bento:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cta}
            <ArrowRight className="size-3.5 transition-transform group-hover/bento:translate-x-0.5" />
          </a>
        ) : (
          <span className="h-5" />
        )}
      </div>
    </div>
  );
}
