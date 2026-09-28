"use client";

import { CountUp } from "./count-up";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="text-center">
      <CountUp to={0} {...p} className="text-6xl font-bold tracking-tight text-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">developers shipping</p>
    </div>
  );
}
