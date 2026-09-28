"use client";

import { GlowBorder } from "./glow-border";

export default function Demo(p: Record<string, unknown>) {
  return (
    <GlowBorder {...p}>
      <span className="block px-8 py-4 text-sm font-medium text-foreground">Get started</span>
    </GlowBorder>
  );
}
