"use client";

import { UnblurHeading } from "./unblur-heading";

export default function Demo(p: Record<string, unknown>) {
  return (
    <UnblurHeading
      {...p}
      className="max-w-3xl px-6 text-center text-5xl font-semibold tracking-tight text-foreground sm:text-7xl"
    />
  );
}
