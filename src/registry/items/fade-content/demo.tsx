"use client";

import { useRef } from "react";
import { demoImages } from "../../demo-kit";
import { FadeContent } from "./fade-content";

const photos = demoImages(6, 500, 620);
const captions = ["Morning light", "Salt & stone", "Quiet roads", "Low tide", "Field notes", "Last ferry"];

export default function Demo(p: Record<string, unknown>) {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div
      key={JSON.stringify(p)}
      ref={scroller}
      className="relative h-[26rem] w-[min(36rem,100%)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/60 p-6 [scrollbar-width:thin]"
    >
      <FadeContent {...p} scrollContainerRef={scroller}>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Scroll inside ↓</p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Fade Content</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          A small journal of places. Each frame pulls into focus as it arrives.
        </p>
      </FadeContent>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {photos.map((src, i) => (
          <FadeContent key={src} {...p} scrollContainerRef={scroller}>
            <figure className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[4/5] bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                0{i + 1} · {captions[i]}
              </figcaption>
            </figure>
          </FadeContent>
        ))}
      </div>
    </div>
  );
}
