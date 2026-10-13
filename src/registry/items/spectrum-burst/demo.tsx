"use client";

import { Title } from "../../demo-kit";
import { SpectrumBurst } from "./spectrum-burst";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SpectrumBurst {...p} />
      <Title>Spectrum Burst</Title>
    </>
  );
}
