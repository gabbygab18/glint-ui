"use client";

import { BracketFocus } from "./bracket-focus";

export default function Demo(p: Record<string, unknown>) {
  return (
    <BracketFocus
      text=""
      {...p}
      className="max-w-3xl font-display text-5xl font-black uppercase tracking-tight text-foreground sm:text-7xl"
    />
  );
}
