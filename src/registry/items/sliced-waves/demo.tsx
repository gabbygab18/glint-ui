"use client";

import { Title } from "../../demo-kit";
import { SlicedWaves } from "./sliced-waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SlicedWaves {...p} />
      <Title>Sliced Waves</Title>
    </>
  );
}
