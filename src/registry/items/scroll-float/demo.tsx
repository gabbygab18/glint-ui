"use client";

import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { ScrollFloat } from "./scroll-float";

export default function Demo(p: Record<string, unknown>) {
  const scroller = useRef<HTMLDivElement>(null);
  const cls = "px-6 text-center text-5xl leading-tight font-black tracking-tight text-foreground sm:text-7xl";
  return (
    <div
      ref={scroller}
      className="relative h-[24rem] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/40"
    >
      <div className="flex h-[15rem] flex-col items-center justify-center gap-3 text-sm tracking-[0.3em] text-muted-foreground uppercase">
        Scroll down
        <ArrowDown className="size-4 animate-bounce" />
      </div>
      <ScrollFloat {...p} scrollContainerRef={scroller} className={cls} />
      <div className="h-48" />
      <ScrollFloat {...p} text="Letters that rise" scrollContainerRef={scroller} className={`${cls} text-lime-300`} />
      <div className="h-[20rem]" />
    </div>
  );
}
