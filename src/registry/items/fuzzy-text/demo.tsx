"use client";

import { FuzzyText } from "./fuzzy-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6">
      <FuzzyText {...p} />
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Signal lost, hover to interfere</p>
    </div>
  );
}
