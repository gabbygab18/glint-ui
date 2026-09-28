"use client";

import { demoImages } from "../../demo-kit";
import { ImageTrail } from "./image-trail";

const images = demoImages(10, 400, 520);

export default function Demo(p: Record<string, unknown>) {
  return (
    <ImageTrail images={images} {...p} className="absolute inset-0 grid place-items-center">
      <div className="pointer-events-none relative z-10 text-center mix-blend-difference">
        <p className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">Image Trail</p>
        <p className="mt-2 text-sm text-white/70">Move your cursor around</p>
      </div>
    </ImageTrail>
  );
}
