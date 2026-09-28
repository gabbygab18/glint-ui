"use client";

import { Title } from "../../demo-kit";
import { GradientWaves } from "./gradient-waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <GradientWaves {...p} />
      <Title>Gradient Waves</Title>
    </>
  );
}
