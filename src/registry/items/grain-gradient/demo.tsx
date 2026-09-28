"use client";

import { Title } from "../../demo-kit";
import { GrainGradient } from "./grain-gradient";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GrainGradient {...p} />
      <Title>Grain Gradient</Title>
    </>
  );
}
