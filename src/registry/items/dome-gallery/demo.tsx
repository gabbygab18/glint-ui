"use client";

import { demoImages } from "../../demo-kit";
import { DomeGallery } from "./dome-gallery";

const images = demoImages(14, 400, 400);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <DomeGallery images={images} {...p} />
    </div>
  );
}
