"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ReflectiveFinish = "silver" | "gold" | "graphite" | "rose" | "glass";

export interface ReflectiveCardProps {
  children?: ReactNode;
  /** Surface material. */
  finish?: ReflectiveFinish;
  /** Max tilt in degrees. */
  maxTilt?: number;
  /** Brightness of the moving reflections, 0 to 1. */
  sheen?: number;
  /** Fine brushed-metal lines. */
  brushed?: boolean;
  className?: string;
}

// base gradient, text color, reflection tint
const FINISHES: Record<ReflectiveFinish, [string, string, string]> = {
  silver: ["linear-gradient(135deg,#8d9299 0%,#d9dde2 28%,#7b8087 52%,#c9ced4 76%,#6c7178 100%)", "#1d2127", "255,255,255"],
  gold: ["linear-gradient(135deg,#8a6a2f 0%,#e8cf8a 28%,#a07a34 52%,#f2dc9b 76%,#7a5a22 100%)", "#2b1d05", "255,244,214"],
  graphite: ["linear-gradient(135deg,#17181b 0%,#3a3d44 28%,#1b1c20 52%,#34373d 76%,#111214 100%)", "#e7e9ec", "210,220,235"],
  rose: ["linear-gradient(135deg,#9a6a63 0%,#efc9bf 28%,#a8756b 52%,#f3d2c9 76%,#8a5b54 100%)", "#2e1512", "255,236,230"],
  glass: ["linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.04) 45%,rgba(255,255,255,.1))", "#f5f7fa", "255,255,255"],
};

export function ReflectiveCard({
  children,
  finish = "silver",
  maxTilt = 10,
  sheen = 0.8,
  brushed = true,
  className,
}: ReflectiveCardProps) {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = card.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0.5, y: 0.35, h: 0 };
    const cur = { ...target };
    let raf = 0;

    const apply = () => {
      el.style.setProperty("--mx", cur.x.toFixed(4));
      el.style.setProperty("--my", cur.y.toFixed(4));
      el.style.setProperty("--mh", cur.h.toFixed(4));
      const t = reduce ? 0 : maxTilt;
      el.style.transform = `perspective(1000px) rotateX(${(0.5 - cur.y) * 2 * t}deg) rotateY(${(cur.x - 0.5) * 2 * t}deg) scale(${1 + cur.h * 0.02})`;
    };
    const tick = () => {
      let moving = false;
      for (const k of ["x", "y", "h"] as const) {
        const d = target[k] - cur[k];
        cur[k] += d * 0.14;
        if (Math.abs(d) > 0.0005) moving = true;
      }
      apply();
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      target.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      target.h = 1;
      kick();
    };
    const leave = () => {
      target.x = 0.5;
      target.y = 0.35;
      target.h = 0;
      kick();
    };
    // Keyboard focus inside the card lifts it like a hover.
    const focus = () => {
      target.h = 1;
      kick();
    };

    apply();
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focus);
    el.addEventListener("focusout", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focus);
      el.removeEventListener("focusout", leave);
    };
  }, [maxTilt]);

  const [base, ink, tint] = FINISHES[finish];
  const s = Math.max(0, Math.min(1, sheen));
  const glass = finish === "glass";

  return (
    <div
      ref={card}
      className={cn(
        "relative isolate aspect-[1.586] w-[22rem] max-w-full overflow-hidden rounded-[1.4rem] will-change-transform",
        glass && "backdrop-blur-xl",
        className,
      )}
      style={
        {
          background: base,
          color: ink,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,${glass ? 0.35 : 0.6}), inset 0 -1px 0 rgba(0,0,0,.35), 0 30px 60px -25px rgba(0,0,0,.75), 0 0 0 1px rgba(${tint},${glass ? 0.18 : 0.25})`,
        } as CSSProperties
      }
    >
      {brushed && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay"
          style={{
            opacity: glass ? 0.25 : 0.55,
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 1px, rgba(0,0,0,.12) 1px 2px, transparent 2px 4px), repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 13px, rgba(255,255,255,.06) 13px 29px)",
          }}
        />
      )}
      {/* Anisotropic streaks: broad light and dark bands along the brushing that roll with the pointer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light"
        style={{
          opacity: s,
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.4) 0%, rgba(${tint},.85) 16%, rgba(0,0,0,.45) 31%, rgba(${tint},.6) 47%, rgba(0,0,0,.35) 63%, rgba(${tint},.9) 80%, rgba(0,0,0,.4) 100%)`,
          backgroundSize: "300% 100%",
          backgroundPosition: "calc(var(--mx) * 100%) 0",
        }}
      />
      {/* Specular band that sweeps across as the angle changes. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
        style={{
          opacity: `calc(${s * 0.55} + var(--mh) * ${s * 0.45})`,
          backgroundImage: `linear-gradient(calc(100deg + var(--my) * 20deg), transparent 35%, rgba(${tint},.08) 42%, rgba(${tint},.65) 49%, rgba(${tint},.12) 54%, transparent 62%)`,
          backgroundSize: "260% 100%",
          backgroundPosition: "calc(100% - var(--mx) * 100%) 0",
        }}
      />
      {/* Hotspot directly under the light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay"
        style={{
          opacity: `calc(var(--mh) * ${s})`,
          background: `radial-gradient(40% 55% at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgba(${tint},.9), transparent 70%)`,
        }}
      />
      <div className="relative size-full [text-shadow:0_1px_0_rgba(255,255,255,.25),0_-1px_0_rgba(0,0,0,.25)]">{children}</div>
    </div>
  );
}
