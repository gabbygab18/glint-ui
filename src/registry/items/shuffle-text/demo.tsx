"use client";

import { ShuffleText } from "./shuffle-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6">
      <ShuffleText
        text=""
        {...p}
        className="text-5xl font-black uppercase leading-none tracking-tight text-foreground sm:text-7xl"
      />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Hover to spin again</p>
    </div>
  );
}
