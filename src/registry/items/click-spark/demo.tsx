"use client";

import { ClickSpark } from "./click-spark";

export default function Demo(p: Record<string, unknown>) {
  return (
    <ClickSpark {...p} className="absolute inset-0 grid place-items-center">
      <p className="select-none text-sm text-muted-foreground">Click anywhere</p>
    </ClickSpark>
  );
}
