"use client";

import { HudType } from "./hud-type";

export default function Demo(p: Record<string, unknown>) {
  return (
    <HudType
      text=""
      {...p}
      className="font-mono text-4xl font-semibold uppercase tracking-tight text-foreground sm:text-6xl"
    />
  );
}
