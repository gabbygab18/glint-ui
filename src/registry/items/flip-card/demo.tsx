"use client";

import { FlipCard } from "./flip-card";

export default function Demo(p: Record<string, unknown>) {
  return <FlipCard key={String(p.defaultFlipped)} {...p} />;
}
