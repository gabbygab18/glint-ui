"use client";

import { Title } from "../../demo-kit";
import { ShapeWaves } from "./shape-waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ShapeWaves {...p} />
      <Title>Shape Waves</Title>
    </>
  );
}
