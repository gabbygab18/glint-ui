"use client";

import { demoImages } from "../../demo-kit";
import { BounceCards } from "./bounce-cards";

const images = demoImages(5, 400, 500);

export default function Demo(p: Record<string, unknown>) {
  return <BounceCards images={images} {...p} />;
}
