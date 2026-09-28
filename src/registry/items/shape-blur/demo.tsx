"use client";

import { ShapeBlur } from "./shape-blur";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ShapeBlur {...p} />
      <p className="pointer-events-none relative z-10 text-sm uppercase tracking-[0.3em] text-muted-foreground">Focus</p>
    </>
  );
}
