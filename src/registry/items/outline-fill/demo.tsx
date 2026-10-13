"use client";

import { OutlineFill } from "./outline-fill";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-6">
      <OutlineFill text="" {...p} className="font-sans text-7xl font-bold uppercase tracking-tight sm:text-9xl" />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {p.trigger === "hover" ? "Hover to fill" : "Draws on view"}
      </p>
    </div>
  );
}
