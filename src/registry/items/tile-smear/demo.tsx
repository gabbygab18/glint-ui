"use client";

import { demoImages, Title } from "../../demo-kit";
import { TileSmear } from "./tile-smear";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <TileSmear imageSrc={demoImages(1, 1600, 1000)[0]} {...p} />
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
      <Title>Tile Smear</Title>
    </>
  );
}
