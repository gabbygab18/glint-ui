"use client";

import { ArcMarquee } from "./arc-marquee";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <ArcMarquee {...p} className="text-foreground font-semibold uppercase tracking-tight" />
    </div>
  );
}
