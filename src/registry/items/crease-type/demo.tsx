"use client";

import { CreaseType } from "./crease-type";

export default function Demo(p: Record<string, unknown>) {
  return (
    <CreaseType
      {...p}
      className="text-center text-6xl leading-[0.95] font-black tracking-tight text-foreground uppercase sm:text-8xl"
    />
  );
}
