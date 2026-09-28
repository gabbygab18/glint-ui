"use client";

import { LayeredText } from "./layered-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <LayeredText text="" {...p} className="px-4 text-center text-6xl font-black tracking-tight text-foreground sm:text-8xl" />
  );
}
