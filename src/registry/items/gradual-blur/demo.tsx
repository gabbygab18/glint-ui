"use client";

import { demoImages } from "../../demo-kit";
import { GradualBlur } from "./gradual-blur";

const images = demoImages(10, 600, 480);
const captions = ["Coastline", "Night market", "Alpine", "Studio", "Harbor", "Desert road", "Greenhouse", "Rooftops", "Tidepools", "Old town"];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="relative h-[26rem] w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card">
      <div className="h-full overflow-y-auto p-5 [scrollbar-width:none]">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Field notes</p>
        <h2 className="mt-1 mb-5 text-2xl font-semibold tracking-tight text-foreground">Scroll the gallery</h2>
        <div className="grid grid-cols-2 gap-3">
          {images.map((src, i) => (
            <figure key={src} className="overflow-hidden rounded-2xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={captions[i]} className="aspect-[5/4] w-full object-cover" />
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">{captions[i]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <GradualBlur {...p} />
    </div>
  );
}
