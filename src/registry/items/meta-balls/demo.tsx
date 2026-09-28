"use client";

import { MetaBalls } from "./meta-balls";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <MetaBalls {...p} />
      <p className="pointer-events-none relative z-10 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
        Meta Balls
      </p>
    </div>
  );
}
