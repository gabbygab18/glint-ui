"use client";

import { Title } from "../../demo-kit";
import { InkFluid } from "./ink-fluid";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <InkFluid {...p} />
      <Title>Ink Fluid</Title>
    </>
  );
}
