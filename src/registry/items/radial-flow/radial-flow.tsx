"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RadialFlowNode {
  label: string;
  icon?: ReactNode;
  /** Small second line under the label. */
  hint?: string;
}

export interface RadialFlowProps {
  /** Center node. */
  hub: { label: string; icon?: ReactNode };
  /** Nodes placed around the hub. */
  nodes: RadialFlowNode[];
  /** Pulse and highlight color. */
  accent?: string;
  /** Seconds for one pulse to travel a link. */
  duration?: number;
  /** Pulses in flight per link. */
  pulses?: number;
  /** Which way data flows. "both" alternates per link. */
  direction?: "in" | "out" | "both";
  /** How much the links bow, as a fraction of their length. */
  curvature?: number;
  className?: string;
}

const css = `
@keyframes rf-out{0%{stroke-dashoffset:14;opacity:0}12%{opacity:1}88%{opacity:1}100%{stroke-dashoffset:-100;opacity:0}}
@keyframes rf-in{0%{stroke-dashoffset:-100;opacity:0}12%{opacity:1}88%{opacity:1}100%{stroke-dashoffset:14;opacity:0}}
@keyframes rf-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
@keyframes rf-pop{from{opacity:0;transform:translate(-50%,-50%) scale(.85)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes rf-ring{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.9);opacity:0}}
.rf-link{stroke-dasharray:100;animation:rf-draw 1.1s cubic-bezier(.3,.7,.2,1) both}
.rf-pulse{stroke-dasharray:14 200;stroke-dashoffset:14;animation:var(--rf-anim) var(--rf-d) linear infinite;animation-delay:var(--rf-delay)}
.rf-node{animation:rf-pop .6s cubic-bezier(.2,.8,.2,1) both}
.rf-ring{animation:rf-ring 2.8s cubic-bezier(.2,.6,.3,1) infinite}
.rf-root[data-paused] *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.rf-pulse,.rf-ring{display:none}.rf-link,.rf-node{animation:none}}
`;

export function RadialFlow({
  hub,
  nodes,
  accent = "#a3e635",
  duration = 2.6,
  pulses = 1,
  direction = "both",
  curvature = 0.18,
  className,
}: RadialFlowProps) {
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hot, setHot] = useState<number | null>(null);
  const n = nodes.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) delete el.dataset.paused;
      else el.dataset.paused = "";
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Ellipse layout, in fractions of the box; offset by half a step so no node sits dead-center on top.
  const pts = nodes.map((_, i) => {
    const a = ((-90 + 180 / n + (360 / n) * i) * Math.PI) / 180;
    return { fx: 0.5 + Math.cos(a) * 0.39, fy: 0.5 + Math.sin(a) * 0.37 };
  });

  const { w, h } = size;
  const cx = w / 2;
  const cy = h / 2;
  const links = pts.map(({ fx, fy }) => {
    const x = fx * w;
    const y = fy * h;
    const dx = x - cx;
    const dy = y - cy;
    // Control point pushed perpendicular to the spoke, same side for every link, so the diagram swirls.
    const qx = cx + dx / 2 - dy * curvature;
    const qy = cy + dy / 2 + dx * curvature;
    return `M${cx},${cy} Q${qx},${qy} ${x},${y}`;
  });

  const k = Math.max(1, Math.min(4, Math.round(pulses)));

  return (
    <div
      ref={root}
      className={cn("rf-root relative aspect-[16/9] w-full max-w-[44rem] select-none", className)}
      style={{ ["--rf-accent" as string]: accent } as CSSProperties}
    >
      <style href="radial-flow" precedence="default">
        {css}
      </style>

      {w > 0 && (
        <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 overflow-visible">
          {links.map((d, i) => {
            const dim = hot !== null && hot !== i;
            const lit = hot === i;
            const inward = direction === "in" || (direction === "both" && i % 2 === 1);
            return (
              <g key={i} style={{ opacity: dim ? 0.25 : 1, transition: "opacity .3s" }}>
                <path
                  d={d}
                  pathLength={100}
                  fill="none"
                  strokeWidth={lit ? 1.75 : 1.25}
                  className="rf-link"
                  style={{
                    stroke: lit ? accent : "color-mix(in oklab, var(--foreground) 22%, transparent)",
                    animationDelay: `${i * 70}ms`,
                    transition: "stroke .3s",
                  }}
                />
                {Array.from({ length: k }, (_, j) => {
                  const style = {
                    ["--rf-anim" as string]: inward ? "rf-in" : "rf-out",
                    ["--rf-d" as string]: `${duration}s`,
                    // Deterministic scatter so pulses never fire in lockstep.
                    ["--rf-delay" as string]: `${-(((i * 0.61 + j / k) % 1) * duration).toFixed(2)}s`,
                  } as CSSProperties;
                  return (
                    <g key={j}>
                      <path d={d} pathLength={100} fill="none" stroke={accent} strokeWidth={7} strokeLinecap="round" strokeOpacity={0.18} className="rf-pulse" style={style} />
                      <path d={d} pathLength={100} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" className="rf-pulse" style={style} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}

      <ul className="contents">
        {nodes.map((node, i) => (
          <li
            key={node.label}
            tabIndex={0}
            onPointerEnter={() => setHot(i)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(i)}
            onBlur={() => setHot(null)}
            className="rf-node absolute flex items-center gap-2.5 whitespace-nowrap rounded-xl border bg-card/90 py-2 pl-2 pr-3.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)] outline-none backdrop-blur transition-[border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              left: `${pts[i].fx * 100}%`,
              top: `${pts[i].fy * 100}%`,
              transform: "translate(-50%,-50%)",
              animationDelay: `${250 + i * 70}ms`,
              borderColor: hot === i ? accent : "var(--border)",
              boxShadow: hot === i ? `0 0 0 4px color-mix(in oklab, ${accent} 14%, transparent), 0 10px 30px -12px rgba(0,0,0,.6)` : undefined,
            }}
          >
            {node.icon && (
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground [&_svg]:size-4" aria-hidden>
                {node.icon}
              </span>
            )}
            <span className="leading-tight">
              <span className="block text-[13px] font-medium text-foreground">{node.label}</span>
              {node.hint && <span className="block text-[11px] text-muted-foreground">{node.hint}</span>}
            </span>
          </li>
        ))}
      </ul>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1].map((r) => (
          <span
            key={r}
            aria-hidden
            className="rf-ring absolute inset-0 rounded-[22px] border"
            style={{ borderColor: accent, animationDelay: `${r * 1.4}s` }}
          />
        ))}
        <div
          className="relative flex flex-col items-center gap-1.5 rounded-[22px] border bg-card px-5 py-4 text-center"
          style={{
            borderColor: `color-mix(in oklab, ${accent} 45%, var(--border))`,
            boxShadow: `0 0 50px -10px color-mix(in oklab, ${accent} 55%, transparent), inset 0 1px 0 rgba(255,255,255,.06)`,
          }}
        >
          {hub.icon && (
            <span
              className="grid size-11 place-items-center rounded-xl text-black [&_svg]:size-5"
              style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 55%, #10b981))` }}
              aria-hidden
            >
              {hub.icon}
            </span>
          )}
          <span className="text-sm font-semibold text-foreground">{hub.label}</span>
        </div>
      </div>
    </div>
  );
}
