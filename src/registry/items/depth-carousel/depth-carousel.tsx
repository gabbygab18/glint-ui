"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DepthCarouselItem {
  image: string;
  title: string;
  subtitle?: string;
}

export interface DepthCarouselProps {
  items: DepthCarouselItem[];
  /** Card width in px. */
  cardWidth?: number;
  /** Card height in px. */
  cardHeight?: number;
  /** Horizontal px between card centers. */
  spacing?: number;
  /** Px each step pushes a card back in z. */
  depth?: number;
  /** Blur in px added per step from center. */
  blur?: number;
  /** Y rotation in degrees of side cards. */
  rotate?: number;
  /** Cards shown on each side. */
  visible?: number;
  autoplay?: boolean;
  /** Ms between autoplay steps. */
  autoplayDelay?: number;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 180, damping: 26 };

export function DepthCarousel({
  items,
  cardWidth = 250,
  cardHeight = 330,
  spacing = 170,
  depth = 180,
  blur = 3,
  rotate = 18,
  visible = 2,
  autoplay = true,
  autoplayDelay = 3500,
  className,
}: DepthCarouselProps) {
  const n = items.length;
  const pos = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; p: number; moved: boolean; t: number; vx: number; lx: number; card: number } | null>(null);
  const hovered = useRef(false);
  const reduce = useReducedMotion();
  const mod = (v: number) => ((v % n) + n) % n;

  const go = (target: number) => {
    setIndex(mod(target));
    animate(pos, target, reduce ? { duration: 0 } : spring);
  };
  const step = (dir: number) => go(Math.round(pos.get()) + dir);

  // Autoplay reads the latest `go` via a ref so the interval never restarts.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = window.setInterval(() => !hovered.current && !drag.current && stepRef.current(1), autoplayDelay);
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDelay, reduce]);

  const active = items[index];

  return (
    <div
      className={`flex w-full flex-col items-center gap-5 ${className ?? ""}`}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Depth carousel. Drag or use arrow keys."
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
          else return;
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>("[data-depth-index]");
          e.currentTarget.setPointerCapture(e.pointerId);
          pos.stop();
          drag.current = {
            x: e.clientX,
            p: pos.get(),
            moved: false,
            t: performance.now(),
            vx: 0,
            lx: e.clientX,
            card: card ? Number(card.dataset.depthIndex) : -1,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          d.vx = (e.clientX - d.lx) / Math.max(1, now - d.t);
          d.t = now;
          d.lx = e.clientX;
          if (Math.abs(e.clientX - d.x) > 4) d.moved = true;
          pos.set(d.p - (e.clientX - d.x) / spacing);
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          // A tap on a side card brings it to the front.
          if (!d.moved && d.card >= 0) {
            let delta = mod(d.card - Math.round(pos.get()));
            if (delta > n / 2) delta -= n;
            go(Math.round(pos.get()) + delta);
            return;
          }
          go(Math.round(pos.get() - d.vx * 3));
        }}
        onPointerCancel={() => {
          drag.current = null;
          go(Math.round(pos.get()));
        }}
        className="relative w-full cursor-grab touch-pan-y select-none rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        style={{ height: cardHeight + 40, perspective: 1200 }}
      >
        {items.map((item, i) => (
          <Card
            key={item.title + i}
            item={item}
            i={i}
            n={n}
            pos={pos}
            width={cardWidth}
            height={cardHeight}
            spacing={spacing}
            depth={depth}
            blur={blur}
            rotate={rotate}
            visible={visible}
            current={i === index}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => step(-1)}
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground outline-none transition hover:bg-muted active:scale-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="w-44 text-center" aria-live="polite">
          <motion.p key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="truncate font-semibold text-foreground">
            {active?.title}
          </motion.p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {index + 1} / {n}
          </p>
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={() => step(1)}
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground outline-none transition hover:bg-muted active:scale-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

interface CardProps {
  item: DepthCarouselItem;
  i: number;
  n: number;
  pos: MotionValue<number>;
  width: number;
  height: number;
  spacing: number;
  depth: number;
  blur: number;
  rotate: number;
  visible: number;
  current: boolean;
}

function Card({ item, i, n, pos, width, height, spacing, depth, blur, rotate, visible, current }: CardProps) {
  // Signed distance from the front slot, wrapped so the ring loops.
  const d = useTransform(pos, (p) => {
    let v = (((i - p) % n) + n) % n;
    if (v > n / 2) v -= n;
    return v;
  });
  const transform = useTransform(d, (v) => {
    const a = Math.abs(v);
    const x = Math.sign(v) * spacing * (a - Math.max(0, a - 1) * 0.25);
    return `translate3d(${x}px, 0, ${-a * depth}px) rotateY(${-Math.max(-1, Math.min(1, v)) * rotate}deg)`;
  });
  const filter = useTransform(d, (v) => `blur(${Math.abs(v) * blur}px) brightness(${1 - Math.min(Math.abs(v), 3) * 0.18})`);
  const opacity = useTransform(d, (v) => Math.max(0, Math.min(1, visible + 0.6 - Math.abs(v))));
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10));

  return (
    <motion.div
      data-depth-index={i}
      aria-hidden={!current}
      className="absolute left-1/2 top-5 overflow-hidden rounded-2xl bg-muted shadow-[0_30px_60px_-25px_rgba(0,0,0,.9)]"
      style={{ width, height, marginLeft: -width / 2, transform, filter, opacity, zIndex }}
    >
      <img src={item.image} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {item.subtitle && <p className="pointer-events-none absolute bottom-4 left-4 right-4 text-sm text-white/85">{item.subtitle}</p>}
    </motion.div>
  );
}
