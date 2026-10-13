"use client";

import { demoImages } from "../../demo-kit";
import { HelixCards } from "./helix-cards";

const images = demoImages(14, 400, 272);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <HelixCards images={images} {...p} />
    </div>
  );
}
