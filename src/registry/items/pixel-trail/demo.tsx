"use client";

import { Title } from "../../demo-kit";
import { PixelTrail } from "./pixel-trail";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PixelTrail {...p} />
      <Title>Pixel Trail</Title>
    </>
  );
}
