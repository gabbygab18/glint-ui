"use client";

import { GradientText } from "./gradient-text";

export default function Demo(p: Record<string, unknown>) {
  return <GradientText text="" {...p} className="text-5xl font-bold tracking-tight sm:text-6xl" />;
}
