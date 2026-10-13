"use client";

import { LineRoll } from "./line-roll";

export default function Demo(p: Record<string, unknown>) {
  return (
    <p className="flex items-center gap-[0.28em] text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
      <span>Made for</span>
      <LineRoll items={[]} {...p} className="text-lime-300" />
    </p>
  );
}
