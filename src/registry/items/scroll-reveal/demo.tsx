"use client";

import { useRef } from "react";
import { ScrollReveal } from "./scroll-reveal";

export default function Demo(p: Record<string, unknown>) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={box}
      className="relative h-[26rem] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/40 px-8 [scrollbar-width:thin]"
    >
      <div className="flex h-60 flex-col items-center justify-end gap-2 pb-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Scroll inside
        <span className="animate-bounce">↓</span>
      </div>
      <ScrollReveal
        text=""
        {...p}
        scrollContainerRef={box}
        className="text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl"
      />
      <div className="h-96" />
    </div>
  );
}
