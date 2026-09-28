"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

export interface FlashyCardProps {
  children?: ReactNode;
  /** Gradient stops of the sweeping light, in order. */
  colors?: string[];
  /** Seconds per full sweep around the border. */
  speed?: number;
  /** Border thickness in px. */
  borderWidth?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Strength of the outer glow on hover, 0 to 1. */
  glow?: number;
  /** "hover": the sweep brightens and glows while hovered/focused. "always": always lit. */
  trigger?: "hover" | "always";
  className?: string;
}

const css = `
@property --fc-a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes fc-spin { to { --fc-a: 360deg; } }
@keyframes fc-flash { from { transform: translateX(-100%); opacity: 1; } to { transform: translateX(100%); opacity: 1; } }
.fc-root { --fc-on: 0; }
.fc-root[data-trigger="always"], .fc-root:hover, .fc-root:focus-within { --fc-on: 1; }
.fc-sweep { animation: fc-spin var(--fc-speed) linear infinite; }
.fc-root:hover .fc-flash, .fc-root:focus-within .fc-flash { animation: fc-flash .9s cubic-bezier(.4,0,.2,1); }
@media (prefers-reduced-motion: reduce) { .fc-sweep, .fc-flash { animation: none !important; } }
`;

/**
 * A card whose border carries a comet of light that sweeps around it. On hover the comet
 * brightens, the card blooms with a soft glow and a quick flash crosses the surface.
 */
export function FlashyCard({
  children,
  colors = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"],
  speed = 3,
  borderWidth = 1.5,
  radius = 20,
  glow = 0.6,
  trigger = "hover",
  className,
}: FlashyCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Comet: transparent most of the way round, then the colors, fading back out at the head.
  const comet = `conic-gradient(from var(--fc-a), transparent 0% 55%, ${colors.join(", ")}, transparent 99%)`;

  // Pointer position for the inner sheen, written straight to CSS variables.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--fc-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--fc-y", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      data-trigger={trigger}
      onPointerMove={onMove}
      className={`fc-root group relative isolate ${className ?? ""}`}
      style={{ borderRadius: radius, "--fc-speed": `${speed}s` } as CSSProperties}
    >
      <style href="flashy-card" precedence="default">
        {css}
      </style>

      {/* Outer bloom: the same comet, blurred behind the card. */}
      <div
        aria-hidden
        className="fc-sweep pointer-events-none absolute -inset-px -z-10 rounded-[inherit] transition-opacity duration-500"
        style={{ background: comet, filter: "blur(18px)", opacity: `calc(var(--fc-on) * ${glow})` }}
      />
      {/* Border: static dim ring plus the moving comet. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-border" />
      <div
        aria-hidden
        className="fc-sweep pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500"
        style={{ background: comet, opacity: "calc(.35 + var(--fc-on) * .65)" }}
      />

      <div
        className="relative h-full overflow-hidden bg-card text-foreground"
        style={{ margin: borderWidth, borderRadius: Math.max(0, radius - borderWidth) }}
      >
        {/* Pointer-follow sheen. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(260px circle at var(--fc-x, 50%) var(--fc-y, 0%), ${colors[0] ?? "#fff"}22, transparent 70%)`,
          }}
        />
        {/* One-shot flash that crosses the surface when hover starts. */}
        <div
          aria-hidden
          className="fc-flash pointer-events-none absolute inset-0 opacity-0"
          style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.14) 45%, rgba(255,255,255,.04) 55%, transparent 70%)" }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
