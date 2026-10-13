"use client";

import { Title } from "../../demo-kit";
import { PinMatrix } from "./pin-matrix";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <PinMatrix {...p} />
      <Title>Pin Matrix</Title>
    </>
  );
}
