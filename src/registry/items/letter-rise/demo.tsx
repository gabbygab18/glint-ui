"use client";

import { LetterRise } from "./letter-rise";

export default function Demo(p: Record<string, unknown>) {
  return (
    <LetterRise
      text=""
      {...p}
      className="max-w-xl text-center text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
    />
  );
}
