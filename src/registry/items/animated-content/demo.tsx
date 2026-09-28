"use client";

import { useRef } from "react";
import { AnimatedContent } from "./animated-content";

const features = [
  { title: "Ship faster", body: "Drop-in pieces that already look finished.", tint: "from-lime-300 to-emerald-500" },
  { title: "Own the code", body: "Copy it in, change anything, no runtime to fight.", tint: "from-cyan-300 to-blue-600" },
  { title: "Motion by default", body: "Every reveal is tuned to feel calm, not busy.", tint: "from-violet-300 to-fuchsia-600" },
  { title: "Themeable", body: "Built on tokens, so light and dark just work.", tint: "from-amber-200 to-orange-500" },
  { title: "Accessible", body: "Reduced motion is respected everywhere.", tint: "from-rose-300 to-pink-600" },
];

export default function Demo(p: Record<string, unknown>) {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div
      key={JSON.stringify(p)}
      ref={scroller}
      className="relative h-[26rem] w-[min(32rem,100%)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/60 p-6 [scrollbar-width:thin]"
    >
      <AnimatedContent {...p} scrollContainerRef={scroller}>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Scroll inside ↓</p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Animated Content</h3>
      </AnimatedContent>
      <div className="mt-6 space-y-4">
        {features.map((f) => (
          <AnimatedContent key={f.title} {...p} scrollContainerRef={scroller}>
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <div className={`size-12 shrink-0 rounded-xl bg-gradient-to-br ${f.tint}`} />
              <div>
                <h4 className="font-semibold text-foreground">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            </div>
          </AnimatedContent>
        ))}
        <AnimatedContent {...p} scrollContainerRef={scroller}>
          <div className="rounded-2xl bg-gradient-to-br from-lime-300 to-cyan-400 p-6 text-center text-lg font-semibold text-black">
            You made it to the end.
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
}
