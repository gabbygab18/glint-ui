"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";

export interface CarouselItem {
  image: string;
  title: string;
  description?: string;
}

export interface CarouselProps {
  items: CarouselItem[];
  /** Slide width in px. */
  itemWidth?: number;
  /** Slide height in px. */
  itemHeight?: number;
  /** Px between slides. */
  gap?: number;
  /** Max rotateY of off-center slides in degrees. */
  tilt?: number;
  autoplay?: boolean;
  /** Ms between autoplay steps. */
  autoplayDelay?: number;
  /** Wrap around at the ends (arrows, autoplay). */
  loop?: boolean;
  /** Slide centered on mount. */
  startIndex?: number;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 34 };

export function Carousel({
  items,
  itemWidth = 300,
  itemHeight = 340,
  gap = 24,
  tilt = 38,
  autoplay = false,
  autoplayDelay = 3000,
  loop = true,
  startIndex = 0,
  className,
}: CarouselProps) {
  const n = items.length;
  const stride = itemWidth + gap;
  const x = useMotionValue(-startIndex * stride);
  const [index, setIndex] = useState(startIndex);
  const dragged = useRef(false);
  const hovered = useRef(false);
  const reduce = useReducedMotion();

  const go = (i: number) => {
    const next = loop ? (i + n) % n : Math.max(0, Math.min(n - 1, i));
    setIndex(next);
    animate(x, -next * stride, reduce ? { duration: 0 } : spring);
  };

  // Keep position in sync when the slide size changes.
  useEffect(() => {
    x.set(-index * stride);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stride]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = window.setInterval(() => {
      if (hovered.current) return;
      setIndex((i) => {
        const next = (i + 1) % n;
        animate(x, -next * stride, spring);
        return next;
      });
    }, autoplayDelay);
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDelay, n, stride, x, reduce]);

  return (
    <div
      className={`flex w-full flex-col items-center gap-6 ${className ?? ""}`}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel, use arrow keys to navigate"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          else if (e.key === "ArrowLeft") go(index - 1);
          else return;
          e.preventDefault();
        }}
        className="relative w-full overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          height: itemHeight + 40,
          perspective: 1000,
          maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        }}
      >
        <motion.div
          className="absolute top-5 flex cursor-grab active:cursor-grabbing"
          style={{ x, left: "50%", marginLeft: -itemWidth / 2, gap, transformStyle: "preserve-3d", touchAction: "pan-y" }}
          drag="x"
          dragConstraints={{ left: -(n - 1) * stride, right: 0 }}
          dragElastic={0.18}
          dragMomentum={false}
          onDragStart={() => (dragged.current = true)}
          onDragEnd={(_, info) => {
            const projected = x.get() + info.velocity.x * 0.25;
            go(Math.max(0, Math.min(n - 1, Math.round(-projected / stride))));
            window.setTimeout(() => (dragged.current = false));
          }}
        >
          {items.map((item, i) => (
            <Slide
              key={item.title + i}
              item={item}
              i={i}
              x={x}
              stride={stride}
              tilt={tilt}
              width={itemWidth}
              height={itemHeight}
              active={i === index}
              onSelect={() => !dragged.current && go(i)}
            />
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
        {items.map((item, i) => (
          <button
            key={item.title + i}
            type="button"
            aria-label={`Go to slide ${i + 1}: ${item.title}`}
            aria-current={i === index || undefined}
            onClick={() => go(i)}
            className="grid h-6 place-items-center rounded-full px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <motion.span
              className="block h-2 rounded-full"
              initial={false}
              animate={{
                width: i === index ? 24 : 8,
                backgroundColor: i === index ? "var(--foreground)" : "var(--muted-foreground)",
                opacity: i === index ? 1 : 0.4,
              }}
              transition={spring}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

interface SlideProps {
  item: CarouselItem;
  i: number;
  x: MotionValue<number>;
  stride: number;
  tilt: number;
  width: number;
  height: number;
  active: boolean;
  onSelect: () => void;
}

function Slide({ item, i, x, stride, tilt, width, height, active, onSelect }: SlideProps) {
  // Distance from center in slides: 0 = centered, ±1 = neighbours.
  const d = useTransform(x, (v) => Math.max(-2, Math.min(2, (v + i * stride) / stride)));
  const rotateY = useTransform(d, (v) => -Math.max(-1, Math.min(1, v)) * tilt);
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 1.5) * 0.1);
  const opacity = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 2) * 0.25);

  return (
    <motion.div
      aria-roledescription="slide"
      aria-label={item.title}
      aria-hidden={!active}
      onClick={onSelect}
      className="flex shrink-0 select-none flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-[0_25px_50px_-20px_rgba(0,0,0,.7)]"
      style={{ width, height, rotateY, scale, opacity }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-muted">
        <img src={item.image} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full object-cover" />
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="font-semibold tracking-tight text-foreground">{item.title}</p>
        {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
      </div>
    </motion.div>
  );
}
