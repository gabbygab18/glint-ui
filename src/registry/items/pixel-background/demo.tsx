"use client";

import { Title } from "../../demo-kit";
import { PixelBackground } from "./pixel-background";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PixelBackground {...p} />
      <Title>Pixel Background</Title>
    </>
  );
}
