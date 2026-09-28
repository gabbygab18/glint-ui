"use client";

import { Title } from "../../demo-kit";
import { VenomBeam } from "./venom-beam";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <VenomBeam {...p} />
      <Title>Venom Beam</Title>
    </>
  );
}
