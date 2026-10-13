"use client";

import { TapBurst } from "./tap-burst";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TapBurst {...p} className="absolute inset-0 grid place-items-center">
      <p className="select-none text-sm text-muted-foreground">Click anywhere</p>
    </TapBurst>
  );
}
