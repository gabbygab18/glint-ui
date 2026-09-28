"use client";

import { GlitchText } from "./glitch-text";

export default function Demo(p: Record<string, unknown>) {
  return <GlitchText text="" {...p} className="text-5xl font-black tracking-tight text-foreground sm:text-7xl" />;
}
