"use client";

import { FocusOutline } from "./focus-outline";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <FocusOutline {...p} />
      <p className="pointer-events-none relative z-10 text-sm uppercase tracking-[0.3em] text-muted-foreground">Focus</p>
    </>
  );
}
