"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  quote: string;
  name: string;
  /** Role, company or @handle shown under the name. */
  title?: string;
  avatar?: string;
  /** 0 to 5 stars. Omit to hide. */
  rating?: number;
}

export interface KineticTestimonialsProps {
  testimonials: Testimonial[];
  /** Number of rows (alternating direction). */
  rows?: number;
  /** Seconds for the first row to travel one full loop. Lower is faster. */
  duration?: number;
  /** Card width in px. */
  cardWidth?: number;
  /** Px between cards and rows. */
  gap?: number;
  /** Rotation of the whole band in degrees. */
  tilt?: number;
  pauseOnHover?: boolean;
  fadeEdges?: boolean;
  className?: string;
}

const css = `
@keyframes kt-scroll{to{transform:translate3d(-50%,0,0)}}
.kt-track{animation:kt-scroll var(--kt-d) linear infinite}
.kt-row[data-pause]:hover .kt-track,.kt-row[data-pause]:focus-within .kt-track{animation-play-state:paused}
.kt-card{transition:transform .4s cubic-bezier(.2,.7,.2,1),opacity .4s,border-color .4s}
.kt-row[data-pause]:hover .kt-card:not(:hover){opacity:.5}
.kt-row[data-pause] .kt-card:hover{transform:translateY(-4px)}
@media (prefers-reduced-motion:reduce){.kt-track{animation:none}}
`;

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`} role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn("size-3.5", i < Math.round(value) ? "fill-amber-400" : "fill-muted")}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t, width }: { t: Testimonial; width: number }) {
  return (
    <figure
      className="kt-card relative flex shrink-0 flex-col gap-4 rounded-2xl border border-border bg-card/80 p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,.6)] backdrop-blur hover:border-foreground/25"
      style={{ width }}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="absolute right-4 top-4 size-7 fill-foreground/[.06]">
        <path d="M4 20v-6.5C4 8.6 6.4 5.4 10.5 4l.9 1.9C9 7 7.9 8.6 7.8 11H11v9zm9.5 0v-6.5c0-4.9 2.4-8.1 6.5-9.5l.9 1.9c-2.4 1.1-3.5 2.7-3.6 5.1h3.2v9z" />
      </svg>
      {t.rating != null && <Stars value={t.rating} />}
      <blockquote className="text-[14.5px] leading-relaxed text-foreground/90">{t.quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatar} alt="" draggable={false} className="size-9 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-muted text-sm font-medium text-foreground">{t.name[0]}</span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
          {t.title && <p className="truncate text-xs text-muted-foreground">{t.title}</p>}
        </div>
      </figcaption>
    </figure>
  );
}

export function KineticTestimonials({
  testimonials,
  rows = 2,
  duration = 60,
  cardWidth = 320,
  gap = 16,
  tilt = -3,
  pauseOnHover = true,
  fadeEdges = true,
  className,
}: KineticTestimonialsProps) {
  const n = testimonials.length;
  const rowCount = Math.max(1, Math.min(rows, n));
  const fade = "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)";

  return (
    <section
      aria-label="Testimonials"
      className={cn("relative w-full overflow-hidden py-6", className)}
      style={{ maskImage: fadeEdges ? fade : undefined, WebkitMaskImage: fadeEdges ? fade : undefined }}
    >
      <style href="kinetic-testimonials" precedence="default">
        {css}
      </style>
      <div className="flex flex-col" style={{ gap, transform: tilt ? `rotate(${tilt}deg) scale(1.08)` : undefined }}>
        {Array.from({ length: rowCount }, (_, r) => {
          // Each row starts at a different offset so neighbours never show the same card.
          const shift = Math.floor((r * n) / rowCount);
          const list = testimonials.map((_, i) => testimonials[(i + shift) % n]);
          return (
            <div key={r} className="kt-row" data-pause={pauseOnHover || undefined}>
              <div
                className="kt-track flex w-max"
                style={
                  {
                    "--kt-d": `${duration * (1 + r * 0.18)}s`,
                    animationDirection: r % 2 ? "reverse" : "normal",
                  } as CSSProperties
                }
              >
                {/* Two identical halves: sliding by -50% loops seamlessly. */}
                {[0, 1].map((copy) => (
                  <div key={copy} aria-hidden={copy === 1 || r > 0 || undefined} className="flex shrink-0 items-stretch" style={{ gap, paddingRight: gap }}>
                    {list.map((t, i) => (
                      <TestimonialCard key={i} t={t} width={cardWidth} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
