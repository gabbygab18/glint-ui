"use client";

import { Facescape } from "./facescape";

// Facescape listens to its parent element, so it sits directly in the stage.
export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,209,102,.16), transparent 55%)" }}
      />
      <Facescape {...p} />
      <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Come closer · click to boop
      </p>
    </>
  );
}
