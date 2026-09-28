"use client";

import { SplitText } from "./split-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <SplitText
      text=""
      {...p}
      className="max-w-xl text-center text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
    />
  );
}
