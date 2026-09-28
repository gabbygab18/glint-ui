"use client";

import { useEffect, useRef } from "react";

export interface StatCountItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Optional smaller line under the label. */
  description?: string;
}

export interface StatsCountProps {
  stats: StatCountItem[];
  /** Ms each number takes to count up. */
  duration?: number;
  /** Ms between each stat starting. */
  stagger?: number;
  /** Show hairline dividers between stats. */
  dividers?: boolean;
  /** Count again every time the row re-enters the viewport. */
  repeat?: boolean;
  /** Color of the accent bar that sweeps under each number. */
  accent?: string;
  className?: string;
}

const css = `
.stats-count-item{opacity:0;transform:translateY(14px);filter:blur(4px);transition:opacity .7s ease,transform .8s cubic-bezier(.2,.8,.2,1),filter .7s ease;transition-delay:var(--d)}
.stats-count-bar{transform:scaleX(0);transform-origin:left;transition:transform 1s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--d) + .15s)}
[data-in] .stats-count-item{opacity:1;transform:none;filter:none}
[data-in] .stats-count-bar{transform:scaleX(1)}
@media (prefers-reduced-motion: reduce){.stats-count-item,.stats-count-bar{transition:none}}
`;

const fmt = (n: number, d: number) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export function StatsCount({
  stats,
  duration = 2200,
  stagger = 140,
  dividers = true,
  repeat = false,
  accent = "#a3e635",
  className,
}: StatsCountProps) {
  const root = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const nums = Array.from(el.querySelectorAll<HTMLElement>("[data-num]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const reset = () => {
      cancelAnimationFrame(raf);
      delete el.dataset.in;
      nums.forEach((n, i) => (n.textContent = fmt(0, stats[i]?.decimals ?? 0)));
    };

    const run = () => {
      el.dataset.in = "";
      const t0 = performance.now();
      const tick = (now: number) => {
        let done = true;
        nums.forEach((n, i) => {
          const s = stats[i];
          if (!s) return;
          const p = reduced ? 1 : Math.min(Math.max((now - t0 - i * stagger) / duration, 0), 1);
          if (p < 1) done = false;
          // Expo-out: races early, settles softly on the final digits.
          const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          n.textContent = fmt(s.value * e, s.decimals ?? 0);
        });
        if (!done) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          if (!repeat) io.disconnect();
        } else if (repeat) reset();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stats, duration, stagger, repeat]);

  return (
    <dl
      ref={root}
      className={`grid w-full grid-cols-2 gap-y-10 md:grid-flow-col md:auto-cols-fr md:grid-cols-none ${className ?? ""}`}
    >
      <style href="stats-count" precedence="default">
        {css}
      </style>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`stats-count-item flex min-w-0 flex-col px-5 md:px-7 ${
            dividers && i > 0 ? "md:border-l md:border-border" : ""
          } ${dividers && i % 2 === 1 ? "border-l border-border" : ""}`}
          style={{ ["--d" as string]: `${i * stagger}ms` }}
        >
          <dt className="order-2 mt-3 text-sm font-medium text-foreground">{s.label}</dt>
          <dd className="order-1 whitespace-nowrap text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            <span className="sr-only">
              {s.prefix}
              {fmt(s.value, s.decimals ?? 0)}
              {s.suffix}
            </span>
            <span aria-hidden style={{ fontVariantNumeric: "tabular-nums" }}>
              {s.prefix && <span className="text-muted-foreground">{s.prefix}</span>}
              <span data-num>{fmt(0, s.decimals ?? 0)}</span>
              {s.suffix && <span className="text-muted-foreground">{s.suffix}</span>}
            </span>
            <span
              aria-hidden
              className="stats-count-bar mt-4 block h-px w-12"
              style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
            />
          </dd>
          {s.description && <dd className="order-3 mt-1 text-sm text-muted-foreground">{s.description}</dd>}
        </div>
      ))}
    </dl>
  );
}
