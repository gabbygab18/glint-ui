"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export interface FuseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ms the button must be held for the fuse to burn all the way round. */
  duration?: number;
  /** Spark and burst color. */
  color?: string;
  /** Called once the fuse finishes burning. */
  onComplete?: () => void;
}

const SPARKS = 14;
const EMBERS = 5;
const css = `
@keyframes fuse-button-spark{from{transform:translate(-50%,-50%) scale(1);opacity:1}to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.2);opacity:0}}
@keyframes fuse-button-ring{from{transform:translate(-50%,-50%) scale(.15);opacity:.9}to{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes fuse-button-flash{from{opacity:.45}to{opacity:0}}
@keyframes fuse-button-regrow{from{opacity:0}to{opacity:1}}`;

/** Pill outline starting at top center, running clockwise. */
function pill(w: number, h: number, inset = 1) {
  const r = h / 2 - inset;
  const l = inset + r;
  const rt = w - inset - r;
  const t = inset;
  const b = h - inset;
  return `M${w / 2} ${t}H${rt}A${r} ${r} 0 0 1 ${rt} ${b}H${l}A${r} ${r} 0 0 1 ${l} ${t}Z`;
}

export function FuseButton({
  duration = 1600,
  color = "#fb923c",
  onComplete,
  className,
  children,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  ...props
}: FuseButtonProps) {
  const btn = useRef<HTMLButtonElement>(null);
  const fuse = useRef<SVGPathElement>(null);
  const spark = useRef<SVGGElement>(null);
  const loop = useRef({ p: 0, holding: false, raf: 0, last: 0, calm: false });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [bursts, setBursts] = useState(0);

  useEffect(() => {
    const el = btn.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    const st = loop.current;
    return () => {
      ro.disconnect();
      cancelAnimationFrame(st.raf);
    };
  }, []);

  // Direct DOM writes: burnt part hidden via dash offset, spark parked at the burn point.
  const draw = (p: number) => {
    const path = fuse.current;
    const g = spark.current;
    if (!path || !g) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    path.style.strokeDashoffset = `${-p * len}`;
    const pt = path.getPointAtLength(p * len);
    g.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    g.style.opacity = p > 0 ? "1" : "0";
    if (loop.current.calm) return;
    g.querySelectorAll<SVGCircleElement>("[data-ember]").forEach((c) => {
      const a = Math.random() * Math.PI * 2;
      const d = 4 + Math.random() * 10;
      c.setAttribute("cx", `${Math.cos(a) * d}`);
      c.setAttribute("cy", `${Math.sin(a) * d}`);
      c.style.opacity = `${Math.random()}`;
    });
  };

  const tick = (now: number) => {
    const st = loop.current;
    const dt = Math.min(50, Math.max(0, now - st.last)); // rAF time can precede performance.now()
    st.last = now;
    // Burns forward while held, snaps back quickly when released early.
    st.p += st.holding ? dt / duration : -dt / 280;
    if (st.p >= 1) {
      st.p = 0;
      st.holding = false;
      st.raf = 0;
      draw(0);
      setBursts((b) => b + 1);
      onComplete?.();
      return;
    }
    if (st.p <= 0 && !st.holding) {
      st.p = 0;
      st.raf = 0;
      draw(0);
      return;
    }
    draw(st.p);
    st.raf = requestAnimationFrame(tick);
  };

  const start = () => {
    const st = loop.current;
    if (disabled || st.holding) return;
    st.holding = true;
    st.calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!st.raf) {
      st.last = performance.now();
      st.raf = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    loop.current.holding = false;
  };

  const key = (e: KeyboardEvent<HTMLButtonElement>, down: boolean) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (down && !e.repeat) start();
    if (!down) stop();
  };

  const { w, h } = size;
  return (
    <button
      ref={btn}
      type="button"
      disabled={disabled}
      {...props}
      onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
        if (e.button === 0) start();
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        stop();
        onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        stop();
        onPointerLeave?.(e);
      }}
      onPointerCancel={(e) => {
        stop();
        onPointerCancel?.(e);
      }}
      onKeyDown={(e) => {
        key(e, true);
        onKeyDown?.(e);
      }}
      onKeyUp={(e) => {
        key(e, false);
        onKeyUp?.(e);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative inline-flex h-12 touch-none select-none items-center justify-center gap-2 rounded-full bg-card px-8 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/.06),0_10px_30px_-14px_rgb(0_0_0/.6)] transition-[scale] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    >
      <style href="fuse-button" precedence="default">
        {css}
      </style>
      {w > 0 && (
        <svg aria-hidden width={w} height={h} className="pointer-events-none absolute inset-0 overflow-visible">
          {/* Burnt track */}
          <path d={pill(w, h)} fill="none" strokeWidth={1.5} className="stroke-border" />
          {/* Unburnt fuse; remounted after each burst so it can fade back in. */}
          <path
            key={bursts}
            ref={fuse}
            d={pill(w, h)}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            className={`stroke-foreground/40 ${bursts ? "[animation:fuse-button-regrow_.6s_.35s_ease-out_both]" : ""}`}
          />
          <g ref={spark} style={{ opacity: 0 }}>
            <circle r={13} fill={color} opacity={0.16} />
            <circle r={6.5} fill={color} opacity={0.5} />
            <circle r={3} fill="#fff" />
            {Array.from({ length: EMBERS }, (_, i) => (
              <circle key={i} data-ember r={1.5} fill={i % 2 ? color : "#fde68a"} />
            ))}
          </g>
        </svg>
      )}
      {bursts > 0 && (
        <span key={bursts} aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="absolute inset-0 rounded-full [animation:fuse-button-flash_.7s_ease-out_forwards]"
            style={{ background: color }}
          />
          <span className="absolute left-1/2 top-px motion-reduce:hidden">
            <span
              className="absolute left-0 top-0 size-20 rounded-full border-2 [animation:fuse-button-ring_.6s_ease-out_forwards]"
              style={{ borderColor: color }}
            />
            {Array.from({ length: SPARKS }, (_, i) => {
              const a = (i / SPARKS) * Math.PI * 2 + 0.2;
              const d = 26 + (i % 3) * 14;
              return (
                <span
                  key={i}
                  className="absolute left-0 top-0 size-2 rounded-full [animation:fuse-button-spark_.7s_cubic-bezier(.15,.8,.3,1)_forwards]"
                  style={
                    {
                      background: i % 2 ? color : "#fef3c7",
                      boxShadow: `0 0 6px ${color}`,
                      "--dx": `${Math.cos(a) * d}px`,
                      "--dy": `${Math.sin(a) * d}px`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </span>
        </span>
      )}
      <span className="relative">{children}</span>
    </button>
  );
}
