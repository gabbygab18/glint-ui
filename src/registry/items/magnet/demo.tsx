"use client";

import { Magnet } from "./magnet";

export default function Demo(p: Record<string, unknown>) {
  return (
    <Magnet {...p}>
      <span className="block rounded-full border border-border bg-card px-6 py-3 text-sm text-foreground">
        Hover near me
      </span>
    </Magnet>
  );
}
