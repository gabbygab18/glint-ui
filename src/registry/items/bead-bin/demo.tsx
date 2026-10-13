"use client";

import { Title } from "../../demo-kit";
import { BeadBin } from "./bead-bin";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <BeadBin {...p} />
      <Title>Bead Bin</Title>
    </>
  );
}
