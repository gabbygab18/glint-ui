"use client";

import { ModelViewer } from "./model-viewer";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <div className="absolute inset-0">
        <ModelViewer {...p} />
      </div>
      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        Drag to orbit · scroll to zoom
      </p>
    </>
  );
}
