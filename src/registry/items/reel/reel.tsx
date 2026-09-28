"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, MessageCircle, Music2, Pause, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReelItem {
  /** Poster image for the clip. */
  src: string;
  author: string;
  avatar?: string;
  caption: string;
  /** Soundtrack line, e.g. "Original audio · nova". */
  audio?: string;
  likes?: number;
  comments?: number;
}

export interface ReelProps {
  items: ReelItem[];
  /** Ms each clip plays before advancing. */
  duration?: number;
  /** Advance automatically when a clip's progress bar fills. */
  autoPlay?: boolean;
  /** Jump back to the first clip after the last one. */
  loop?: boolean;
  /** Height in px; width follows a 9:16 frame. */
  height?: number;
  className?: string;
}

const css = `
@keyframes reel-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes reel-zoom{from{transform:scale(1.02)}to{transform:scale(1.16) translateY(-2%)}}
.reel-fill{transform-origin:left;animation:reel-fill var(--reel-d) linear forwards}
.reel-card[data-active] .reel-img{animation:reel-zoom var(--reel-d) linear forwards}
.reel-root[data-paused] .reel-fill,.reel-root[data-paused] .reel-img{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.reel-card[data-active] .reel-img{animation:none}}
`;

const compact = (v: number) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(1).replace(/\.0$/, "")}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1).replace(/\.0$/, "")}K` : String(v);

export function Reel({ items, duration = 6000, autoPlay = true, loop = true, height = 440, className }: ReelProps) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; top: number; index: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [holding, setHolding] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [visible, setVisible] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(() => new Set());
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const n = items.length;
  const width = Math.round((height * 9) / 16);
  const paused = holding || manualPause || !visible;

  useEffect(() => {
    const el = scroller.current;
    const box = root.current;
    if (!el || !box) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(cards.indexOf(e.target as HTMLElement));
      },
      { root: el, threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    vis.observe(box);
    return () => {
      io.disconnect();
      vis.disconnect();
    };
  }, [n]);

  const go = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: Math.max(0, Math.min(n - 1, i)) * el.clientHeight, behavior: smooth ? "smooth" : "auto" });
    setCycle((c) => c + 1);
  };
  const next = () => {
    if (active < n - 1) go(active + 1);
    else if (loop) go(0);
  };

  const toggleLike = (i: number, force?: boolean) =>
    setLiked((s) => {
      const out = new Set(s);
      if (force ?? !out.has(i)) out.add(i);
      else out.delete(i);
      return out;
    });

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") go(active + 1);
    else if (e.key === "ArrowUp" || e.key === "PageUp") go(active - 1);
    else if (e.key === " ") setManualPause((p) => !p);
    else if (e.key.toLowerCase() === "l") toggleLike(active);
    else return;
    e.preventDefault();
  };

  // Press and hold pauses; a mouse drag flicks between clips (touch scrolls natively).
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setHolding(true);
    if (e.pointerType === "mouse") drag.current = { y: e.clientY, top: e.currentTarget.scrollTop, index: active, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dy) > 5) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.scrollSnapType = "none";
    }
    if (d.moved) e.currentTarget.scrollTop = d.top - dy;
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    setHolding(false);
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    e.currentTarget.style.scrollSnapType = "";
    const dy = e.clientY - d.y;
    go(Math.abs(dy) > 50 ? d.index - Math.sign(dy) : d.index);
  };

  const onDouble = (e: MouseEvent<HTMLElement>, i: number) => {
    const r = e.currentTarget.getBoundingClientRect();
    toggleLike(i, true);
    setBurst({ id: e.timeStamp, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={root}
      data-paused={paused || undefined}
      className={cn("reel-root relative overflow-hidden rounded-[28px] border border-border bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,.8)]", className)}
      style={{ width, height, ["--reel-d" as string]: `${duration}ms` }}
    >
      <style href="reel" precedence="default">
        {css}
      </style>

      <div
        ref={scroller}
        role="region"
        aria-roledescription="carousel"
        aria-label="Short videos. Arrow keys to switch, space to pause, L to like."
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => !drag.current && setHolding(false)}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => {
          const isLiked = liked.has(i);
          return (
            <article
              key={it.src + i}
              data-active={i === active || undefined}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${it.author}`}
              onDoubleClick={(e) => onDouble(e, i)}
              className="reel-card relative h-full snap-start snap-always overflow-hidden text-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt="" draggable={false} className="reel-img absolute inset-0 h-full w-full select-none object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80" />

              <div className="absolute bottom-16 right-2.5 flex flex-col items-center gap-3.5 text-[11px] font-medium">
                <button
                  type="button"
                  aria-label={isLiked ? "Unlike" : "Like"}
                  aria-pressed={isLiked}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => toggleLike(i)}
                  className="flex flex-col items-center gap-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <motion.span animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                    <Heart className={cn("size-6 drop-shadow", isLiked && "fill-rose-500 text-rose-500")} />
                  </motion.span>
                  {compact((it.likes ?? 0) + (isLiked ? 1 : 0))}
                </button>
                <span className="flex flex-col items-center gap-0.5">
                  <MessageCircle className="size-6 drop-shadow" aria-hidden />
                  <span className="sr-only">Comments:</span>
                  {compact(it.comments ?? 0)}
                </span>
                <Send className="size-5 drop-shadow" aria-hidden />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-3.5 pr-12">
                <div className="flex items-center gap-2">
                  {it.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.avatar} alt="" draggable={false} className="size-7 rounded-full object-cover ring-2 ring-white/80" />
                  )}
                  <span className="text-[13px] font-semibold">{it.author}</span>
                  <span className="rounded-md border border-white/50 px-1.5 py-px text-[10px] font-semibold">Follow</span>
                </div>
                <p className="mt-2 line-clamp-2 text-[12.5px] leading-snug text-white/90">{it.caption}</p>
                {it.audio && (
                  <p className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[11px] text-white/80">
                    <Music2 className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">{it.audio}</span>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Story-style progress bars. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-3 top-3 flex gap-1">
        {items.map((it, i) => (
          <span key={it.src + i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
            {i < active || (i === active && !autoPlay) ? (
              <span className="block h-full w-full bg-white" />
            ) : i === active ? (
              <span key={cycle} className="reel-fill block h-full w-full bg-white" onAnimationEnd={next} />
            ) : null}
          </span>
        ))}
      </div>
      <p aria-hidden className="pointer-events-none absolute left-3.5 top-6 text-sm font-semibold text-white drop-shadow">
        Reels
      </p>

      <AnimatePresence>
        {manualPause && (
          <motion.span
            key="pause"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="pointer-events-none absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
          >
            <Pause className="size-6 fill-white" aria-hidden />
          </motion.span>
        )}
        {burst && (
          <motion.span
            key={burst.id}
            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.2, 1, 1.4], rotate: [-15, 0, 0, 0], y: [0, 0, 0, -40] }}
            transition={{ duration: 0.9, times: [0, 0.25, 0.6, 1] }}
            onAnimationComplete={() => setBurst(null)}
            className="pointer-events-none absolute -ml-10 -mt-10"
            style={{ left: burst.x, top: burst.y }}
          >
            <Heart className="size-20 fill-rose-500 text-rose-500 drop-shadow-[0_6px_20px_rgba(244,63,94,.6)]" aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
