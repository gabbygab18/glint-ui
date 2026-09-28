"use client";

import { HalftoneReveal } from "./halftone-reveal";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="relative w-full max-w-3xl">
      <HalftoneReveal
        src="https://picsum.photos/seed/glint-2/1400/900"
        {...p}
        className="h-[24rem] w-full rounded-3xl border border-border bg-black"
      />
      <p className="pointer-events-none mt-3 text-center text-sm text-muted-foreground">Hover the image to develop it</p>
    </div>
  );
}
