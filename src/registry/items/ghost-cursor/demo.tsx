"use client";

import { GhostCursor } from "./ghost-cursor";

export default function Demo(p: Record<string, unknown>) {
  return (
    <GhostCursor
      {...p}
      className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.12),transparent_60%)]"
    >
      <div className="pointer-events-none select-none text-center">
        <p className="text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">Ghost Cursor</p>
        <p className="mt-3 text-sm text-muted-foreground">Move fast. Leave echoes.</p>
      </div>
    </GhostCursor>
  );
}
