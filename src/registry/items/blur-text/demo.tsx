"use client";

import { BlurText } from "./blur-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <BlurText
      {...p}
      className="max-w-3xl px-6 text-center text-5xl font-semibold tracking-tight text-foreground sm:text-7xl"
    />
  );
}
