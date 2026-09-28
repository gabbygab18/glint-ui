"use client";

import { FoldText } from "./fold-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <FoldText
      {...p}
      className="text-center text-6xl leading-[0.95] font-black tracking-tight text-foreground uppercase sm:text-8xl"
    />
  );
}
