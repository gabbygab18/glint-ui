"use client";

import { Sparkles } from "lucide-react";
import { CircularText } from "./circular-text";

export default function Demo(p: Record<string, unknown>) {
  return (
    <CircularText {...p} className="font-semibold tracking-[0.2em] text-foreground">
      <span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-lime-300 to-cyan-400 text-black shadow-[0_0_60px_-10px] shadow-lime-300/60">
        <Sparkles className="size-8" strokeWidth={1.75} />
      </span>
    </CircularText>
  );
}
