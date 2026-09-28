"use client";

import { MagicRings } from "./magic-rings";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <MagicRings {...p} />
      <div className="pointer-events-none relative z-10 text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Magic Rings</p>
        <p className="mt-1 text-xs text-muted-foreground">Move the cursor near them</p>
      </div>
    </div>
  );
}
