"use client";

import { demoImages } from "../../demo-kit";
import { RevealText } from "./reveal-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 text-center">
      <RevealText
        text=""
        image={demoImages(8, 1200, 600)[7]}
        {...p}
        className="text-7xl font-black tracking-tighter text-foreground sm:text-9xl"
      />
      <p className="text-sm text-muted-foreground">Hover the word</p>
    </div>
  );
}
