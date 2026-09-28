"use client";

import { MorphText } from "./morph-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 text-center">
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Your next idea</p>
      <MorphText words={[]} {...p} className="text-6xl font-bold tracking-tight text-lime-300 sm:text-8xl" />
    </div>
  );
}
