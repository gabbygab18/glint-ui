"use client";

import { Tally } from "./tally";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="text-center">
      <Tally to={0} {...p} className="text-6xl font-bold tracking-tight text-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">developers shipping</p>
    </div>
  );
}
