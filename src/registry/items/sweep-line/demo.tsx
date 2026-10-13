"use client";

import { Title } from "../../demo-kit";
import { SweepLine } from "./sweep-line";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <SweepLine {...p} />
      <Title>Sweep Line</Title>
    </>
  );
}
