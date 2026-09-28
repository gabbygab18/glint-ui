"use client";

import { demoImages } from "../../demo-kit";
import { RippleDistortion } from "./ripple-distortion";

const [img] = demoImages(1, 1400, 900);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="relative w-[min(44rem,100%)]">
      <RippleDistortion
        src={img}
        alt="Snowy mountain ridge"
        {...p}
        className="aspect-[16/10] w-full rounded-3xl shadow-2xl ring-1 ring-border"
      />
      <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur">
        Move your cursor across the water
      </span>
    </div>
  );
}
