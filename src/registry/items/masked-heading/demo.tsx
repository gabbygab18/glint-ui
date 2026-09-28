"use client";

import { MaskedHeading } from "./masked-heading";

export default function Demo(p: Record<string, unknown>) {
  return (
    <MaskedHeading
      {...p}
      className="px-6 text-center text-6xl leading-none font-black tracking-tighter text-foreground sm:text-8xl"
    />
  );
}
