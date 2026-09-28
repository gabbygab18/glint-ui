"use client";

import { demoImages } from "../../demo-kit";
import { InfiniteSpiral } from "./infinite-spiral";

const images = demoImages(14, 400, 272);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <InfiniteSpiral images={images} {...p} />
    </div>
  );
}
