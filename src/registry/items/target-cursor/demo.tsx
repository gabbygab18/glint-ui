"use client";

import { TargetCursor } from "./target-cursor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TargetCursor {...p} className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Lock on</p>
        <h2 data-cursor-target className="px-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Target Cursor
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {["Design", "Develop", "Ship it"].map((label) => (
            <button
              key={label}
              data-cursor-target
              className="rounded-full border border-border bg-card px-5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </TargetCursor>
  );
}
