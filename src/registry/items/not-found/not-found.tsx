"use client";

import { useId, type PointerEvent } from "react";
import { ArrowLeft } from "lucide-react";

export interface NotFoundProps {
  /** Big code shown in the middle. */
  code?: string;
  title?: string;
  message?: string;
  /** Where the button goes. */
  homeHref?: string;
  buttonLabel?: string;
  /** Periodic RGB-split glitch bursts on the code. */
  glitch?: boolean;
  /** Px each digit drifts with the pointer. 0 disables parallax. */
  parallax?: number;
  /** Accent used for the glow and one glitch channel. */
  accent?: string;
  className?: string;
}

const css = `
.nf-digit{transform:translate3d(calc(var(--nf-x,0)*var(--d)*1px),calc(var(--nf-y,0)*var(--d)*1px),0);transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.nf-ghost{position:absolute;inset:0;mix-blend-mode:screen;opacity:0;pointer-events:none}
.nf-glitch .nf-ghost-a{color:var(--nf-accent);animation:nf-a 3.4s steps(1) infinite}
.nf-glitch .nf-ghost-b{color:#22d3ee;animation:nf-b 3.4s steps(1) infinite}
.nf-glitch .nf-core{animation:nf-core 3.4s steps(1) infinite}
@keyframes nf-a{
0%,78%,100%{opacity:0;transform:none;clip-path:none}
80%{opacity:.9;transform:translate(-6px,0);clip-path:inset(12% 0 62% 0)}
83%{opacity:.9;transform:translate(8px,0);clip-path:inset(58% 0 18% 0)}
86%{opacity:.9;transform:translate(-3px,0);clip-path:inset(30% 0 44% 0)}
89%{opacity:.9;transform:translate(5px,0);clip-path:inset(76% 0 4% 0)}
92%{opacity:0}}
@keyframes nf-b{
0%,78%,100%{opacity:0;transform:none;clip-path:none}
80%{opacity:.9;transform:translate(6px,0);clip-path:inset(40% 0 38% 0)}
83%{opacity:.9;transform:translate(-8px,0);clip-path:inset(4% 0 80% 0)}
86%{opacity:.9;transform:translate(4px,0);clip-path:inset(66% 0 10% 0)}
89%{opacity:.9;transform:translate(-5px,0);clip-path:inset(22% 0 60% 0)}
92%{opacity:0}}
@keyframes nf-core{0%,79%,93%,100%{transform:none}81%{transform:translate(3px,0) skewX(-6deg)}85%{transform:translate(-2px,0)}88%{transform:translate(1px,0) skewX(4deg)}}
.nf-float{animation:nf-float 6s ease-in-out infinite}
@keyframes nf-float{50%{transform:translateY(-10px)}}
@keyframes nf-in{from{opacity:0;transform:translateY(14px);filter:blur(6px)}}
.nf-in{animation:nf-in .8s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion: reduce){.nf-digit{transform:none;transition:none}.nf-glitch .nf-ghost-a,.nf-glitch .nf-ghost-b,.nf-glitch .nf-core,.nf-float,.nf-in{animation:none}}
`;

/**
 * Drop-in 404 section. Fills its parent; put it in `app/not-found.tsx` inside a
 * `min-h-screen` wrapper, or any sized box.
 */
export function NotFound({
  code = "404",
  title = "This page drifted off",
  message = "The link might be broken, or the page moved somewhere new. Let's get you back on track.",
  homeHref = "/",
  buttonLabel = "Back to home",
  glitch = true,
  parallax = 18,
  accent = "#f43f5e",
  className,
}: NotFoundProps) {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!parallax) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--nf-x", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    e.currentTarget.style.setProperty("--nf-y", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--nf-x", "0");
    e.currentTarget.style.setProperty("--nf-y", "0");
  };

  const titleId = useId();
  const digits = code.split("");
  // Outer digits drift more than inner ones, alternating direction for depth.
  const depth = (i: number) => {
    const mid = (digits.length - 1) / 2;
    return parallax * (0.5 + Math.abs(i - mid) / Math.max(mid, 1)) * (i % 2 ? -1 : 1);
  };

  return (
    <section
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-labelledby={titleId}
      className={`relative flex size-full min-h-[24rem] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center ${className ?? ""}`}
      style={{ ["--nf-accent" as string]: accent }}
    >
      <style href="not-found" precedence="default">
        {css}
      </style>

      {/* Backdrop: fading grid + accent glow that also drifts with the pointer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 45%, #000 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="nf-digit pointer-events-none absolute left-1/2 top-[42%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ ["--d" as string]: -parallax * 0.8, background: `radial-gradient(circle, color-mix(in oklab, ${accent} 30%, transparent), transparent 65%)`, filter: "blur(20px)" }}
      />

      <p className="sr-only">Error {code}</p>
      <div aria-hidden className={`nf-float relative flex select-none ${glitch ? "nf-glitch" : ""}`}>
        {digits.map((d, i) => (
          <span key={i} className="nf-digit relative block" style={{ ["--d" as string]: depth(i) }}>
            <span
              className="nf-core block bg-clip-text font-black leading-none tracking-tighter text-transparent"
              style={{
                fontSize: "clamp(6rem, 22vw, 13rem)",
                backgroundImage: "linear-gradient(to bottom, var(--foreground) 35%, color-mix(in oklab, var(--foreground) 15%, transparent))",
                animationDelay: `${i * 0.04}s`,
              }}
            >
              {d}
            </span>
            <span className="nf-ghost nf-ghost-a font-black leading-none tracking-tighter" style={{ fontSize: "clamp(6rem, 22vw, 13rem)", animationDelay: `${i * 0.04}s` }}>
              {d}
            </span>
            <span className="nf-ghost nf-ghost-b font-black leading-none tracking-tighter" style={{ fontSize: "clamp(6rem, 22vw, 13rem)", animationDelay: `${i * 0.04}s` }}>
              {d}
            </span>
          </span>
        ))}
      </div>

      <h1 id={titleId} className="nf-in relative mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ animationDelay: ".1s" }}>
        {title}
      </h1>
      <p className="nf-in relative mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base" style={{ animationDelay: ".2s" }}>
        {message}
      </p>
      <a
        href={homeHref}
        className="nf-in group relative mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ animationDelay: ".3s" }}
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
        {buttonLabel}
      </a>
    </section>
  );
}
