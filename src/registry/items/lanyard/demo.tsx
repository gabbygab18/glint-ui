"use client";

import { demoImages } from "../../demo-kit";
import { Lanyard } from "./lanyard";

const [photo] = demoImages(1, 300, 300);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <Lanyard image={photo} {...p} />
    </div>
  );
}
