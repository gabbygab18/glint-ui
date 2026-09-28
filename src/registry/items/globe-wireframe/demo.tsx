"use client";

import { GlobeWireframe } from "./globe-wireframe";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full flex-col items-center px-4 py-4">
      <GlobeWireframe className="max-w-[460px]" {...p} />
      <p className="-mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">Scanning · drag to spin</p>
    </div>
  );
}
