"use client";

import { demoImages } from "../../demo-kit";
import { AspectRatio } from "./aspect-ratio";

const [photo] = demoImages(1, 1200, 800);

export default function Demo(p: Record<string, unknown>) {
  return (
    <figure className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <AspectRatio src={photo} {...p} alt="Sample landscape photograph" />
      <figcaption className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Field notes, vol. 3</p>
          <p className="text-xs text-muted-foreground">Shot on 35mm, scanned at 4K</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {Number(p.ratio ?? 16 / 9).toFixed(2)}:1
        </span>
      </figcaption>
    </figure>
  );
}
