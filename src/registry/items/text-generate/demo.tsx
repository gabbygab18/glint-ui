"use client";

import { TextGenerate } from "./text-generate";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-2xl px-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-5 rounded-full bg-gradient-to-br from-lime-300 to-cyan-400" />
        Assistant
      </div>
      <TextGenerate
        text=""
        {...p}
        className="text-2xl leading-relaxed font-medium tracking-tight text-foreground sm:text-3xl sm:leading-snug"
      />
    </div>
  );
}
