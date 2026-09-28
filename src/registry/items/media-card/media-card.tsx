"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaTrack {
  title: string;
  artist: string;
  cover: string;
  /** Length in seconds. */
  duration: number;
}

export interface MediaCardProps {
  tracks: MediaTrack[];
  /** Accent color for progress, play button and equalizer. */
  accent?: string;
  /** Start playing on mount. */
  autoPlay?: boolean;
  /** Number of equalizer bars. */
  bars?: number;
  /** Blurred cover glow behind the card. */
  glow?: boolean;
  className?: string;
}

const css = `
@keyframes media-card-eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
.media-card-bar{transform:scaleY(.25);transform-origin:bottom;transition:transform .3s}
.media-card-eq[data-on] .media-card-bar{animation:media-card-eq var(--d) ease-in-out infinite var(--delay)}
@media (prefers-reduced-motion:reduce){.media-card-eq[data-on] .media-card-bar{animation:none;transform:scaleY(.6)}}
.media-card-range{appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer}
.media-card-range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;opacity:0}
.media-card-range::-moz-range-thumb{width:14px;height:14px;opacity:0;border:0}
`;

// Both icons are two 4-point shapes, so the path strings interpolate point by point.
const PLAY = ["M8 5 L13 8.2 L13 15.8 L8 19 Z", "M13 8.2 L19 12 L19 12 L13 15.8 Z"];
const PAUSE = ["M7 5 L10.5 5 L10.5 19 L7 19 Z", "M13.5 5 L17 5 L17 19 L13.5 19 Z"];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
// Deterministic pseudo-random timing per bar.
const barTiming = (i: number) => ({ d: 0.7 + ((i * 37) % 9) / 16, delay: -((i * 53) % 7) / 10 });

export function MediaCard({ tracks, accent = "#a3e635", autoPlay = false, bars = 4, glow = true, className }: MediaCardProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [time, setTime] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(() => new Set());
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const timeRef = useRef(0);
  const reduce = useReducedMotion();
  const n = tracks.length;
  const i = Math.min(index, n - 1);
  const track = tracks[i];

  const seek = (t: number) => {
    timeRef.current = t;
    setTime(t);
  };
  const go = (step: number) => {
    setIndex((cur) => {
      if (repeat && step === 0) return cur;
      if (shuffle && n > 1) return (cur + 1 + ((cur * 7 + 3) % (n - 1))) % n;
      return (cur + (step || 1) + n) % n;
    });
    seek(0);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  useEffect(() => {
    if (!playing || scrubbing) return;
    const id = window.setInterval(() => {
      const next = timeRef.current + 0.25;
      if (next >= track.duration) goRef.current(0);
      else seek(next);
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, scrubbing, track.duration]);

  const pct = (time / track.duration) * 100;
  const isLiked = liked.has(i);
  const iconBtn =
    "grid size-9 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={cn("relative w-80", className)} style={{ "--accent": accent } as CSSProperties}>
      <style href="media-card" precedence="default">
        {css}
      </style>
      {glow && (
        <AnimatePresence>
          <motion.img
            key={track.cover}
            src={track.cover}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-6 aspect-square w-[calc(100%-3rem)] rounded-full object-cover blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: playing ? 0.55 : 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
      )}

      <div className="relative rounded-[28px] border border-border bg-card/85 p-4 shadow-2xl backdrop-blur-xl">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <AnimatePresence initial={false}>
            <motion.img
              key={track.cover}
              src={track.cover}
              alt={`${track.title} cover art`}
              draggable={false}
              className="absolute inset-0 size-full object-cover"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: playing || reduce ? 1 : 0.96 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              style={{ borderRadius: 16 }}
            />
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <p className="truncate text-base font-semibold tracking-tight text-foreground">{track.title}</p>
                <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div aria-hidden className="media-card-eq mt-1.5 flex h-4 items-end gap-[3px]" data-on={playing || undefined}>
            {Array.from({ length: bars }, (_, b) => {
              const t = barTiming(b);
              return (
                <span
                  key={b}
                  className="media-card-bar w-[3px] rounded-full"
                  style={{ height: "100%", background: "var(--accent)", "--d": `${t.d}s`, "--delay": `${t.delay}s` } as CSSProperties}
                />
              );
            })}
          </div>
          <button
            type="button"
            aria-pressed={isLiked}
            aria-label={isLiked ? "Remove from liked" : "Like"}
            onClick={() =>
              setLiked((s) => {
                const next = new Set(s);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              })
            }
            className={cn(iconBtn, "-mt-1 -mr-1")}
          >
            <motion.span
              key={String(isLiked)}
              initial={reduce || !isLiked ? false : { scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className="grid"
            >
              <Heart className={cn("size-5", isLiked && "fill-rose-500 text-rose-500")} />
            </motion.span>
          </button>
        </div>

        <div className="group relative mt-4 h-4">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted transition-[height] group-hover:h-1.5">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: "var(--accent)", transition: scrubbing || time === 0 ? "none" : "width .25s linear" }}
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-foreground shadow transition-transform group-hover:scale-100 group-has-focus-visible:scale-100"
            style={{ left: `${pct}%`, transition: scrubbing || time === 0 ? "transform .15s" : "left .25s linear, transform .15s" }}
          />
          <input
            type="range"
            min={0}
            max={track.duration}
            step={1}
            value={Math.floor(time)}
            aria-label="Seek"
            aria-valuetext={`${fmt(time)} of ${fmt(track.duration)}`}
            onChange={(e) => seek(Number(e.target.value))}
            onPointerDown={() => setScrubbing(true)}
            onPointerUp={() => setScrubbing(false)}
            onBlur={() => setScrubbing(false)}
            className="media-card-range absolute inset-0 w-full outline-none"
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{fmt(time)}</span>
          <span>-{fmt(track.duration - time)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button type="button" aria-label="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle((s) => !s)} className={iconBtn}>
            <Shuffle className="size-4" style={{ color: shuffle ? accent : undefined }} />
          </button>
          <button type="button" aria-label="Previous track" onClick={() => (time > 3 ? seek(0) : go(-1))} className={iconBtn}>
            <SkipBack className="size-5 fill-current" />
          </button>
          <motion.button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((p) => !p)}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            className="grid size-14 place-items-center rounded-full text-black shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            style={{ background: accent, boxShadow: `0 10px 30px -8px ${accent}` }}
          >
            <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
              {[0, 1].map((k) => (
                <motion.path
                  key={k}
                  initial={false}
                  animate={{ d: playing ? PAUSE[k] : PLAY[k] }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26 }}
                />
              ))}
            </svg>
          </motion.button>
          <button type="button" aria-label="Next track" onClick={() => go(1)} className={iconBtn}>
            <SkipForward className="size-5 fill-current" />
          </button>
          <button type="button" aria-label="Repeat track" aria-pressed={repeat} onClick={() => setRepeat((r) => !r)} className={iconBtn}>
            <Repeat className="size-4" style={{ color: repeat ? accent : undefined }} />
          </button>
        </div>
      </div>
    </div>
  );
}
