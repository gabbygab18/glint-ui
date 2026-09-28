"use client";

import { Title } from "../../demo-kit";
import { DualSparks } from "./dual-sparks";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <DualSparks {...p} />
      <Title>Dual Sparks</Title>
    </>
  );
}
