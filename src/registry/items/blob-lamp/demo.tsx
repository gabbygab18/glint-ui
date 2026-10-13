"use client";

import { BlobLamp } from "./blob-lamp";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <BlobLamp {...p} />
      <p className="pointer-events-none relative z-10 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
        Blob Lamp
      </p>
    </div>
  );
}
