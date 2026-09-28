"use client";

import { FallingText } from "./falling-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <FallingText {...p} className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl" />
    </div>
  );
}
