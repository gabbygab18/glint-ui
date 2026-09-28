"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface CometDialProps {
  min?: number;
  max?: number;
  step?: number;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  /** Called with the new value while dragging or using the keyboard. */
  onChange?: (value: number) => void;
  /** Comet and arc color. */
  color?: string;
  /** Diameter in px. */
  size?: number;
  /** Label under the readout; also the accessible name. */
  label?: string;
  /** Suffix after the number, e.g. "%". */
  unit?: string;
  disabled?: boolean;
  className?: string;
}

const START = 135; // deg, bottom-left
const SWEEP = 270;
const R = 78;
const TAIL = 18;
const TICKS = 31;

const point = (f: number, r = R) => {
  const a = ((START + f * SWEEP) * Math.PI) / 180;
  // Rounded so server and client trig agree (avoids hydration mismatches).
  const q = (n: number) => Math.round(n * 1000) / 1000;
  return [q(100 + Math.cos(a) * r), q(100 + Math.sin(a) * r)] as const;
};
const [ax, ay] = point(0);
const [bx, by] = point(1);
const ARC = `M${ax} ${ay}A${R} ${R} 0 1 1 ${bx} ${by}`;

export function CometDial({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 40,
  onChange,
  color = "#38bdf8",
  size = 220,
  label = "Volume",
  unit = "%",
  disabled,
  className,
}: CometDialProps) {
  const [inner, setInner] = useState(defaultValue);
  const v = Math.min(max, Math.max(min, value ?? inner));
  const frac = (x: number) => (max > min ? (x - min) / (max - min) : 0);

  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const tail = useRef<(SVGCircleElement | null)[]>([]);
  const st = useRef({ cur: -1, target: 0, trail: [] as number[], raf: 0, drag: false, calm: false });

  const draw = () => {
    const s = st.current;
    const [hx, hy] = point(s.cur);
    head.current?.setAttribute("transform", `translate(${hx} ${hy})`);
    if (fill.current) fill.current.style.strokeDashoffset = `${1 - s.cur}`;
    tail.current.forEach((c, i) => {
      if (!c) return;
      const [x, y] = point(s.trail[i] ?? s.cur);
      c.setAttribute("cx", `${x}`);
      c.setAttribute("cy", `${y}`);
    });
  };

  const tick = () => {
    const s = st.current;
    s.cur += (s.target - s.cur) * (s.calm ? 1 : 0.2);
    s.trail.unshift(s.cur);
    s.trail.length = TAIL;
    draw();
    const settled = Math.abs(s.target - s.cur) < 1e-4 && s.trail.every((t) => Math.abs(t - s.cur) < 1e-3);
    s.raf = settled ? 0 : requestAnimationFrame(tick);
  };

  const target = v === undefined ? 0 : frac(v);
  useEffect(() => {
    const s = st.current;
    s.calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.target = target;
    if (s.cur < 0) {
      s.cur = target;
      s.trail = Array(TAIL).fill(target);
      draw();
      return;
    }
    if (!s.raf) s.raf = requestAnimationFrame(tick);
    // draw/tick only touch refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  const commit = (next: number) => {
    const snapped = Math.min(max, Math.max(min, min + Math.round((next - min) / step) * step));
    const clean = Number(snapped.toFixed(6));
    if (clean === v) return;
    setInner(clean);
    onChange?.(clean);
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    let rel = (a - START + 720) % 360;
    if (rel > SWEEP) rel = rel - SWEEP < (360 - SWEEP) / 2 ? SWEEP : 0;
    let f = rel / SWEEP;
    // Don't wrap from max to min (or back) through the dead zone while dragging.
    if (st.current.drag && Math.abs(f - frac(v)) > 0.5) f = frac(v) > 0.5 ? 1 : 0;
    commit(min + f * (max - min));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = step * Math.max(1, Math.round((max - min) / step / 10));
    const map: Record<string, number> = {
      ArrowRight: v + step,
      ArrowUp: v + step,
      ArrowLeft: v - step,
      ArrowDown: v - step,
      PageUp: v + big,
      PageDown: v - big,
      Home: min,
      End: max,
    };
    if (!(e.key in map) || disabled) return;
    e.preventDefault();
    commit(map[e.key]);
  };

  const lit = frac(v);
  const shown = Number.isInteger(step) ? Math.round(v) : v.toFixed(String(step).split(".")[1]?.length ?? 1);

  return (
    <div
      ref={root}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={v}
      aria-valuetext={`${shown}${unit}`}
      aria-disabled={disabled || undefined}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        st.current.drag = false;
        fromPointer(e);
        st.current.drag = true;
      }}
      onPointerMove={(e) => {
        if (st.current.drag) fromPointer(e);
      }}
      onPointerUp={() => (st.current.drag = false)}
      onPointerCancel={() => (st.current.drag = false)}
      className={`group relative touch-none select-none rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
      } ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible">
        {Array.from({ length: TICKS }, (_, i) => {
          const f = i / (TICKS - 1);
          const [x1, y1] = point(f, 92);
          const [x2, y2] = point(f, i % 5 ? 96 : 99);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={1.6}
              strokeLinecap="round"
              className={f <= lit + 1e-6 ? undefined : "stroke-border"}
              style={{ stroke: f <= lit + 1e-6 ? color : undefined, transition: "stroke .25s" }}
            />
          );
        })}
        <path d={ARC} fill="none" strokeWidth={10} strokeLinecap="round" className="stroke-muted" />
        <path
          ref={fill}
          d={ARC}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset={1 - lit}
          style={{ opacity: 0.35 }}
        />
        {Array.from({ length: TAIL }, (_, i) => {
          const k = 1 - i / TAIL;
          return (
            <circle
              key={i}
              ref={(el) => {
                tail.current[i] = el;
              }}
              r={1 + 5.5 * k}
              fill={color}
              opacity={0.55 * k * k}
              cx={point(lit)[0]}
              cy={point(lit)[1]}
            />
          );
        })}
        <g ref={head} transform={`translate(${point(lit)[0]} ${point(lit)[1]})`}>
          <circle r={14} fill={color} opacity={0.18} />
          <circle r={8} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
          <circle r={3.2} fill="#fff" />
        </g>
      </svg>
      <div className="absolute inset-[24%] grid place-items-center rounded-full border border-border bg-card shadow-[inset_0_1px_0_rgb(255_255_255/.08),0_14px_30px_-12px_rgb(0_0_0/.6)] transition-[scale] duration-200 group-active:scale-[.97]">
        <div className="text-center leading-none">
          <div className="text-3xl font-semibold tabular-nums text-foreground" style={{ fontSize: size * 0.15 }}>
            {shown}
            <span className="ml-0.5 text-[0.5em] text-muted-foreground">{unit}</span>
          </div>
          <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
