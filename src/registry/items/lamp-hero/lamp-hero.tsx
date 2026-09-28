"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// The cone is a conic-gradient whose half-angle (--lh-spread) is a registered
// @property, so the browser can transition it: the light literally swings open.
const css = `
@property --lh-spread{syntax:'<angle>';inherits:true;initial-value:0deg}
.lh{--lh-spread:6deg}
.lh[data-lit]{--lh-spread:var(--lh-open)}
.lh{--e:cubic-bezier(.16,1,.3,1);transition:--lh-spread 1.4s var(--e) .15s}
.lh-cone{background:conic-gradient(from 180deg at 50% 0%,var(--lh-c) 0deg,color-mix(in oklab,var(--lh-c) 35%,transparent) calc(var(--lh-spread)*.6),transparent var(--lh-spread),transparent calc(360deg - var(--lh-spread)),color-mix(in oklab,var(--lh-c) 35%,transparent) calc(360deg - var(--lh-spread)*.6),var(--lh-c) 360deg);
  -webkit-mask:radial-gradient(ellipse 60% 100% at 50% 0%,#000 25%,transparent 75%);mask:radial-gradient(ellipse 60% 100% at 50% 0%,#000 25%,transparent 75%);opacity:.55}
.lh-fade{opacity:0;transition:opacity 1.2s var(--e) .2s}
.lh[data-lit] .lh-fade{opacity:1}
.lh-bar{width:6rem;transition:width 1.4s var(--e) .15s,opacity .8s var(--e) .15s;opacity:.4}
.lh[data-lit] .lh-bar{width:min(32rem,80vw);opacity:1}
.lh-glow{width:8rem;transition:width 1.4s var(--e) .15s,opacity 1s var(--e) .15s;opacity:.3}
.lh[data-lit] .lh-glow{width:min(26rem,70vw);opacity:1}
.lh-rise{opacity:0;translate:0 2.5rem;filter:blur(6px);transition:opacity 1s var(--e) .45s,translate 1.2s var(--e) .45s,filter 1s var(--e) .45s}
.lh[data-lit] .lh-rise{opacity:1;translate:0 0;filter:blur(0)}
@media (prefers-reduced-motion:reduce){.lh,.lh *{transition:none!important}}
`;

export interface LampHeroProps {
  /** Light color. */
  color?: string;
  /** Half-angle of the light cone when open, in degrees. */
  spread?: number;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Buttons or anything else under the subtitle. */
  children?: ReactNode;
  /** Light up only the first time it scrolls into view. */
  once?: boolean;
  className?: string;
}

export function LampHero({
  color = "#5eead4",
  spread = 32,
  title = "Light the way to launch",
  subtitle = "Everything your team needs to ship polished interfaces, beautifully lit and ready to go.",
  children,
  once = true,
  className,
}: LampHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLit(true);
          if (once) io.disconnect();
        } else if (!once) setLit(false);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <section
      ref={ref}
      data-lit={lit || undefined}
      className={cn("lh relative isolate flex min-h-[26rem] w-full flex-col items-center justify-center overflow-hidden bg-background pt-24 pb-12", className)}
      style={{ "--lh-c": color, "--lh-open": `${spread}deg` } as CSSProperties}
    >
      <style href="lamp-hero" precedence="default">
        {css}
      </style>

      <div className="relative w-full max-w-3xl">
        <div aria-hidden className="pointer-events-none absolute left-1/2 -top-20 -z-10 h-0 w-0">
          {/* light pooling above the fixture */}
          <div className="lh-fade absolute -top-16 left-1/2 h-32 w-[40rem] -translate-x-1/2 rounded-[100%] blur-3xl" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)` }} />
          {/* the cone */}
          <div className="lh-cone absolute top-0 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2" />
          {/* soft bloom right under the tube */}
          <div className="lh-glow absolute -top-6 left-1/2 h-16 -translate-x-1/2 rounded-full blur-2xl" style={{ background: color }} />
          {/* the tube itself */}
          <div className="lh-bar absolute -top-px left-1/2 h-[3px] -translate-x-1/2 rounded-full" style={{ background: color, boxShadow: `0 0 12px 1px ${color}` }} />
          <div className="lh-bar absolute -top-px left-1/2 h-px -translate-x-1/2 rounded-full bg-white/80 blur-[0.5px]" />
        </div>

        <div className="lh-rise flex flex-col items-center px-6 text-center">
          <h1 className="bg-gradient-to-b from-foreground to-foreground/55 bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent sm:text-6xl">
            {title}
          </h1>
          {subtitle && <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{subtitle}</p>}
          {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}
