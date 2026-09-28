"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  /** 0-5 stars. */
  rating?: number;
}

export interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  /** Advance automatically. Pauses while hovered or focused. */
  autoPlay?: boolean;
  /** Ms each testimonial stays on screen. */
  interval?: number;
  /** Px of horizontal swipe needed to change slide. */
  swipeThreshold?: number;
  /** Star color. */
  starColor?: string;
  className?: string;
}

const css = `@keyframes testimonial-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`;

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
  swipeThreshold = 60,
  starColor = "#facc15",
  className,
}: TestimonialCarouselProps) {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const n = testimonials.length;
  const current = n ? ((index % n) + n) % n : 0;
  const t = testimonials[current];
  const playing = autoPlay && !reduced && n > 1;
  const paused = hovered || focused;

  const go = (next: number, d = next > current ? 1 : -1) => setState([((next % n) + n) % n, d]);
  const step = (d: number) => go(current + d, d);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.15;
    if (swipe < -swipeThreshold) step(1);
    else if (swipe > swipeThreshold) step(-1);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };

  if (!t) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Testimonials"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={onKey}
      className={`relative w-full max-w-2xl ${className ?? ""}`}
    >
      <style href="testimonial-carousel" precedence="default">
        {css}
      </style>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <Quote
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-6 size-40 rotate-180 text-foreground/[0.04]"
          strokeWidth={1}
        />
        <div aria-live={playing && !paused ? "off" : "polite"} className="relative">
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.figure
              key={current}
              role="group"
              aria-roledescription="slide"
              aria-label={`${current + 1} of ${n}`}
              custom={dir}
              variants={{
                enter: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * 80, filter: "blur(6px)" }),
                center: { opacity: 1, x: 0, filter: "blur(0px)" },
                exit: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * -80, filter: "blur(6px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 260, damping: 30 }, opacity: { duration: 0.3 }, filter: { duration: 0.3 } }}
              drag={n > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              className="m-0 cursor-grab touch-pan-y select-none p-8 active:cursor-grabbing sm:p-10"
            >
              {t.rating !== undefined && (
                <div className="flex gap-1" role="img" aria-label={`Rated ${t.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const on = i < (t.rating ?? 0);
                    return (
                      <Star
                        key={i}
                        aria-hidden
                        className="size-4"
                        strokeWidth={1.5}
                        style={{
                          color: on ? starColor : "var(--muted-foreground)",
                          fill: on ? starColor : "transparent",
                          opacity: on ? 1 : 0.35,
                        }}
                      />
                    );
                  })}
                </div>
              )}
              <blockquote className="mt-6 min-h-[7.5rem] text-pretty text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt=""
                  draggable={false}
                  className="size-12 rounded-full object-cover ring-2 ring-border ring-offset-2 ring-offset-card"
                />
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>

      {n > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {testimonials.map((item, i) => {
              const active = i === current;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show testimonial from ${item.name}`}
                  aria-current={active}
                  onClick={() => go(i)}
                  className="relative h-1.5 overflow-hidden rounded-full bg-foreground/15 transition-[width,background-color] duration-500 hover:bg-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ width: active ? 40 : 8 }}
                >
                  {active && (
                    <span
                      key={current}
                      aria-hidden
                      className="absolute inset-0 origin-left rounded-full bg-foreground"
                      style={
                        playing
                          ? {
                              animation: `testimonial-progress ${interval}ms linear forwards`,
                              animationPlayState: paused ? "paused" : "running",
                            }
                          : undefined
                      }
                      onAnimationEnd={() => step(1)}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            {[
              { d: -1, label: "Previous testimonial", Icon: ChevronLeft },
              { d: 1, label: "Next testimonial", Icon: ChevronRight },
            ].map(({ d, label, Icon }) => (
              <button
                key={d}
                type="button"
                aria-label={label}
                onClick={() => step(d)}
                className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
