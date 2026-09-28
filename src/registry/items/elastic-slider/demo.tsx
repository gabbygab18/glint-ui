"use client";

import { ElasticSlider } from "./elastic-slider";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-80 rounded-3xl border border-border bg-card/80 px-6 pb-4 pt-6 shadow-2xl backdrop-blur">
      <p className="mb-4 text-sm font-medium text-muted-foreground">Drag past the ends</p>
      <ElasticSlider key={`${p.defaultValue}-${p.min}-${p.max}`} {...p} />
    </div>
  );
}
