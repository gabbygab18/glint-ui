"use client";

import { MaskWipe } from "./mask-wipe";

export default function Demo(p: Record<string, unknown>) {
  return (
    <MaskWipe
      {...p}
      className="px-6 text-center text-6xl leading-none font-black tracking-tighter text-foreground sm:text-8xl"
    />
  );
}
