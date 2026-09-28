"use client";

import { Sparkles } from "lucide-react";
import { PixelCard } from "./pixel-card";

export default function Demo(p: Record<string, unknown>) {
  return (
    <PixelCard {...p}>
      <div className="pointer-events-none flex flex-col items-center gap-4 text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-border bg-background/70 text-foreground backdrop-blur transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110">
          <Sparkles className="size-6" />
        </span>
        <div>
          <p className="text-xl font-semibold tracking-tight text-foreground">Pixel Card</p>
          <p className="mt-1 text-sm text-muted-foreground">Hover or focus to light it up</p>
        </div>
      </div>
    </PixelCard>
  );
}
