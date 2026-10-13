"use client";

import { WordPile } from "./word-pile";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <WordPile {...p} className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl" />
    </div>
  );
}
