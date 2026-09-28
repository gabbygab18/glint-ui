"use client";

import { TextLoop } from "./text-loop";

export default function Demo(p: Record<string, unknown>) {
  return (
    <p className="flex items-center gap-[0.28em] text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
      <span>Made for</span>
      <TextLoop items={[]} {...p} className="text-lime-300" />
    </p>
  );
}
