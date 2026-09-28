"use client";

import { Title } from "../../demo-kit";
import { PixelSnow } from "./pixel-snow";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PixelSnow {...p} />
      <Title>Pixel Snow</Title>
    </>
  );
}
