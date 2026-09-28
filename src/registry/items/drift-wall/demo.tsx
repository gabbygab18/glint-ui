"use client";

import { demoImages } from "../../demo-kit";
import { DriftWall } from "./drift-wall";

const images = demoImages(18, 480, 600);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <DriftWall images={images} {...p} />
    </div>
  );
}
