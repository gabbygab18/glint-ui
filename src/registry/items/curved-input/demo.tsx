"use client";

import { CurvedInput } from "./curved-input";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium uppercase tracking-[.25em] text-muted-foreground">Click to type</p>
      <CurvedInput {...p} />
    </div>
  );
}
