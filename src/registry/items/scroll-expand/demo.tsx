"use client";

import { useRef } from "react";
import { demoImages } from "../../demo-kit";
import { ScrollExpand } from "./scroll-expand";

const [img] = demoImages(1, 1600, 1000);

export default function Demo(p: Record<string, unknown>) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div ref={box} className="absolute inset-0 overflow-y-auto overscroll-contain">
      <ScrollExpand src={img} alt="Snowy mountain ridge" {...p} scrollContainerRef={box}>
        <div className="max-w-md text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Chapter one</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">Twelve miles of pines, one cabin and the quiet in between.</p>
        </div>
      </ScrollExpand>
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">The end</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Scroll back up to shrink it again.</p>
      </div>
    </div>
  );
}
