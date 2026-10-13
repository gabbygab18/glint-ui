"use client";

import { Title } from "../../demo-kit";
import { BitFlurry } from "./bit-flurry";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BitFlurry {...p} />
      <Title>Bit Flurry</Title>
    </>
  );
}
