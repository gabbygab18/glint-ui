"use client";

import { Title } from "../../demo-kit";
import { BarsWave } from "./bars-wave";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BarsWave {...p} />
      <Title>Bars Wave</Title>
    </>
  );
}
