"use client";

import { TextPressure } from "./text-pressure";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-8">
      <TextPressure text="" {...p} className="max-w-5xl font-display text-7xl uppercase text-foreground sm:text-9xl" />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Press in with your cursor</p>
    </div>
  );
}
