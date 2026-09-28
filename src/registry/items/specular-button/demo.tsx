"use client";

import { SpecularButton } from "./specular-button";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="relative grid place-items-center">
      {/* Colorful shapes behind the glass so the blur and gloss have something to bend. */}
      <div aria-hidden className="absolute size-28 -translate-x-20 -translate-y-3 rounded-full bg-fuchsia-500/80 blur-sm" />
      <div aria-hidden className="absolute size-24 translate-x-24 translate-y-4 rounded-full bg-cyan-400/80 blur-sm" />
      <div aria-hidden className="absolute h-3 w-72 rotate-[-8deg] rounded-full bg-amber-300/80" />
      <SpecularButton {...p}>Continue</SpecularButton>
    </div>
  );
}
