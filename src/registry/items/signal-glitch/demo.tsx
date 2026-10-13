"use client";

import { SignalGlitch } from "./signal-glitch";

export default function Demo(p: Record<string, unknown>) {
  return <SignalGlitch text="" {...p} className="text-5xl font-black tracking-tight text-foreground sm:text-7xl" />;
}
