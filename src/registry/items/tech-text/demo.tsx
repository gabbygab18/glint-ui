"use client";

import { TechText } from "./tech-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TechText
      text=""
      {...p}
      className="font-mono text-4xl font-semibold uppercase tracking-tight text-foreground sm:text-6xl"
    />
  );
}
