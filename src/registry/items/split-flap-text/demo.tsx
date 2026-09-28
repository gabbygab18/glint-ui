"use client";

import { SplitFlapText } from "./split-flap-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card/60 px-6 py-7 shadow-2xl sm:px-10">
      <div className="flex w-full items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <span>Flight GL 208</span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
          Gate 12
        </span>
      </div>
      <SplitFlapText words={[]} {...p} className="text-3xl sm:text-5xl" />
    </div>
  );
}
