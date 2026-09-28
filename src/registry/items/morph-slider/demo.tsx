"use client";

import { MorphSlider } from "./morph-slider";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-[min(26rem,90vw)] rounded-2xl border border-border bg-card px-6 pb-2 pt-5">
      <p className="text-sm font-medium text-foreground">Brightness</p>
      <p className="text-xs text-muted-foreground">Drag fast and watch the thumb stretch.</p>
      <MorphSlider label="Brightness" {...p} />
    </div>
  );
}
