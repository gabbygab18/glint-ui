"use client";

import { WordCycle } from "./word-cycle";

export default function Demo(p: Record<string, unknown>) {
  return (
    <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
      Ship <WordCycle words={[]} {...p} className="text-lime-300" />
    </p>
  );
}
