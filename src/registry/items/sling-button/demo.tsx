"use client";

import { useState } from "react";
import { SlingButton } from "./sling-button";

export default function Demo(p: Record<string, unknown>) {
  const [fired, setFired] = useState(0);
  return (
    <div className="flex flex-col items-center gap-6">
      <SlingButton {...p} onClick={() => setFired((n) => n + 1)}>
        Pull &amp; release
      </SlingButton>
      <p className="text-xs text-muted-foreground">
        Drag it back and let go, or just click. Fired {fired} {fired === 1 ? "time" : "times"}.
      </p>
    </div>
  );
}
