"use client";

import { Title } from "../../demo-kit";
import { PixelBlast } from "./pixel-blast";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PixelBlast {...p} />
      <Title>Pixel Blast</Title>
    </>
  );
}
