"use client";

import { demoImages } from "../../demo-kit";
import { PosterStream } from "./poster-stream";

const images = demoImages(12, 440, 616);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <PosterStream images={images} {...p} />
      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Scroll or drag
      </p>
    </div>
  );
}
