"use client";

import { ReflectiveCard } from "./reflective-card";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      {/* Colored light behind the card so the glass finish has something to refract. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[calc(50%-14rem)] top-[calc(50%-9rem)] size-56 rounded-full bg-violet-500/35 blur-3xl" />
        <div className="absolute left-[calc(50%+2rem)] top-[calc(50%+1rem)] size-64 rounded-full bg-cyan-400/25 blur-3xl" />
      </div>
      <ReflectiveCard {...p}>
        <div className="flex size-full flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] opacity-80">Obsidian</span>
            <svg viewBox="0 0 24 24" className="size-6 opacity-70" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17" strokeLinecap="round" />
            </svg>
          </div>
          <div
            aria-hidden
            className="h-9 w-12 rounded-md border border-black/20"
            style={{ background: "linear-gradient(135deg,#f3e2a6,#b8954a 45%,#f6e7b4 60%,#9c7a37)", boxShadow: "inset 0 0 0 4px rgba(0,0,0,.08)" }}
          />
          <div>
            <p className="font-mono text-lg tracking-[0.18em] opacity-90">4821 0097 3310 2025</p>
            <div className="mt-2 flex items-end justify-between text-xs uppercase tracking-widest">
              <span className="opacity-80">Amelia R. Castell</span>
              <span className="opacity-60">09 / 29</span>
            </div>
          </div>
        </div>
      </ReflectiveCard>
    </>
  );
}
