"use client";

import { Title } from "../../demo-kit";
import { ChargeBand } from "./charge-band";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <ChargeBand {...p} />
      <Title>Charge Band</Title>
    </>
  );
}
