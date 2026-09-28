"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface SloshGaugeProps {
  /** Controlled value, 0-100. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  /** Called when the user drags or uses the keyboard. Omit both this and `value` for a free-running control. */
  onChange?: (value: number) => void;
  /** Liquid color. */
  color?: string;
  /** Diameter in px. */
  size?: number;
  /** How much the liquid sloshes, 0-2. */
  slosh?: number;
  /** Let the user drag or key the level. */
  interactive?: boolean;
  label?: string;
  className?: string;
}

const W = 200;
const R = 88;

export function SloshGauge({
  value,
  defaultValue = 62,
  onChange,
  color = "#38bdf8",
  size = 208,
  slosh = 1,
  interactive = true,
  label = "Tank level",
  className,
}: SloshGaugeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [inner, setInner] = useState(defaultValue);
  const current = Math.max(0, Math.min(100, value ?? inner));
  const target = useRef(current / 100);
  const sloshRef = useRef(slosh);
  const root = useRef<HTMLDivElement>(null);
  const front = useRef<SVGPathElement>(null);
  const back = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);

  useEffect(() => {
    target.current = current / 100;
    sloshRef.current = slosh;
  }, [current, slosh]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = W / 2 - R;
    let level = target.current; // 0-1
    let vel = 0;
    let amp = 0; // standing-wave amplitude, px
    let ampV = 0;
    let t = 0;
    let raf = 0;
    let last = 0;

    const draw = () => {
      const base = top + 2 * R * (1 - level);
      const ripple = reduce ? 0 : 2.2 + Math.abs(amp) * 0.12;
      let f = "";
      let b = "";
      for (let x = 0; x <= W; x += 8) {
        const tilt = amp * Math.cos((Math.PI * x) / W);
        const yf = base + tilt + ripple * Math.sin(x * 0.045 + t * 2.4);
        const yb = base - tilt * 0.8 + ripple * 1.2 * Math.sin(x * 0.06 - t * 1.7 + 1.3) - 3;
        f += `${x ? "L" : "M"}${x} ${yf.toFixed(2)}`;
        b += `${x ? "L" : "M"}${x} ${yb.toFixed(2)}`;
      }
      f += `L${W} ${W}L0 ${W}Z`;
      b += `L${W} ${W}L0 ${W}Z`;
      front.current?.setAttribute("d", f);
      clip.current?.setAttribute("d", f);
      back.current?.setAttribute("d", b);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - (last || now)) / 1000);
      last = now;
      t += dt;
      // Level: a slightly underdamped spring toward the target.
      const acc = 70 * (target.current - level) - 9 * vel;
      vel += acc * dt;
      level += vel * dt;
      // Slosh: a damped oscillator kicked by the level's acceleration.
      const ampA = -110 * amp - 2.4 * ampV + acc * 60 * sloshRef.current;
      ampV += ampA * dt;
      amp = Math.max(-40, Math.min(40, amp + ampV * dt));
      draw();
      raf = requestAnimationFrame(tick);
    };

    if (reduce) {
      // Static frame, redrawn whenever the target changes.
      const id = window.setInterval(() => {
        if (level !== target.current) {
          level = target.current;
          draw();
        }
      }, 100);
      draw();
      return () => window.clearInterval(id);
    }

    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (e.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    draw();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const set = (v: number) => {
    const next = Math.round(Math.max(0, Math.min(100, v)));
    if (next === current) return;
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - r.top) / r.height) * W;
    set(((W / 2 + R - y) / (2 * R)) * 100);
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowUp: current + 5,
      ArrowRight: current + 5,
      ArrowDown: current - 5,
      ArrowLeft: current - 5,
      PageUp: current + 20,
      PageDown: current - 20,
      Home: 0,
      End: 100,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    set(map[e.key]);
  };

  const vessel = `v${uid}`;
  const wet = `w${uid}`;

  return (
    <div
      ref={root}
      role={interactive ? "slider" : "meter"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      aria-orientation={interactive ? "vertical" : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={current}
      aria-valuetext={`${current}%`}
      onKeyDown={interactive ? onKey : undefined}
      onPointerDown={
        interactive
          ? (e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              fromPointer(e);
            }
          : undefined
      }
      onPointerMove={interactive ? (e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e) : undefined}
      className={`relative touch-none select-none rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background ${interactive ? "cursor-ns-resize" : ""} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${W} ${W}`} className="size-full overflow-visible" aria-hidden>
        <defs>
          <clipPath id={vessel}>
            <circle cx={W / 2} cy={W / 2} r={R} />
          </clipPath>
          <clipPath id={wet}>
            <path ref={clip} />
          </clipPath>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.95" />
            <stop offset="1" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx={W / 2} cy={W / 2} r={R + 7} className="fill-card stroke-border" strokeWidth="1.5" />
        <circle cx={W / 2} cy={W / 2} r={R} className="fill-muted" />
        <g clipPath={`url(#${vessel})`}>
          <path ref={back} fill={color} opacity="0.4" />
          <path ref={front} fill={`url(#g${uid})`} />
        </g>
        <text x={W / 2} y={W / 2 + 12} textAnchor="middle" className="fill-foreground text-[40px] font-semibold tabular-nums">
          {current}
          <tspan className="text-[20px] fill-muted-foreground">%</tspan>
        </text>
        <g clipPath={`url(#${vessel})`}>
          <text x={W / 2} y={W / 2 + 12} textAnchor="middle" clipPath={`url(#${wet})`} className="fill-white text-[40px] font-semibold tabular-nums">
            {current}
            <tspan className="text-[20px] fill-white/70">%</tspan>
          </text>
        </g>
        {/* Glass glint. */}
        <path d={`M${W / 2 - 58} ${W / 2 - 48} A ${R - 14} ${R - 14} 0 0 1 ${W / 2 - 18} ${W / 2 - 72}`} fill="none" stroke="white" strokeOpacity=".35" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
