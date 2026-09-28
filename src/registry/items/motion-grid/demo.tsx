"use client";

import { MotionGrid } from "./motion-grid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-2xl text-center">
      <MotionGrid {...p} className="w-full" />
      <p className="pointer-events-none mt-5 text-sm text-muted-foreground">Click any tile to send a wave</p>
    </div>
  );
}
