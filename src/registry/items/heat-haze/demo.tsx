"use client";

import { HeatHaze } from "./heat-haze";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6">
      <HeatHaze
        text=""
        {...p}
        className="font-display text-7xl font-black uppercase tracking-tight text-foreground sm:text-9xl"
      />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Hover to warp</p>
    </div>
  );
}
