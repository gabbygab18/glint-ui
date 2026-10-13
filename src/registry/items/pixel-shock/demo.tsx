"use client";

import { Title } from "../../demo-kit";
import { PixelShock } from "./pixel-shock";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PixelShock {...p} />
      <Title>Pixel Shock</Title>
    </>
  );
}
