"use client";

import { GlintBot } from "./glint-bot";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-3">
      <GlintBot {...p} />
      <p className="text-xs text-muted-foreground">Click to boop · drag side to side to pet · poke five times fast</p>
    </div>
  );
}
