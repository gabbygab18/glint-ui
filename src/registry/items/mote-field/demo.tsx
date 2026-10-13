"use client";

import { Title } from "../../demo-kit";
import { MoteField } from "./mote-field";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <MoteField {...p} />
      <Title>Mote Field</Title>
    </>
  );
}
