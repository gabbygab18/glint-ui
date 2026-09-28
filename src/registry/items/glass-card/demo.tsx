"use client";

import { Heart, Pause, SkipBack, SkipForward } from "lucide-react";
import { demoImages } from "../../demo-kit";
import { GlassCard } from "./glass-card";

const css = `
@keyframes glass-demo-a{50%{transform:translate(90px,60px) scale(1.15)}}
@keyframes glass-demo-b{50%{transform:translate(-110px,-40px) scale(.9)}}
@keyframes glass-demo-c{50%{transform:translate(60px,-80px) scale(1.2)}}
@media (prefers-reduced-motion: reduce){.glass-demo-blob{animation:none!important}}
`;

const blobs = [
  { c: "#f43f5e", s: 300, l: "18%", t: "12%", a: "glass-demo-a 14s" },
  { c: "#8b5cf6", s: 360, l: "55%", t: "40%", a: "glass-demo-b 17s" },
  { c: "#06b6d4", s: 260, l: "30%", t: "58%", a: "glass-demo-c 12s" },
  { c: "#f59e0b", s: 200, l: "62%", t: "4%", a: "glass-demo-a 19s reverse" },
];

const cover = demoImages(24, 400, 400)[17];

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <style href="glass-card-demo" precedence="default">
        {css}
      </style>
      <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#0b0718]">
        {blobs.map((b) => (
          <div
            key={b.c}
            className="glass-demo-blob absolute rounded-full"
            style={{
              width: b.s,
              height: b.s,
              left: b.l,
              top: b.t,
              background: b.c,
              filter: "blur(40px)",
              opacity: 0.85,
              animation: `${b.a} ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <GlassCard {...p} className="w-[24rem] max-w-full">
        <div className="p-6">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            <span>Now playing</span>
            <button type="button" aria-label="Like" className="rounded-full p-1 text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
              <Heart className="size-4 fill-current" aria-hidden />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Album cover" className="size-24 shrink-0 rounded-2xl object-cover shadow-2xl" />
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold tracking-tight">Midnight Transit</h3>
              <p className="truncate text-sm text-white/65">Aurelia Vance</p>
              <p className="mt-2 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/80">Lossless · 24-bit</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[38%] rounded-full bg-white" />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-white/55">
              <span>1:24</span>
              <span>3:41</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button type="button" aria-label="Previous" className="rounded-full p-2 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
              <SkipBack className="size-5 fill-current" aria-hidden />
            </button>
            <button type="button" aria-label="Pause" className="grid size-12 place-items-center rounded-full bg-white text-black transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
              <Pause className="size-5 fill-current" aria-hidden />
            </button>
            <button type="button" aria-label="Next" className="rounded-full p-2 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
              <SkipForward className="size-5 fill-current" aria-hidden />
            </button>
          </div>
        </div>
      </GlassCard>
    </>
  );
}
