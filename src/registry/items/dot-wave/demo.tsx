"use client";

import { Title } from "../../demo-kit";
import { DotWave } from "./dot-wave";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DotWave {...p} />
      <Title>Dot Wave</Title>
    </>
  );
}
