"use client";

import { MetallicPaint } from "./metallic-paint";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="grid place-items-center">
      <MetallicPaint {...p} className="size-[min(72vmin,24rem)]" />
    </div>
  );
}
