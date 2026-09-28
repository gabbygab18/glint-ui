"use client";

import { Title } from "../../demo-kit";
import { ColorBends } from "./color-bends";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ColorBends {...p} />
      <Title>Color Bends</Title>
    </>
  );
}
