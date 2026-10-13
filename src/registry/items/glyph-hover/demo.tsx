"use client";

import { GlyphHover } from "./glyph-hover";

export default function Demo(p: Record<string, unknown>) {
  return (
    <GlyphHover
      {...p}
      className="max-w-3xl px-6 font-mono text-2xl leading-relaxed text-foreground sm:text-3xl"
    />
  );
}
