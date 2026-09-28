"use client";

import { BlobCursor } from "./blob-cursor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <BlobCursor {...p} className="absolute inset-0 grid place-items-center">
      <div className="pointer-events-none select-none text-center">
        <p className="text-6xl font-black tracking-tighter text-foreground sm:text-8xl">Blob Cursor</p>
        <p className="mt-3 text-sm text-muted-foreground">Move around. Stop. Watch it settle.</p>
      </div>
    </BlobCursor>
  );
}
