"use client";

import { TrueFocus } from "./true-focus";

export default function Demo(p: Record<string, unknown>) {
  return (
    <TrueFocus
      text=""
      {...p}
      className="max-w-3xl font-display text-5xl font-black uppercase tracking-tight text-foreground sm:text-7xl"
    />
  );
}
