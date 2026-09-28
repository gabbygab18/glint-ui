"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Mic, Pause, Play, Send, Square, Trash2 } from "lucide-react";

type Mode = "idle" | "recording" | "recorded";

export interface VoicePillProps {
  /** Number of waveform bars. */
  bars?: number;
  /** Recording accent color. */
  color?: string;
  /** Recording stops by itself after this many seconds. */
  maxSeconds?: number;
  onStart?: () => void;
  /** Called with the recorded length in seconds. */
  onStop?: (seconds: number) => void;
  onSend?: (seconds: number) => void;
  onDiscard?: () => void;
  className?: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const pop = { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.6 } };

export function VoicePill({
  bars = 28,
  color = "#ef4444",
  maxSeconds = 60,
  onStart,
  onStop,
  onSend,
  onDiscard,
  className,
}: VoicePillProps) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("idle");
  const [secs, setSecs] = useState(0);
  const [wave, setWave] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const history = useRef<number[]>([]);
  const elapsed = useRef(0);
  const playback = useRef<ReturnType<typeof animate> | null>(null);
  const progress = useMotionValue(0);
  const clip = useTransform(progress, (p) => `inset(0 ${(1 - p) * 100}% 0 0)`);

  const finish = () => {
    // Squash the whole take into `bars` peaks for the playback waveform.
    const h = history.current.length ? history.current : [0.1];
    const peaks = Array.from({ length: bars }, (_, i) => {
      const a = Math.floor((i * h.length) / bars);
      const b = Math.max(a + 1, Math.floor(((i + 1) * h.length) / bars));
      return Math.max(...h.slice(a, b), 0);
    });
    const top = Math.max(...peaks) || 1;
    setWave(peaks.map((v) => Math.max(0.1, v / top))); // normalized so the loudest bar fills the pill
    const s = Math.max(1, Math.round(elapsed.current));
    setSecs(s);
    setMode("recorded");
    onStop?.(s);
  };
  const onLimit = useEffectEvent(finish);

  // Simulated microphone: a speech-like envelope (words and pauses) with jitter,
  // scrolled right-to-left. Writes straight to the bars, React only sees the seconds.
  useEffect(() => {
    if (mode !== "recording") return;
    const levels = new Array<number>(bars).fill(0.08);
    history.current = [];
    let env = 0.3;
    let target = 0.6;
    let last = 0;
    let shown = 0;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      elapsed.current = (now - t0) / 1000;
      if (elapsed.current >= maxSeconds) return onLimit();
      if (now - last > 75) {
        last = now;
        if (Math.random() < 0.14) target = Math.random() < 0.25 ? 0.05 : 0.35 + Math.random() * 0.65;
        env += (target - env) * 0.35;
        const lv = Math.min(1, Math.max(0.08, env * (0.5 + Math.random() * 0.5)));
        levels.shift();
        levels.push(lv);
        history.current.push(lv);
        levels.forEach((l, i) => {
          const el = barRefs.current[i];
          if (el) el.style.transform = `scaleY(${l})`;
        });
      }
      const s = Math.floor(elapsed.current);
      if (s !== shown) setSecs((shown = s));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, bars, maxSeconds]);

  useEffect(() => () => playback.current?.stop(), []);

  const start = () => {
    setSecs(0);
    setMode("recording");
    onStart?.();
  };

  const togglePlay = () => {
    if (playing) {
      playback.current?.stop();
      return setPlaying(false);
    }
    if (progress.get() >= 1) progress.set(0);
    setPlaying(true);
    playback.current = animate(progress, 1, { duration: secs * (1 - progress.get()), ease: "linear" });
    playback.current.then(() => {
      setPlaying(false);
      progress.set(0);
    });
  };

  const reset = () => {
    playback.current?.stop();
    progress.set(0);
    setPlaying(false);
    setMode("idle");
  };

  const iconBtn =
    "grid size-9 shrink-0 place-items-center rounded-full outline-none transition-transform active:scale-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 24 };

  return (
    <motion.div
      layout
      transition={spring}
      style={{ borderRadius: 999 }}
      className={`inline-flex h-12 items-center gap-2 border border-border bg-card p-1.5 shadow-lg shadow-black/20 ${className ?? ""}`}
    >
      <span className="sr-only" aria-live="polite">
        {mode === "recording" ? "Recording" : mode === "recorded" ? `Recorded ${fmt(secs)}` : ""}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        {mode === "idle" && (
          <motion.div key="idle" layout {...pop} transition={spring} className="flex items-center gap-2 pr-3">
            <button type="button" onClick={start} aria-label="Start recording" className={`${iconBtn} bg-primary text-primary-foreground`}>
              <Mic className="size-4" />
            </button>
            <span className="text-sm font-medium text-foreground">Record a voice note</span>
          </motion.div>
        )}

        {mode === "recording" && (
          <motion.div key="rec" layout {...pop} transition={spring} className="flex items-center gap-3 pr-3">
            <button
              type="button"
              onClick={finish}
              aria-label="Stop recording"
              className={`${iconBtn} relative text-white`}
              style={{ background: color }}
            >
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ background: color }}
                  animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <Square className="relative size-3.5 fill-current" />
            </button>
            <span aria-hidden className="flex h-7 items-center gap-[3px]" style={{ color }}>
              {Array.from({ length: bars }, (_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                  className="h-full w-[3px] rounded-full bg-current transition-transform duration-75"
                  style={{ transform: "scaleY(0.08)" }}
                />
              ))}
            </span>
            <span role="timer" className="w-9 text-right text-sm font-medium text-foreground tabular-nums">
              {fmt(secs)}
            </span>
          </motion.div>
        )}

        {mode === "recorded" && (
          <motion.div key="done" layout {...pop} transition={spring} className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play recording"}
              className={`${iconBtn} bg-primary text-primary-foreground`}
            >
              {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
            </button>
            <span aria-hidden className="relative grid h-7">
              {[false, true].map((lit) => (
                <motion.span
                  key={String(lit)}
                  className={`col-start-1 row-start-1 flex h-full items-center gap-[3px] ${lit ? "text-foreground" : "text-muted-foreground/50"}`}
                  style={lit ? { clipPath: clip } : undefined}
                >
                  {wave.map((l, i) => (
                    <motion.span
                      key={i}
                      className="h-full w-[3px] origin-center rounded-full bg-current"
                      initial={{ scaleY: 0.08 }}
                      animate={{ scaleY: l }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 14, delay: i * 0.012 }}
                    />
                  ))}
                </motion.span>
              ))}
            </span>
            <span className="w-9 text-right text-sm font-medium text-foreground tabular-nums">{fmt(secs)}</span>
            <button
              type="button"
              onClick={() => {
                reset();
                onDiscard?.();
              }}
              aria-label="Discard recording"
              className={`${iconBtn} text-muted-foreground hover:bg-muted hover:text-foreground`}
            >
              <Trash2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                onSend?.(secs);
              }}
              aria-label="Send recording"
              className={`${iconBtn} text-white`}
              style={{ background: color }}
            >
              <Send className="size-4 -translate-x-px" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
