"use client";

import { Title } from "../../demo-kit";
import { LineWaves } from "./line-waves";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <LineWaves {...p} />
      <Title>Line Waves</Title>
    </>
  );
}
