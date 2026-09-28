"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  src: string;
}

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  /** Advance automatically. Pauses while hovered or focused. */
  autoplay?: boolean;
  /** Ms between slides when autoplaying. */
  interval?: number;
  /** Seconds between each word of the quote appearing. */
  wordDelay?: number;
  className?: string;
}

// Deterministic tilt per card so SSR and client agree.
const tilt = (i: number) => ((i * 37) % 21) - 10;

export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  interval = 5000,
  wordDelay = 0.03,
  className,
}: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = testimonials.length;

  const go = useCallback((d: number) => setActive((a) => (a + d + n) % n), [n]);

  useEffect(() => {
    if (!autoplay || paused || n < 2) return;
    const id = window.setTimeout(() => go(1), interval);
    return () => window.clearTimeout(id);
  }, [autoplay, paused, interval, go, n, active]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  };

  const t = testimonials[active];
  if (!t) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Testimonials"
      onKeyDown={onKey}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`grid w-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-14 ${className ?? ""}`}
    >
      <div className="relative mx-auto aspect-square w-full max-w-72" aria-hidden>
        {testimonials.map((item, i) => {
          const on = i === active;
          // Distance behind the active card, 0..n-1.
          const depth = (i - active + n) % n;
          return (
            <motion.img
              key={item.src + i}
              src={item.src}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full rounded-3xl object-cover shadow-[0_30px_60px_-25px_rgba(0,0,0,.8)]"
              initial={false}
              animate={{
                rotate: on ? 0 : tilt(i),
                scale: on ? 1 : 0.92 - Math.min(depth, 3) * 0.02,
                y: on ? 0 : -Math.min(depth, 3) * 6,
                opacity: on ? 1 : depth > 3 ? 0 : 0.55,
                zIndex: on ? n + 1 : n - depth,
              }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
            />
          );
        })}
      </div>

      <div className="flex min-h-64 flex-col justify-between gap-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -16 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut" }}
            aria-live="polite"
          >
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
            <blockquote className="mt-6 text-lg leading-relaxed text-foreground/90">
              <span className="sr-only">{t.quote}</span>
              <span aria-hidden>
                {t.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={reduce ? false : { filter: "blur(10px)", opacity: 0, y: 6 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: i * wordDelay }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </span>
            </blockquote>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3">
          {[
            { d: -1, label: "Previous testimonial", Icon: ArrowLeft },
            { d: 1, label: "Next testimonial", Icon: ArrowRight },
          ].map(({ d, label, Icon }) => (
            <button
              key={d}
              type="button"
              aria-label={label}
              onClick={() => go(d)}
              className="group grid size-10 place-items-center rounded-full border border-border bg-muted text-foreground outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                className={`size-5 transition-transform duration-300 ${d < 0 ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
              />
            </button>
          ))}
          <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
