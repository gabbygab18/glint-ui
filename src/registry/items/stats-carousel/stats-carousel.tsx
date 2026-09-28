"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Change vs. previous period, in %. */
  delta?: number;
  /** Set when a drop is good news (churn, latency). */
  invert?: boolean;
  /** Sparkline points, any scale. */
  data: number[];
  /** Small caption under the chart, e.g. "vs. last 30 days". */
  caption?: string;
}

export interface StatsCarouselProps {
  stats: StatItem[];
  /** Advance automatically. Pauses on hover and focus. */
  autoPlay?: boolean;
  /** Ms between slides. */
  interval?: number;
  /** Ms for the count-up and sparkline draw. */
  duration?: number;
  /** Card width in px. */
  cardWidth?: number;
  /** Px between cards. */
  gap?: number;
  /** Accent for metrics moving the right way. */
  positiveColor?: string;
  /** Accent for metrics moving the wrong way. */
  negativeColor?: string;
  className?: string;
}

const W = 240;
const H = 64;

function sparkPath(data: number[]) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => [(i / Math.max(1, data.length - 1)) * W, H - 4 - ((d - min) / span) * (H - 8)]);
  // Smooth with midpoint quadratic curves.
  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    line += ` Q${px},${py} ${(px + x) / 2},${(py + y) / 2}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  line += ` T${lx},${ly}`;
  return { line, area: `${line} L${W},${H} L0,${H} Z`, end: [lx, ly] as const };
}

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function StatCard({
  stat,
  active,
  duration,
  color,
  index,
  total,
}: {
  stat: StatItem;
  active: boolean;
  duration: number;
  color: string;
  index: number;
  total: number;
}) {
  const num = useRef<HTMLSpanElement>(null);
  const gid = useId().replace(/:/g, "");
  const { line, area, end } = sparkPath(stat.data.length > 1 ? stat.data : [0, 0]);
  const decimals = stat.decimals ?? 0;
  const up = (stat.delta ?? 0) >= 0;

  useEffect(() => {
    const el = num.current;
    if (!el || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(stat.value, decimals);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      el.textContent = fmt(stat.value * (1 - Math.pow(1 - p, 4)), decimals);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, stat.value, decimals, duration]);

  const draw = active ? `stroke-dashoffset ${duration}ms cubic-bezier(.3,.7,.2,1) 120ms` : "stroke-dashoffset .3s";

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${stat.label}`}
      aria-hidden={!active}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
        {stat.delta !== undefined && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
            style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}
          >
            <svg viewBox="0 0 10 10" className="size-2.5" style={{ transform: up ? undefined : "rotate(180deg)" }} aria-hidden>
              <path d="M5 1.5 9 7.5H1z" fill="currentColor" />
            </svg>
            {Math.abs(stat.delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        {stat.prefix}
        <span ref={num}>{fmt(stat.value, decimals)}</span>
        {stat.suffix && <span className="ml-0.5 text-2xl text-muted-foreground">{stat.suffix}</span>}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-auto h-16 w-full overflow-visible pt-4" aria-hidden>
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={area}
          fill={`url(#${gid}-fill)`}
          style={{ opacity: active ? 1 : 0, transition: `opacity ${active ? duration : 300}ms ease ${active ? duration * 0.4 : 0}ms` }}
        />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: active ? 0 : 1, transition: draw }}
        />
        <circle
          cx={end[0]}
          cy={end[1]}
          r={3.5}
          fill={color}
          style={{
            opacity: active ? 1 : 0,
            transition: `opacity .3s ease ${active ? duration + 80 : 0}ms`,
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      {stat.caption && <p className="mt-2 text-xs text-muted-foreground">{stat.caption}</p>}
    </div>
  );
}

export function StatsCarousel({
  stats,
  autoPlay = true,
  interval = 3200,
  duration = 1400,
  cardWidth = 280,
  gap = 20,
  positiveColor = "#a3e635",
  negativeColor = "#fb7185",
  className,
}: StatsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = stats.length;
  const current = n ? ((index % n) + n) % n : 0;
  const go = (i: number) => setIndex(((i % n) + n) % n);

  useEffect(() => {
    if (!autoPlay || paused || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % n), interval);
    return () => window.clearTimeout(id);
  }, [autoPlay, paused, interval, n, current]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(current + 1);
    else if (e.key === "ArrowLeft") go(current - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Key metrics"
      className={`relative w-full select-none ${className ?? ""}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
      onKeyDown={onKey}
    >
      <div
        className="overflow-hidden py-6"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        }}
      >
        <div aria-live={autoPlay && !paused ? "off" : "polite"} className="relative" style={{ height: 212 }}>
          {stats.map((s, i) => {
            const active = i === current;
            const good = (s.delta ?? 0) >= 0 !== !!s.invert;
            // Signed circular distance from the current card, so both sides stay filled and the loop is seamless.
            let off = (((i - current) % n) + n) % n;
            if (off > n / 2) off -= n;
            const far = Math.abs(off) > 2;
            return (
              <div
                key={s.label + i}
                onClick={() => !active && go(i)}
                className="absolute left-1/2 top-0 motion-reduce:!transition-none"
                style={{
                  width: cardWidth,
                  height: 212,
                  marginLeft: -cardWidth / 2,
                  zIndex: 10 - Math.abs(off),
                  visibility: far ? "hidden" : undefined,
                  opacity: far ? 0 : active ? 1 : 0.4,
                  transform: `translateX(${off * (cardWidth + gap)}px) scale(${active ? 1 : 0.9})`,
                  filter: active ? "none" : "saturate(.4)",
                  // Far cards jump instantly (they are off-stage), so nothing visibly slides across the row.
                  transition: far ? "opacity .3s, visibility .3s" : "opacity .6s, transform .7s cubic-bezier(.65,0,.2,1), filter .6s",
                  cursor: active ? "default" : "pointer",
                }}
              >
                <StatCard stat={s} active={active} duration={duration} color={good ? positiveColor : negativeColor} index={i} total={n} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous metric"
          onClick={() => go(current - 1)}
          className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          {stats.map((s, i) => (
            <button
              key={s.label + i}
              type="button"
              aria-label={`Show ${s.label}`}
              aria-current={i === current}
              onClick={() => go(i)}
              className="h-1.5 rounded-full bg-foreground/20 transition-all duration-500 hover:bg-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=true]:bg-foreground"
              style={{ width: i === current ? 22 : 6 }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next metric"
          onClick={() => go(current + 1)}
          className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
