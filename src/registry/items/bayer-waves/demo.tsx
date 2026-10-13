"use client";

import { Title } from "../../demo-kit";
import { BayerWaves } from "./bayer-waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BayerWaves {...p} />
      <Title>Bayer Waves</Title>
    </>
  );
}
