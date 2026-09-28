"use client";

import { Cubes } from "./cubes";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Cubes {...p} className="w-[min(21rem,80vw)]" />
      <p className="text-xs text-muted-foreground">Hover to tilt · click to send a ripple</p>
    </div>
  );
}
