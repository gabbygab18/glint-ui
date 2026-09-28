"use client";

import { StaggerChars } from "./stagger-chars";

export default function Demo(p: Record<string, unknown>) {
  return (
    <StaggerChars text="" {...p} className="px-4 text-center text-5xl font-bold tracking-tight text-foreground sm:text-7xl" />
  );
}
