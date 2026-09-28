"use client";

import { TextCursor } from "./text-cursor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TextCursor {...p} className="absolute inset-0 grid cursor-crosshair place-items-center">
      <div className="pointer-events-none text-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Leave a trail</p>
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Move your pointer anywhere here</p>
      </div>
    </TextCursor>
  );
}
