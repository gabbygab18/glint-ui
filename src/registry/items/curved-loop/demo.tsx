"use client";

import { CurvedLoop } from "./curved-loop";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <CurvedLoop {...p} className="text-foreground font-semibold uppercase tracking-tight" />
    </div>
  );
}
