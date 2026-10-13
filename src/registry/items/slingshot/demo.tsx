"use client";

import { useState } from "react";
import { Slingshot } from "./slingshot";

export default function Demo(p: Record<string, unknown>) {
  const [fired, setFired] = useState(0);
  return (
    <div className="flex flex-col items-center gap-6">
      <Slingshot {...p} onClick={() => setFired((n) => n + 1)}>
        Pull &amp; release
      </Slingshot>
      <p className="text-xs text-muted-foreground">
        Drag it back and let go, or just click. Fired {fired} {fired === 1 ? "time" : "times"}.
      </p>
    </div>
  );
}
