"use client";

import { demoImages } from "../../demo-kit";
import { PhotoFan } from "./photo-fan";

const images = demoImages(5, 400, 500);

export default function Demo(p: Record<string, unknown>) {
  return <PhotoFan images={images} {...p} />;
}
