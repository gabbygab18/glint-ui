"use client";

import { Noise } from "./noise";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        background:
          "radial-gradient(60% 70% at 20% 20%, #4c1d95 0%, transparent 60%), radial-gradient(50% 60% at 85% 30%, #0e7490 0%, transparent 60%), radial-gradient(70% 60% at 60% 100%, #c2410c 0%, transparent 65%), #09090b",
      }}
    >
      <div className="relative z-0 text-center">
        <p className="text-xs font-medium tracking-[0.3em] text-white/60 uppercase">Vol. 04 / Analog</p>
        <p className="mt-3 text-5xl font-semibold tracking-tight text-white sm:text-7xl">Noise</p>
        <p className="mt-3 text-sm text-white/70">Grain that makes gradients feel like film.</p>
      </div>
      <Noise {...p} className="z-10" />
    </div>
  );
}
