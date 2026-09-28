"use client";

import { Title } from "../../demo-kit";
import { PlasmaWave } from "./plasma-wave";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PlasmaWave {...p} />
      <Title>Plasma Wave</Title>
    </>
  );
}
