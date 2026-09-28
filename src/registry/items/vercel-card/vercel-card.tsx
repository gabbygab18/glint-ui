"use client";

import type { PointerEvent, ReactNode } from "react";

export interface VercelCardProps {
  children?: ReactNode;
  /** Grid cell size in px. */
  gridSize?: number;
  /** Show the grid pattern. */
  grid?: boolean;
  /** Show plus markers on the corners. */
  markers?: boolean;
  /** Spotlight radius in px. */
  spotlightSize?: number;
  className?: string;
}

const css = `
.vercel-card{--x:50%;--y:50%;--line:color-mix(in oklab,var(--foreground) 7%,transparent);--line-hot:color-mix(in oklab,var(--foreground) 30%,transparent)}
.vercel-card-grid{background-image:linear-gradient(to right,var(--g) 1px,transparent 1px),linear-gradient(to bottom,var(--g) 1px,transparent 1px);background-size:var(--cell) var(--cell);background-position:-1px -1px}
.vercel-card-spot{opacity:0;transition:opacity .4s ease}
.vercel-card:hover .vercel-card-spot,.vercel-card:focus-within .vercel-card-spot{opacity:1}
.vercel-card-plus{transition:color .3s ease,transform .5s cubic-bezier(.2,.8,.2,1)}
.vercel-card:hover .vercel-card-plus,.vercel-card:focus-within .vercel-card-plus{color:var(--foreground);transform:rotate(90deg)}
@media (prefers-reduced-motion: reduce){.vercel-card-spot,.vercel-card-plus{transition:none}.vercel-card:hover .vercel-card-plus{transform:none}}
`;

const Plus = ({ className }: { className: string }) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={`vercel-card-plus pointer-events-none absolute z-10 size-4 text-muted-foreground ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.25}
  >
    <path d="M8 0v16M0 8h16" />
  </svg>
);

export function VercelCard({
  children,
  gridSize = 24,
  grid = true,
  markers = true,
  spotlightSize = 320,
  className,
}: VercelCardProps) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const spot = `radial-gradient(${spotlightSize}px circle at var(--x) var(--y), #000, transparent 70%)`;

  return (
    <div
      onPointerMove={onMove}
      className={`vercel-card relative border border-border bg-background ${className ?? ""}`}
      style={{ ["--cell" as string]: `${gridSize}px` }}
    >
      <style href="vercel-card" precedence="default">
        {css}
      </style>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {grid && (
          <div
            className="vercel-card-grid absolute inset-0"
            style={{
              ["--g" as string]: "var(--line)",
              maskImage: "radial-gradient(ellipse at 100% 0%, #000 10%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 100% 0%, #000 10%, transparent 70%)",
            }}
          />
        )}
        {/* Spotlight: a soft wash plus brighter grid lines, both masked to the pointer. */}
        <div
          className="vercel-card-spot absolute inset-0"
          style={{
            background: `radial-gradient(${spotlightSize}px circle at var(--x) var(--y), color-mix(in oklab, var(--foreground) 7%, transparent), transparent 70%)`,
          }}
        />
        {grid && (
          <div
            className="vercel-card-grid vercel-card-spot absolute inset-0"
            style={{ ["--g" as string]: "var(--line-hot)", maskImage: spot, WebkitMaskImage: spot }}
          />
        )}
      </div>
      {markers && (
        <>
          <Plus className="-left-2 -top-2" />
          <Plus className="-right-2 -top-2" />
          <Plus className="-bottom-2 -left-2" />
          <Plus className="-bottom-2 -right-2" />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
