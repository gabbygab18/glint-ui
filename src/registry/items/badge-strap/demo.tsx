"use client";

import { demoImages } from "../../demo-kit";
import { BadgeStrap } from "./badge-strap";

const [photo] = demoImages(1, 300, 300);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <BadgeStrap image={photo} {...p} />
    </div>
  );
}
