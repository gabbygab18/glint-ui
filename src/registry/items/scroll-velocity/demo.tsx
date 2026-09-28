"use client";

import { useRef } from "react";
import { ScrollVelocity } from "./scroll-velocity";

export default function Demo(p: Record<string, unknown>) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div ref={box} className="relative h-[26rem] w-full overflow-y-auto overscroll-contain [scrollbar-width:none]">
      <div className="h-[400%]">
        <div className="sticky top-0 flex h-[26rem] flex-col justify-center">
          <ScrollVelocity
            texts={[]}
            {...p}
            scrollContainerRef={box}
            className="text-6xl font-black uppercase tracking-tight text-foreground sm:text-7xl"
          />
          <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Scroll inside to speed up · reverse to flip
          </p>
        </div>
      </div>
    </div>
  );
}
