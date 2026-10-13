"use client";

import { CurrentTrace } from "./current-trace";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <CurrentTrace {...p} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Voltra Systems</p>
    </div>
  );
}
