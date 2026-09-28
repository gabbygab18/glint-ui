"use client";

import { Typewriter } from "./typewriter";

export default function Demo(p: Record<string, unknown>) {
  return <Typewriter words={[]} {...p} className="font-mono text-3xl text-foreground" />;
}
