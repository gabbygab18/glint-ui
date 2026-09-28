"use client";

import { demoImages } from "../../demo-kit";
import { DitherVeil } from "./dither-veil";

const [photo] = demoImages(1, 1600, 1000);

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DitherVeil {...p} className="absolute inset-0">
        <div className="absolute inset-0 bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
        <div className="absolute inset-0 grid place-items-center bg-black/30">
          <p className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">Hidden in plain sight</p>
        </div>
      </DitherVeil>
      <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 font-mono text-xs text-white">
        Move to dissolve the veil
      </p>
    </>
  );
}
