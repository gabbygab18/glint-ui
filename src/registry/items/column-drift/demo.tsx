"use client";

import { demoImages } from "../../demo-kit";
import { ColumnDrift } from "./column-drift";

const images = demoImages(18, 480, 600);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <ColumnDrift images={images} {...p} />
    </div>
  );
}
