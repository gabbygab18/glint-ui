"use client";

import { demoImages } from "../../demo-kit";
import { PanoramaSphere } from "./panorama-sphere";

const images = demoImages(14, 400, 400);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <PanoramaSphere images={images} {...p} />
    </div>
  );
}
