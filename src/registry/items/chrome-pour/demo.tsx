"use client";

import { ChromePour } from "./chrome-pour";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid place-items-center">
      <ChromePour {...p} className="size-[min(72vmin,24rem)]" />
    </div>
  );
}
