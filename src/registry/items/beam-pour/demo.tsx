"use client";

import { BeamPour } from "./beam-pour";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BeamPour {...p} />
      <div className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 text-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Beam Pour</p>
        <p className="mt-2 text-sm text-muted-foreground">Precision, poured into every pixel.</p>
      </div>
    </>
  );
}
