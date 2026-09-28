"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MeteorOrbitItem {
  label: string;
  icon: ReactNode;
}

export interface MeteorOrbitProps {
  /** Icons spread round-robin over the rings, innermost first. */
  items: MeteorOrbitItem[];
  /** Content in the middle. */
  children?: ReactNode;
  /** Outer diameter in px. */
  size?: number;
  rings?: number;
  /** Seconds per revolution of the innermost ring. Outer rings are slower. */
  duration?: number;
  /** Meteor streaks per ring. 0 hides them. */
  meteors?: number;
  meteorColor?: string;
  /** Icon bubble size in px. */
  iconSize?: number;
  pauseOnHover?: boolean;
  className?: string;
}

const css = `
@keyframes meteor-orbit-spin{to{transform:rotate(360deg)}}
.mo-spin{animation:meteor-orbit-spin var(--mo-d) linear infinite}
.mo-root[data-pause]:hover .mo-spin{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.mo-spin{animation:none}}
`;

export function MeteorOrbit({
  items,
  children,
  size = 400,
  rings = 3,
  duration = 24,
  meteors = 2,
  meteorColor = "#a3e635",
  iconSize = 44,
  pauseOnHover = true,
  className,
}: MeteorOrbitProps) {
  const ringCount = Math.max(1, rings);
  const inner = size * 0.22;
  const radii = Array.from({ length: ringCount }, (_, r) =>
    ringCount === 1 ? size / 2 - iconSize / 2 : inner + ((size / 2 - iconSize / 2 - inner) * r) / (ringCount - 1),
  );
  const byRing = radii.map((_, r) => items.filter((_, i) => i % ringCount === r));

  return (
    <div
      className={cn("mo-root relative shrink-0", className)}
      data-pause={pauseOnHover || undefined}
      style={{ width: size, height: size }}
    >
      <style href="meteor-orbit" precedence="default">
        {css}
      </style>
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, color-mix(in oklab, ${meteorColor} 14%, transparent), transparent 60%)` }}
      />
      {radii.map((radius, r) => {
        const d = duration * (1 + r * 0.6);
        const reverse = r % 2 === 1;
        const box: CSSProperties = { width: radius * 2, height: radius * 2, left: size / 2 - radius, top: size / 2 - radius };
        const list = byRing[r];
        return (
          <div key={r}>
            <div aria-hidden className="absolute rounded-full border border-border" style={box} />
            {Array.from({ length: meteors }, (_, m) => (
              <div
                key={m}
                aria-hidden
                className="mo-spin absolute"
                style={{ ...box, "--mo-d": `${d / 2.2}s`, animationDirection: reverse ? "reverse" : "normal", animationDelay: `${(-d / 2.2) * (m / meteors + r * 0.37)}s` } as CSSProperties}
              >
                {/* Comet tail: a conic sweep clipped to a thin ring, brightest at the head. */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from ${reverse ? 0 : 270}deg, ${reverse ? `${meteorColor}, transparent 25%` : `transparent, ${meteorColor} 25%, transparent 25%`})`,
                    mask: "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px), #000 calc(100% - .5px), transparent 100%)",
                    WebkitMask: "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px), #000 calc(100% - .5px), transparent 100%)",
                  }}
                />
                <span
                  className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-[1px] rounded-full bg-white"
                  style={{ boxShadow: `0 0 6px 2px ${meteorColor}, 0 0 14px 4px ${meteorColor}` }}
                />
              </div>
            ))}
            <ul className="mo-spin absolute" style={{ ...box, "--mo-d": `${d}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}>
              {list.map((item, i) => {
                const a = (i / list.length) * 360 + r * 40;
                return (
                  <li
                    key={item.label}
                    className="absolute top-1/2 left-1/2"
                    style={{ transform: `rotate(${a}deg) translateY(${-radius}px) rotate(${-a}deg)` }}
                  >
                    {/* Spins the opposite way at the same speed so the icon stays upright. */}
                    <div
                      className="mo-spin"
                      style={{ "--mo-d": `${d}s`, animationDirection: reverse ? "normal" : "reverse", margin: -iconSize / 2 } as CSSProperties}
                    >
                      <div
                        title={item.label}
                        aria-label={item.label}
                        role="img"
                        className="grid place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-transform duration-300 hover:scale-110 [&>svg]:size-[45%]"
                        style={{ width: iconSize, height: iconSize }}
                      >
                        {item.icon}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {children && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{children}</div>}
    </div>
  );
}
