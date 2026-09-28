"use client";

import { demoImages, Title } from "../../demo-kit";
import { GridDistortion } from "./grid-distortion";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GridDistortion imageSrc={demoImages(1, 1600, 1000)[0]} {...p} />
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
      <Title>Grid Distortion</Title>
    </>
  );
}
