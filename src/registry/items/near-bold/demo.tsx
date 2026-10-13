"use client";

import { NearBold } from "./near-bold";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center px-8">
      <NearBold
        text=""
        {...p}
        className="max-w-3xl text-center font-display text-4xl leading-tight tracking-tight text-foreground sm:text-6xl"
      />
    </div>
  );
}
