"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SocialOrbitItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** Brand color used as the hover fill. */
  color?: string;
}

export interface SocialOrbitProps {
  /** Avatar image URL. */
  avatar: string;
  /** Person's name, used as the avatar's alt text. */
  name?: string;
  /** Social links. The first half orbits the inner ring, the rest the outer ring. */
  items: SocialOrbitItem[];
  /** Inner ring radius in px. */
  innerRadius?: number;
  /** Outer ring radius in px. */
  outerRadius?: number;
  /** Speed multiplier; 0 stops the orbit. */
  speed?: number;
  /** Pause while the pointer or keyboard focus is inside. */
  pauseOnHover?: boolean;
  /** Draw the dashed orbit paths. */
  showRings?: boolean;
  /** Avatar ring and glow color. */
  accent?: string;
  className?: string;
}

const css = `
@keyframes so-spin{to{transform:rotate(360deg)}}
.so-ring,.so-counter{animation:so-spin var(--so-d) linear infinite;animation-direction:var(--so-dir)}
.so-counter{animation-direction:var(--so-cdir)}
@keyframes so-halo{to{transform:rotate(360deg)}}
.so-halo{animation:so-halo 6s linear infinite}
.so-root[data-pause]:hover :is(.so-ring,.so-counter),.so-root[data-pause]:focus-within :is(.so-ring,.so-counter){animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.so-ring,.so-counter,.so-halo{animation:none}}
`;

export function SocialOrbit({
  avatar,
  name = "",
  items,
  innerRadius = 95,
  outerRadius = 160,
  speed = 1,
  pauseOnHover = true,
  showRings = true,
  accent = "#a3e635",
  className,
}: SocialOrbitProps) {
  const split = Math.ceil(items.length / 2);
  const rings = [
    { r: innerRadius, list: items.slice(0, split), secs: 26, reverse: false },
    { r: outerRadius, list: items.slice(split), secs: 42, reverse: true },
  ];
  const size = outerRadius * 2 + 56;
  const avatarSize = Math.max(48, Math.min(innerRadius * 2 - 70, 112));

  return (
    <div
      data-pause={pauseOnHover || undefined}
      className={cn("so-root relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <style href="social-orbit" precedence="default">
        {css}
      </style>

      {rings.map(({ r, list, secs, reverse }, ri) => (
        <div key={ri}>
          {showRings && (
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-foreground/15"
              style={{ width: r * 2, height: r * 2 }}
            />
          )}
          <ul
            className="so-ring absolute inset-0"
            style={
              {
                ["--so-d" as string]: speed > 0 ? `${secs / speed}s` : "0s",
                ["--so-dir" as string]: reverse ? "reverse" : "normal",
                ["--so-cdir" as string]: reverse ? "normal" : "reverse",
                animationPlayState: speed > 0 ? undefined : "paused",
              } as CSSProperties
            }
          >
            {list.map((it, i) => {
              const a = (360 / list.length) * i + ri * (180 / Math.max(1, list.length));
              return (
                <li
                  key={it.label}
                  className="absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px] hover:z-10 focus-within:z-10"
                  style={{ transform: `rotate(${a}deg) translateX(${r}px) rotate(${-a}deg)` }}
                >
                  <div className="so-counter" style={{ animationPlayState: speed > 0 ? undefined : "paused" }}>
                    <a
                      href={it.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={it.label}
                      className="group/so relative grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_10px_24px_-10px_rgba(0,0,0,.7)] outline-none transition-[background-color,color,border-color,scale,box-shadow] duration-200 hover:scale-110 hover:border-transparent hover:bg-[var(--c)] hover:text-white hover:shadow-[0_8px_28px_-6px_var(--c)] focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5"
                      style={{ ["--c" as string]: it.color ?? "var(--foreground)" } as CSSProperties}
                    >
                      {it.icon}
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition duration-150 group-hover/so:translate-y-0 group-hover/so:opacity-100 group-focus-visible/so:translate-y-0 group-focus-visible/so:opacity-100">
                        {it.label}
                      </span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: avatarSize, height: avatarSize }}>
        <span aria-hidden className="absolute -inset-6 rounded-full blur-2xl" style={{ background: `color-mix(in oklab, ${accent} 28%, transparent)` }} />
        <span
          aria-hidden
          className="so-halo absolute -inset-[3px] rounded-full"
          style={{ background: `conic-gradient(from 0deg, ${accent}, transparent 35%, ${accent} 60%, transparent 85%, ${accent})` }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={name} draggable={false} className="relative size-full rounded-full border-[3px] border-background object-cover" />
        <span aria-hidden className="absolute bottom-[6%] right-[6%] size-4 rounded-full border-[3px] border-background bg-emerald-400" />
      </div>
    </div>
  );
}
